from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

# Example of your existing models
class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    balance = Column(Float, default=0)
    initial_deposit = Column(Float, default=0)

class Trades(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    team_name = Column(String(50), nullable=False)
    action = Column(String(10), nullable=False)  # "buy" or "sell"
    quantity = Column(Integer, nullable=False)
    balance_after_trade = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class TeamMarketInformation(Base):
    __tablename__ = "team_market_information"
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

# 🆕 NEW: Stores time-series of portfolio balances
class PortfolioHistory(Base):
    __tablename__ = "portfolio_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    balance = Column(Float, nullable=False)
