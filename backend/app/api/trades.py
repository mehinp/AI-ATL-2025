from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.database import SessionLocal
from app.models import User, Trades, TeamMarketInformation, PortfolioHistory
from app.api.auth import get_current_user

router = APIRouter(prefix="/trades", tags=["Trades"])

# ============================================================
# Schemas
# ============================================================
class BuyIn(BaseModel):
    team_name: str
    quantity: int = Field(gt=0)

class SellIn(BaseModel):
    team_name: str
    quantity: int = Field(gt=0)

class TradeOut(BaseModel):
    success: bool
    team_name: str
    quantity: int
    price: str
    balance: str
    type: str | None = None
    message: str | None = None

class PositionOut(BaseModel):
    team_name: str
    quantity: int
    avg_buy_price: str
    current_price: str
    position_value: str
    cost_basis: str
    unrealized_pnl: str
    last_transaction: str
    type: str | None = None

class PortfolioOut(BaseModel):
    positions: list[PositionOut]
    total_value: str
    total_unrealized_pnl: str


# ============================================================
# DB dependency
# ============================================================
async def get_db():
    async with SessionLocal() as session:
        yield session


# ============================================================
# Helpers
# ============================================================
DIVISIONS = {
    "AFC North", "AFC South", "AFC East", "AFC West",
    "NFC North", "NFC South", "NFC East", "NFC West"
}

def is_etf(name: str) -> bool:
    return name in DIVISIONS


async def get_current_price(db: AsyncSession, team_name: str) -> Decimal:
    """Get the latest market price for any instrument (team or ETF)."""
    res = await db.execute(
        select(TeamMarketInformation)
        .where(TeamMarketInformation.team_name == team_name)
        .order_by(desc(TeamMarketInformation.timestamp))
        .limit(1)
    )
    info = res.scalar_one_or_none()
    if not info or info.value is None:
        raise HTTPException(404, detail=f"No price data for '{team_name}'")
    return Decimal(str(info.value))


async def compute_positions(db: AsyncSession, user_id: int):
    """Compute user holdings and unrealized PnL."""
    res_trades = await db.execute(select(Trades).where(Trades.user_id == user_id))
    trades = res_trades.scalars().all()

    positions = {}
    for t in trades:
        if t.team_name not in positions:
            positions[t.team_name] = {"qty": 0, "cost": Decimal("0"), "last_txn": t.timestamp}
        if t.action == "buy":
            positions[t.team_name]["qty"] += t.quantity
            positions[t.team_name]["cost"] += Decimal(str(t.price)) * t.quantity
        elif t.action == "sell":
            positions[t.team_name]["qty"] -= t.quantity
            if positions[t.team_name]["qty"] <= 0:
                positions[t.team_name]["qty"] = 0
                positions[t.team_name]["cost"] = Decimal("0")
        if t.timestamp > positions[t.team_name]["last_txn"]:
            positions[t.team_name]["last_txn"] = t.timestamp

    portfolio = []
    total_value = Decimal("0")
    total_unrealized = Decimal("0")

    for team, data in positions.items():
        qty = data["qty"]
        if qty <= 0:
            continue
        avg_buy_price = data["cost"] / qty
        current_price = await get_current_price(db, team)
        position_value = current_price * qty
        cost_basis = avg_buy_price * qty
        unrealized_pnl = position_value - cost_basis

        total_value += position_value
        total_unrealized += unrealized_pnl

        portfolio.append(PositionOut(
            team_name=team,
            quantity=qty,
            avg_buy_price=f"{avg_buy_price:.2f}",
            current_price=f"{current_price:.2f}",
            position_value=f"{position_value:.2f}",
            cost_basis=f"{cost_basis:.2f}",
            unrealized_pnl=f"{unrealized_pnl:.2f}",
            last_transaction=data["last_txn"].strftime("%Y-%m-%d %H:%M:%S"),
            type="ETF" if is_etf(team) else "Team"
        ))

    return portfolio, total_value, total_unrealized


# ============================================================
# /buy
# ============================================================
@router.post("/buy", response_model=TradeOut)
async def buy_stock(payload: BuyIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Buy shares of a team or ETF."""
    exists = await db.execute(
        select(TeamMarketInformation.team_name)
        .where(TeamMarketInformation.team_name == payload.team_name)
        .limit(1)
    )
    if not exists.scalar_one_or_none():
        raise HTTPException(404, detail=f"'{payload.team_name}' not found in market data")

    user = (await db.execute(select(User).where(User.id == current_user.id))).scalar_one()
    price = await get_current_price(db, payload.team_name)
    cost = price * payload.quantity
    balance = Decimal(str(user.balance))

    if balance < cost:
        raise HTTPException(400, detail=f"Insufficient balance (${balance:.2f} < ${cost:.2f})")

    user.balance = float(balance - cost)
    db.add(Trades(
        user_id=user.id,
        team_name=payload.team_name,
        action="buy",
        quantity=payload.quantity,
        price=float(price),
        balance_after_trade=user.balance,
        timestamp=datetime.utcnow()
    ))
    await db.commit()

    return TradeOut(
        success=True,
        team_name=payload.team_name,
        quantity=payload.quantity,
        price=f"{price:.2f}",
        balance=f"{user.balance:.2f}",
        type="ETF" if is_etf(payload.team_name) else "Team",
        message=f"Bought {payload.quantity} {payload.team_name} @ ${price:.2f}"
    )


# ============================================================
# /sell
# ============================================================
@router.post("/sell", response_model=TradeOut)
async def sell_stock(payload: SellIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Sell shares of a team or ETF."""
    exists = await db.execute(
        select(TeamMarketInformation.team_name)
        .where(TeamMarketInformation.team_name == payload.team_name)
        .limit(1)
    )
    if not exists.scalar_one_or_none():
        raise HTTPException(404, detail=f"'{payload.team_name}' not found in market data")

    user = (await db.execute(select(User).where(User.id == current_user.id))).scalar_one()
    res = await db.execute(select(Trades).where(Trades.user_id == user.id, Trades.team_name == payload.team_name))
    trades = res.scalars().all()
    owned_qty = sum(t.quantity if t.action == "buy" else -t.quantity for t in trades)

    if owned_qty < payload.quantity:
        return TradeOut(
            success=False,
            team_name=payload.team_name,
            quantity=0,
            price="0.00",
            balance=f"{user.balance:.2f}",
            type="ETF" if is_etf(payload.team_name) else "Team",
            message=f"Sell failed: You only have {owned_qty} {payload.team_name}."
        )

    price = await get_current_price(db, payload.team_name)
    proceeds = price * payload.quantity
    user.balance = float(Decimal(str(user.balance)) + proceeds)

    db.add(Trades(
        user_id=user.id,
        team_name=payload.team_name,
        action="sell",
        quantity=payload.quantity,
        price=float(price),
        balance_after_trade=user.balance,
        timestamp=datetime.utcnow()
    ))
    await db.commit()

    return TradeOut(
        success=True,
        team_name=payload.team_name,
        quantity=payload.quantity,
        price=f"{price:.2f}",
        balance=f"{user.balance:.2f}",
        type="ETF" if is_etf(payload.team_name) else "Team",
        message=f"Sold {payload.quantity} {payload.team_name} @ ${price:.2f}"
    )


# ============================================================
# /portfolio
# ============================================================
@router.get("/portfolio", response_model=PortfolioOut)
async def get_all_holdings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return all holdings with unrealized PnL."""
    portfolio, total_value, total_unrealized = await compute_positions(db, current_user.id)
    return PortfolioOut(
        positions=portfolio,
        total_value=f"{total_value:.2f}",
        total_unrealized_pnl=f"{total_unrealized:.2f}"
    )


@router.get("/portfolio:{index}", response_model=PositionOut)
async def get_single_holding(index: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return a specific holding by index."""
    portfolio, _, _ = await compute_positions(db, current_user.id)
    if not portfolio:
        raise HTTPException(404, detail="No holdings")
    if index < 1 or index > len(portfolio):
        raise HTTPException(404, detail=f"Index {index} out of range (1–{len(portfolio)})")
    return portfolio[index - 1]


# ============================================================
# /portfolio/history (live)
# ============================================================
@router.get("/portfolio/history")
async def get_live_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return portfolio balance history from background updater."""
    res = await db.execute(
        select(PortfolioHistory.timestamp, PortfolioHistory.balance)
        .where(PortfolioHistory.user_id == current_user.id)
        .order_by(PortfolioHistory.timestamp.asc())
    )
    rows = res.all()
    if not rows:
        return {"user_id": current_user.id, "history": []}

    history = [
        {"timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"), "balance": f"{bal:.2f}"}
        for ts, bal in rows
    ]
    return {"user_id": current_user.id, "history": history}


# ============================================================
# /portfolio/history/current
# ============================================================
@router.get("/portfolio/history/current")
async def get_current_snapshot(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return the most recent portfolio snapshot."""
    res = await db.execute(
        select(PortfolioHistory.timestamp, PortfolioHistory.balance)
        .where(PortfolioHistory.user_id == current_user.id)
        .order_by(PortfolioHistory.timestamp.desc())
        .limit(1)
    )
    row = res.first()
    if not row:
        return {"message": "No balance history found"}
    ts, bal = row
    return {"timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"), "balance": f"{bal:.2f}"}


# ============================================================
# /portfolio/history/recomputed (legacy)
# ============================================================
async def compute_history(db: AsyncSession, user_id: int):
    """Recompute portfolio history from trades."""
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one()
    trades = (await db.execute(select(Trades).where(Trades.user_id == user_id).order_by(Trades.timestamp.asc()))).scalars().all()
    initial = Decimal(str(user.initial_deposit))
    holdings, cost_basis, history = {}, {}, []

    if not trades:
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        return [{
            "timestamp": now,
            "initial_deposit": f"{initial:.2f}",
            "current_total_account_value": f"{initial:.2f}",
            "current_cash_balance": f"{initial:.2f}",
            "cost_basis": "0.00",
            "pnl": "0.00"
        }]

    async def get_price_at(team: str, t: datetime) -> Decimal:
        res = await db.execute(
            select(TeamMarketInformation)
            .where(TeamMarketInformation.team_name == team,
                   TeamMarketInformation.timestamp <= t)
            .order_by(TeamMarketInformation.timestamp.desc())
            .limit(1)
        )
        rec = res.scalar_one_or_none()
        return Decimal(str(rec.value)) if rec and rec.value else Decimal("0")

    for tr in trades:
        team, price, qty = tr.team_name, Decimal(str(tr.price)), tr.quantity
        if tr.action == "buy":
            holdings[team] = holdings.get(team, 0) + qty
            cost_basis[team] = cost_basis.get(team, Decimal("0")) + (price * qty)
        elif tr.action == "sell":
            if holdings.get(team, 0) < qty:
                continue
            avg_cost = cost_basis.get(team, Decimal("0")) / Decimal(max(holdings[team], 1))
            holdings[team] -= qty
            cost_basis[team] -= avg_cost * qty
            if holdings[team] <= 0:
                cost_basis[team] = Decimal("0")

        total_cost = sum(cost_basis.values())
        cash = initial - total_cost
        value = Decimal("0")
        for tm, q in holdings.items():
            if q > 0:
                value += await get_price_at(tm, tr.timestamp) * q
        total_value = cash + value
        pnl = total_value - initial
        history.append({
            "timestamp": tr.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "initial_deposit": f"{initial:.2f}",
            "current_total_account_value": f"{total_value:.2f}",
            "current_cash_balance": f"{cash:.2f}",
            "cost_basis": f"{total_cost:.2f}",
            "pnl": f"{pnl:.2f}"
        })

    return history


@router.get("/portfolio/history/recomputed")
async def get_recomputed_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Legacy recomputed portfolio history from trade records."""
    history = await compute_history(db, current_user.id)
    return {"user_id": current_user.id, "history": history}


