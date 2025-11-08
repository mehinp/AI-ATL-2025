import asyncio
import random
import math
from datetime import datetime
from decimal import Decimal
from sqlalchemy import select, func
from app.database import SessionLocal
from app.models import User, Trades, TeamMarketInformation, PortfolioHistory

# ============================================================
# Random Price Fluctuation (Mean-Reverting, No Drift)
# ============================================================
def randomize_value(curr_value: float, init_value: float) -> float:
    """Return a mean-reverting, bounded random price with stable long-term behavior."""
    if init_value <= 0:
        init_value = curr_value or 1.0  # safety fallback

    # Deviation from anchor price
    deviation = (curr_value - init_value) / init_value

    # Mean reversion strength — how fast it pulls toward the anchor
    mean_reversion_strength = 0.1

    # Volatility decreases as price diverges from initial value
    volatility = 0.04 * (1 - abs(deviation))
    volatility = max(0.01, volatility)  # ensure some baseline movement

    # Mean-reverting random change
    delta_factor = -mean_reversion_strength * deviation + random.uniform(-volatility, volatility)

    # Apply change multiplicatively
    new_value = curr_value * (1 + delta_factor)

    # Keep prices within ±50% of the initial anchor
    new_value = max(0.5 * init_value, min(new_value, 1.5 * init_value))

    return round(new_value, 2)


# ============================================================
# Portfolio Balance Recorder
# ============================================================
async def record_portfolio_balances(session):
    """Recalculate and log total portfolio balance for every user."""
    users = (await session.execute(select(User))).scalars().all()

    for user in users:
        total_value = Decimal(str(user.balance))

        # Fetch all user trades
        trades = (await session.execute(
            select(Trades).where(Trades.user_id == user.id)
        )).scalars().all()

        # Aggregate net quantities per team
        holdings = {}
        for t in trades:
            holdings[t.team_name] = holdings.get(t.team_name, 0)
            holdings[t.team_name] += t.quantity if t.action == "buy" else -t.quantity

        # Add market value of all open positions
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

        # Insert portfolio snapshot
        session.add(PortfolioHistory(
            user_id=user.id,
            balance=float(total_value),
            timestamp=datetime.utcnow()
        ))

    await session.commit()
    print(f"💰 Recorded balances for {len(users)} users @ {datetime.utcnow():%H:%M:%S}")


# ============================================================
# Price Updater Loop
# ============================================================
async def update_prices_loop():
    """Continuously randomize team prices and log balances every 5 seconds."""
    print("🏈 Starting price updater loop...")
    async with SessionLocal() as session:
        # Cache each team’s initial reference price
        res_init = await session.execute(
            select(TeamMarketInformation.team_name, func.min(TeamMarketInformation.value))
            .group_by(TeamMarketInformation.team_name)
        )
        initial_prices = {team: float(val) for team, val in res_init.all()}

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

            # Record portfolio balance snapshots
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
