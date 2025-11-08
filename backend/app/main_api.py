import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, market, trades
from app.price_updater import update_prices_loop

app = FastAPI(title="NFL Stock Trader API")

# ---------------------------
# CORS Setup
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # relax for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Register Routes
# ---------------------------
app.include_router(auth.router)
app.include_router(market.router)
app.include_router(trades.router)

# ---------------------------
# Startup: Background Price Updater
# ---------------------------
@app.on_event("startup")
async def start_price_updater():
    """Launch background task that randomizes team prices and logs balances."""
    print("🚀 Launching background price updater loop...")
    asyncio.create_task(update_prices_loop())

# ---------------------------
# Root Endpoint
# ---------------------------
@app.get("/")
def root():
    return {"message": "API is running"}