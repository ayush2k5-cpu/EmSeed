"""
backend/main.py
EmSeed FastAPI application entry point.
Run: uvicorn backend.main:app --reload --port 8000
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.db.database import init_db

app = FastAPI(
    title="EmSeed API",
    version="1.0.0",
    description="Empathy Operationalised — Backend API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],

    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from backend.api import employees, signals, teams, alerts, audit, rewrite

app.include_router(employees.router, prefix="/api")
app.include_router(signals.router,   prefix="/api")
app.include_router(teams.router,     prefix="/api")
app.include_router(alerts.router,    prefix="/api")
app.include_router(audit.router,     prefix="/api")
app.include_router(rewrite.router,   prefix="/api")


@app.on_event("startup")
async def on_startup():
    """Auto-create schema tables on startup — safe, uses CREATE IF NOT EXISTS."""
    init_db()
    print("[ok] EmSeed DB initialised.")



@app.get("/")
async def root():
    return {"status": "EmSeed API running", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}

