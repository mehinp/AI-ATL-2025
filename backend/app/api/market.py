from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import SessionLocal
from app.models import TeamMarketInformation

router = APIRouter(prefix="/market", tags=["Market"])

# ============================================================
# Database Dependency
# ============================================================
async def get_db():
    async with SessionLocal() as session:
        yield session


# ============================================================
# Constants
# ============================================================
DIVISIONS = {
    "AFC North", "AFC South", "AFC East", "AFC West",
    "NFC North", "NFC South", "NFC East", "NFC West"
}

def is_etf(name: str) -> bool:
    return name in DIVISIONS


# ============================================================
# /team/{team_name} — Price History for a Single Instrument
# ============================================================
@router.get("/team/{team_name}")
async def get_team_value(team_name: str, db: AsyncSession = Depends(get_db)):
    """Return full price history for a given team or ETF."""
    result = await db.execute(
        select(TeamMarketInformation)
        .where(TeamMarketInformation.team_name == team_name)
        .order_by(TeamMarketInformation.timestamp.asc())
    )
    rows = result.scalars().all()

    if not rows:
        raise HTTPException(status_code=404, detail=f"Instrument '{team_name}' not found")

    return [
        {
            "team_name": r.team_name,
            "value": r.value,
            "timestamp": r.timestamp,
            "type": "ETF" if is_etf(r.team_name) else "Team"
        }
        for r in rows
    ]


# ============================================================
# /all-teams — Latest Prices for All Teams and ETFs
# ============================================================
@router.get("/all-teams")
async def get_all_teams(db: AsyncSession = Depends(get_db)):
    """
    Return the latest price per instrument (teams + division ETFs),
    separated into 'teams' and 'etfs' groups for frontend rendering.
    """
    result = await db.execute(select(TeamMarketInformation))
    rows = result.scalars().all()

    # Keep only the latest entry per unique team_name
    latest = {}
    for r in rows:
        if r.team_name not in latest or r.timestamp > latest[r.team_name].timestamp:
            latest[r.team_name] = r

    teams, etfs = [], []

    for name, rec in latest.items():
        item = {
            "team_name": rec.team_name,
            "value": f"{rec.value:.2f}",
            "timestamp": rec.timestamp,
            "type": "ETF" if is_etf(name) else "Team"
        }
        (etfs if is_etf(name) else teams).append(item)

    return {
        "teams": sorted(teams, key=lambda x: x["team_name"]),
        "etfs": sorted(etfs, key=lambda x: x["team_name"])
    }
