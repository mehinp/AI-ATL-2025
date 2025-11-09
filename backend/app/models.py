from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    balance = Column(Float, default=0)
    initial_deposit = Column(Float, default=0)

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', balance={self.balance})>"


class Trades(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    team_name = Column(String(50), nullable=False)
    action = Column(String(10), nullable=False)  # "buy" or "sell"
    quantity = Column(Integer, nullable=False)
    balance_after_trade = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Trade(user_id={self.user_id}, {self.action} {self.quantity} {self.team_name} @ {self.price})>"


class TeamMarketInformation(Base):
    __tablename__ = "team_market_information"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(50), nullable=False, index=True)
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<TeamMarketInformation(team='{self.team_name}', value={self.value}, time={self.timestamp})>"


class PortfolioHistory(Base):
    __tablename__ = "portfolio_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    balance = Column(Float, nullable=False)

    def __repr__(self):
        return f"<PortfolioHistory(user_id={self.user_id}, balance={self.balance}, time={self.timestamp})>"
