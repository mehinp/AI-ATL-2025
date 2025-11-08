import bcrypt, secrets
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import SessionLocal
from app.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])

# ----------------------------
# Schemas
# ----------------------------
class SignupIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str
    balance: float = Field(ge=0)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    success: bool = True
    access_token: str
    token_type: str = "x-header"
    user_id: int

# ----------------------------
# Token store
# ----------------------------
SESSION_TOKENS = {}
TOKEN_LIFETIME = timedelta(days=7)

def make_token(user_id: int) -> str:
    token = secrets.token_hex(32)
    expires_at = datetime.utcnow() + TOKEN_LIFETIME
    SESSION_TOKENS[token] = (user_id, expires_at)
    return token

def validate_token(token: str) -> int:
    data = SESSION_TOKENS.get(token)
    if not data:
        raise HTTPException(401, detail="Invalid or expired token")
    user_id, expires_at = data
    if datetime.utcnow() > expires_at:
        del SESSION_TOKENS[token]
        raise HTTPException(401, detail="Session expired")
    return user_id

# ----------------------------
# DB dependency
# ----------------------------
async def get_db():
    async with SessionLocal() as session:
        yield session

# ----------------------------
# Auth helpers
# ----------------------------
async def create_user(email: str, password_hash: str, balance: float, db: AsyncSession):
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(400, detail="Email already registered")
    user = User(email=email, password=password_hash, balance=balance, initial_deposit=balance)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def authenticate_user(email: str, password: str, db: AsyncSession) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        return None
    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return None
    return user

# ----------------------------
# Dependency for protected routes
# ----------------------------
async def get_current_user(
    x_auth_header: Optional[str] = Header(None, alias="X-Auth-Header"),
    db: AsyncSession = Depends(get_db)
):
    if not x_auth_header:
        raise HTTPException(401, detail="Missing X-Auth-Header")
    user_id = validate_token(x_auth_header)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, detail="User not found")
    return user

# ----------------------------
# Routes
# ----------------------------
@router.post("/signup", response_model=TokenOut, status_code=201)
async def signup(payload: SignupIn, db: AsyncSession = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(400, detail="Passwords do not match")
    hashed = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()
    user = await create_user(payload.email, hashed, payload.balance, db)
    token = make_token(user.id)
    return TokenOut(access_token=token, user_id=user.id)

@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(payload.email, payload.password, db)
    if not user:
        raise HTTPException(401, detail="Invalid email or password")
    token = make_token(user.id)
    return TokenOut(access_token=token, user_id=user.id)
