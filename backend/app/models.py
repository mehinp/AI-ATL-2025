from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class TeamMarketInformation(Base):
    __tablename__ = "team_market_information"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(50), index=True, nullable=False)
    value = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(50), index=True, nullable=False)
    password = Column(String(250), nullable=False)
    balance = Column(Float, default=100, nullable=False)
    initial_deposit = Column(Float, default=100, nullable=False)

    # establish relationship with trades
    trades = relationship("Trades", back_populates="user")


class Trades(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    team_name = Column(String(50), nullable=False)
    action = Column(String(10), nullable=False)  # 'buy' or 'sell'
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="trades")

from sqlalchemy import event
from decimal import Decimal
from sqlalchemy.orm import Session

@event.listens_for(Trades, "after_insert")
def update_user_balance(mapper, connection, trade):
    """
    Automatically update user's balance when a trade is inserted.
    This works even outside API calls.
    """
    # Get the user's current balance
    user_balance_query = connection.execute(
        f"SELECT balance FROM user WHERE id = {trade.user_id}"
    )
    row = user_balance_query.fetchone()
    if not row:
        return

    balance = Decimal(str(row[0]))

    # Calculate price impact
    trade_cost = Decimal(str(trade.price)) * Decimal(str(trade.quantity))
    if trade.action == "buy":
        balance -= trade_cost
    elif trade.action == "sell":
        balance += trade_cost

    # Update balance in the database
    connection.execute(
        f"UPDATE user SET balance = {float(balance)} WHERE id = {trade.user_id}"
    )

