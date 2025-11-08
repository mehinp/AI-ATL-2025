from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import SessionLocal
from app.models import TeamMarketInformation, User

router = APIRouter(prefix="/trades", tags=["Trade"])