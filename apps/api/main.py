"""PLAT-002: FastAPI app — health check, startup validation, CORS, router wiring."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.routers import health, lanes, accounts
from services.config import get_settings, validate_startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_startup()
    yield


app = FastAPI(
    title="Trust Copilot Autopilot",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(lanes.router, prefix="/api/lanes", tags=["lanes"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["accounts"])
