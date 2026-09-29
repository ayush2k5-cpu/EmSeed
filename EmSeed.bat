@echo off
REM Double-click launcher for EmSeed.
REM Starts backend (FastAPI, port 8000) and frontend (Vite, port 5173) each in
REM their own PowerShell window, skipping any that's already running, then
REM opens the app in your browser.

setlocal
cd /d "%~dp0"

if not exist venv\Scripts\python.exe (
    echo First time here? Run Setup.bat first.
    pause
    exit /b 1
)

echo Checking ports...

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 (
    echo   Backend already running on port 8000 - skipping.
) else (
    echo   Starting backend on port 8000...
    start "EmSeed Backend" powershell -NoExit -Command "cd '%~dp0'; venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000"
)

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 (
    echo   Frontend already running on port 5173 - skipping.
) else (
    echo   Starting frontend on port 5173...
    start "EmSeed Frontend" powershell -NoExit -Command "cd '%~dp0frontend'; npm run dev"
)

echo Waiting 5 seconds for servers to come up...
powershell -NoProfile -Command "Start-Sleep -Seconds 5"

start http://localhost:5173

endlocal
