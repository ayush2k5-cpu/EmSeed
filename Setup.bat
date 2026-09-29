@echo off
REM One time setup for a fresh clone. Safe to run again: it skips what already exists.
REM Creates the Python venv, installs backend and frontend dependencies, copies the
REM .env templates, and seeds the demo data. Then run EmSeed.bat.

setlocal
cd /d "%~dp0"

if not exist venv\Scripts\python.exe (
    echo Creating Python venv...
    python -m venv venv || goto :fail
)

echo Installing backend dependencies...
venv\Scripts\python.exe -m pip install -q -r requirements.txt || goto :fail

echo Installing frontend dependencies...
pushd frontend
call npm install --no-audit --no-fund || (popd & goto :fail)
popd

if not exist .env (
    copy .env.example .env >nul
    echo Created .env from the template. Add your API keys to it.
)
if not exist frontend\.env if exist frontend\.env.example (
    copy frontend\.env.example frontend\.env >nul
    echo Created frontend\.env from the template.
)

echo Seeding demo data...
venv\Scripts\python.exe scripts\seed_demo.py || goto :fail

echo.
echo Setup done. Run EmSeed.bat to start the app.
endlocal
exit /b 0

:fail
echo.
echo Setup failed. Fix the error above and run Setup.bat again.
endlocal
exit /b 1
