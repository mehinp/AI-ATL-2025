from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import SessionLocal
from app.models import User, Trades, TeamMarketInformation
from app.api.auth import get_current_user

router = APIRouter(prefix="/trades", tags=["Trades"])

# ---------------------------
# Schemas
# ---------------------------
class BuyIn(BaseModel):
    team_name: str
    quantity: int = Field(gt=0)

class SellIn(BaseModel):
    team_name: str
    quantity: int = Field(gt=0)

class TradeOut(BaseModel):
    success: bool = True
    team_name: str
    quantity: int
    price: str
    balance: str

class PositionOut(BaseModel):
    team_name: str
    quantity: int
    avg_price: str
    last_transaction: str

class PortfolioOut(BaseModel):
    balance: str
    positions: list[PositionOut]

# ---------------------------
# Database dependency
# ---------------------------
async def get_db():
    async with SessionLocal() as session:
        yield session

# ---------------------------
# Helpers
# ---------------------------
async def get_current_price(db: AsyncSession, team_name: str) -> Decimal:
    result = await db.execute(
        select(TeamMarketInformation)
        .where(TeamMarketInformation.team_name == team_name)
        .order_by(TeamMarketInformation.timestamp.desc())
        .limit(1)
    )
    team_info = result.scalar_one_or_none()
    if not team_info or team_info.value is None:
        raise HTTPException(status_code=404, detail=f"No price data for '{team_name}'")
    return Decimal(str(team_info.value))


# ---------------------------
# POST /trades/buy
# ---------------------------
@router.post("/buy", response_model=TradeOut)
async def buy_stock(
    payload: BuyIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Re-query the user in the current DB session
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one()

    price = await get_current_price(db, payload.team_name)
    cost = Decimal(str(price)) * payload.quantity
    balance = Decimal(str(user.balance))

    if balance < cost:
        raise HTTPException(400, detail=f"Insufficient balance (${balance:.2f} < ${cost:.2f})")

    user.balance = float(balance - cost)

    # Record the trade
    trade = Trades(
        user_id=user.id,
        team_name=payload.team_name,
        action="buy",
        quantity=payload.quantity,
        price=float(price),
    )
    db.add(trade)
    await db.commit()

    return TradeOut(
        team_name=payload.team_name,
        quantity=payload.quantity,
        price=f"{price:.2f}",
        balance=f"{user.balance:.2f}"
    )


# ---------------------------
# POST /trades/sell
# ---------------------------
@router.post("/sell", response_model=TradeOut)
async def sell_stock(
    payload: SellIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Re-query user
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one()

    price = await get_current_price(db, payload.team_name)
    proceeds = price * payload.quantity

    # Get all trades for this team
    result = await db.execute(
        select(Trades).where(Trades.user_id == user.id, Trades.team_name == payload.team_name)
    )
    trades = result.scalars().all()

    owned_qty = sum(t.quantity if t.action == "buy" else -t.quantity for t in trades)

    if owned_qty < payload.quantity:
        raise HTTPException(400, detail=f"Not enough shares to sell. You have {owned_qty}")

    # Update user balance
    user.balance = float(Decimal(str(user.balance)) + proceeds)

    # Record sell trade
    trade = Trades(
        user_id=user.id,
        team_name=payload.team_name,
        action="sell",
        quantity=payload.quantity,
        price=float(price),
    )
    db.add(trade)
    await db.commit()

    return TradeOut(
        team_name=payload.team_name,
        quantity=payload.quantity,
        price=f"{price:.2f}",
        balance=f"{user.balance:.2f}"
    )


# ---------------------------
# GET /trades/portfolio
# ---------------------------
@router.get("/portfolio", response_model=PortfolioOut)
async def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result_user = await db.execute(select(User).where(User.id == current_user.id))
    user = result_user.scalar_one()

    result = await db.execute(select(Trades).where(Trades.user_id == user.id))
    trades = result.scalars().all()

    # Aggregate live positions
    positions = {}
    positions = {}
    for t in trades:
        if t.team_name not in positions:
            positions[t.team_name] = {"qty": 0, "cost": 0.0, "last_txn": t.timestamp}

        # Update last transaction date
        if t.timestamp > positions[t.team_name]["last_txn"]:
            positions[t.team_name]["last_txn"] = t.timestamp

        if t.action == "buy":
            positions[t.team_name]["qty"] += t.quantity
            positions[t.team_name]["cost"] += t.price * t.quantity
        else:  # sell
            positions[t.team_name]["qty"] -= t.quantity
            if positions[t.team_name]["qty"] > 0:
                avg_price_before = positions[t.team_name]["cost"] / (
                    positions[t.team_name]["qty"] + t.quantity
                )
                positions[t.team_name]["cost"] -= avg_price_before * t.quantity
            else:
                positions[t.team_name]["cost"] = 0


    portfolio = []
    for team, data in positions.items():
        if data["qty"] > 0:
            avg_price = data["cost"] / data["qty"]
            portfolio.append(
                PositionOut(
                    team_name=team,
                    quantity=data["qty"],
                    avg_price=f"{avg_price:.2f}",
                    last_transaction=data["last_txn"].strftime("%Y-%m-%d %H:%M:%S")
                )
            )


    return PortfolioOut(balance=f"{user.balance:.2f}", positions=portfolio)
