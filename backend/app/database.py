import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("MYSQL_PUBLIC_URL")  # pulled from Railway env

engine = create_async_engine(DATABASE_URL.replace("mysql://", "mysql+aiomysql://"), echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()
