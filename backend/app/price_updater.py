import asyncio
import random
from datetime import datetime
from decimal import Decimal
from sqlalchemy import select, func
from app.database import SessionLocal
from app.models import User, Trades, TeamMarketInformation, PortfolioHistory

# ============================================================
# Division ETF Mapping (use your city names exactly)
# ============================================================
DIVISION_MAP = {
    "AFC North": ["Baltimore", "Cincinnati", "Cleveland", "Pittsburgh"],
    "AFC South": ["Houston", "Indianapolis", "Jacksonville", "Tennessee"],
    "AFC East": ["Buffalo", "Miami", "New England", "New York J"],
    "AFC West": ["Denver", "Kansas City", "Las Vegas", "Los Angeles C"],
    "NFC North": ["Chicago", "Detroit", "Green Bay", "Minnesota"],
    "NFC South": ["Atlanta", "Carolina", "New Orleans", "Tampa Bay"],
    "NFC East": ["Dallas", "New York G", "Philadelphia", "Washington"],
    "NFC West": ["Arizona", "Los Angeles R", "San Francisco", "Seattle"],
}

# ============================================================
# Random Price Fluctuation (Mean-Reverting, No Drift)
# ============================================================
def randomize_value(curr_value: float, init_value: float) -> float:
    """Return a mean-reverting, bounded random price with stable long-term behavior."""
    if init_value <= 0:
        init_value = curr_value or 1.0

    # Deviation from the equilibrium anchor
    deviation = (curr_value - init_value) / init_value

    mean_reversion_strength = 0.08   # slightly softer reversion
    volatility = 0.035 * (1 - abs(deviation))
    volatility = max(0.01, volatility)

    delta_factor = -mean_reversion_strength * deviation + random.uniform(-volatility, volatility)
    new_value = curr_value * (1 + delta_factor)

    # Keep within ±75% of the initial anchor
    new_value = max(0.25 * init_value, min(new_value, 1.75 * init_value))
    return round(new_value, 2)


# ============================================================
# Portfolio Balance Recorder
# ============================================================
async def record_portfolio_balances(session):
    """Recalculate and log total portfolio balance for every user."""
    users = (await session.execute(select(User))).scalars().all()

    for user in users:
        total_value = Decimal(str(user.balance))

        trades = (await session.execute(
            select(Trades).where(Trades.user_id == user.id)
        )).scalars().all()

        holdings = {}
        for t in trades:
            holdings[t.team_name] = holdings.get(t.team_name, 0)
            holdings[t.team_name] += t.quantity if t.action == "buy" else -t.quantity

        for team, qty in holdings.items():
            if qty <= 0:
                continue
            price_row = await session.execute(
                select(TeamMarketInformation.value)
                .where(TeamMarketInformation.team_name == team)
                .order_by(TeamMarketInformation.timestamp.desc())
                .limit(1)
            )
            price = price_row.scalar_one_or_none()
            if price:
                total_value += Decimal(str(price)) * qty

        session.add(PortfolioHistory(
            user_id=user.id,
            balance=float(total_value),
            timestamp=datetime.utcnow()
        ))

    await session.commit()
    print(f"💰 Recorded balances for {len(users)} users @ {datetime.utcnow():%H:%M:%S}")


# ============================================================
# ETF Computation Helper
# ============================================================
async def compute_etf_values(session):
    """Compute each division ETF as the average of its member team prices."""
    now = datetime.utcnow()
    etf_entries = []

    res = await session.execute(
        select(TeamMarketInformation.team_name, func.max(TeamMarketInformation.timestamp))
        .group_by(TeamMarketInformation.team_name)
    )
    latest_times = {team: ts for team, ts in res.all()}

    latest_prices = {}
    for team, ts in latest_times.items():
        val_row = await session.execute(
            select(TeamMarketInformation.value)
            .where(TeamMarketInformation.team_name == team)
            .order_by(TeamMarketInformation.timestamp.desc())
            .limit(1)
        )
        val = val_row.scalar_one_or_none()
        if val is not None:
            latest_prices[team] = float(val)

    for division, members in DIVISION_MAP.items():
        prices = [latest_prices[m] for m in members if m in latest_prices]
        if len(prices) == len(members):
            avg_val = round(sum(prices) / len(prices), 2)
            etf_entries.append(TeamMarketInformation(
                team_name=division,
                value=avg_val,
                timestamp=now
            ))
        else:
            missing = [m for m in members if m not in latest_prices]
            print(f"⚠️ Missing prices for {division}: {missing}")

    session.add_all(etf_entries)
    await session.commit()
    print(f"📊 Computed {len(etf_entries)} division ETFs @ {now:%H:%M:%S}")


# ============================================================
# Price Updater Loop (Fixed Anchor Logic)
# ============================================================
async def update_prices_loop():
    """Continuously randomize team prices, compute ETFs, and log balances every 5 seconds."""
    print("🏈 Starting price updater loop (with division ETFs)...")
    async with SessionLocal() as session:
        # ✅ Use most recent prices as stable anchors (not min values)
        res_init = await session.execute(
            select(TeamMarketInformation.team_name, TeamMarketInformation.value)
            .order_by(TeamMarketInformation.timestamp.desc())
        )
        initial_prices = {}
        for rec in res_init.scalars().all():
            # Because .scalars() gives only values, we fetch again properly
            break  # fallback fix below

        # Correct fetch for both name and value
        res_latest = await session.execute(
            select(TeamMarketInformation.team_name, TeamMarketInformation.value)
            .order_by(TeamMarketInformation.timestamp.desc())
        )
        rows = res_latest.all()
        for team, value in rows:
            if team not in initial_prices:
                initial_prices[team] = float(value)

        while True:
            res = await session.execute(
                select(TeamMarketInformation)
                .order_by(TeamMarketInformation.timestamp.desc())
            )
            latest_records = res.scalars().all()

            teams_seen = set()
            new_entries = []
            now = datetime.utcnow()

            for rec in latest_records:
                if rec.team_name in teams_seen:
                    continue
                teams_seen.add(rec.team_name)

                init_val = initial_prices.get(rec.team_name, rec.value)
                new_val = randomize_value(float(rec.value), init_val)

                new_entries.append(TeamMarketInformation(
                    team_name=rec.team_name,
                    value=new_val,
                    timestamp=now
                ))

            session.add_all(new_entries)
            await session.commit()
            print(f"✅ Updated {len(new_entries)} teams @ {now:%H:%M:%S}")

            await compute_etf_values(session)
            await record_portfolio_balances(session)
            await asyncio.sleep(5)


# ============================================================
# Entrypoint
# ============================================================
if __name__ == "__main__":
    try:
        asyncio.run(update_prices_loop())
    except KeyboardInterrupt:
        print("⏹️ Price updater stopped manually.")
