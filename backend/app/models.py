from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class TeamMarketLive(Base):
    __tablename__ = "team_market_live"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(50), unique=True, index=True, nullable=False)

    # current market/sentiment info
    sentiment_score = Column(Float, nullable=True)
    price = Column(Float, nullable=False)
    open = Column(Float, nullable=True)
    high = Column(Float, nullable=True)
    low = Column(Float, nullable=True)
    close = Column(Float, nullable=True)
    volume = Column(Integer, default=0)
    change = Column(Float, default=0.0)  # percent or absolute delta since last tick

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TeamMarketHistory(Base):
    __tablename__ = "team_market_history"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(50), index=True, nullable=False)
    
    sentiment_score = Column(Float, nullable=True)
    price = Column(Float, nullable=False)
    open = Column(Float, nullable=True)
    high = Column(Float, nullable=True)
    low = Column(Float, nullable=True)
    close = Column(Float, nullable=True)
    volume = Column(Integer, default=0)
    change = Column(Float, default=0.0)

    timestamp = Column(DateTime, default=datetime.utcnow, index=True)