import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="EmSeed API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers are registered here as each is built.
# P registers: employees, signals, teams, alerts, audit
# Lead registers: rewrite

# from api import employees, signals, teams, alerts, audit, rewrite
# app.include_router(employees.router, prefix="/api")
# app.include_router(signals.router,   prefix="/api")
# app.include_router(teams.router,     prefix="/api")
# app.include_router(alerts.router,    prefix="/api")
# app.include_router(audit.router,     prefix="/api")
# app.include_router(rewrite.router,   prefix="/api")


@app.get("/")
async def root():
    return {"status": "EmSeed API running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
