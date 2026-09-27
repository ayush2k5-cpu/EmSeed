@echo off
REM Starts the EmSeed FastAPI backend on port 8000.
REM Run from anywhere -- resolves the repo root relative to this script's own location.
cd /d "%~dp0..\.."
venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
