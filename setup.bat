@echo off
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Smart Payment Reminder System - Setup & Run              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error installing dependencies
    exit /b 1
)

echo Step 2: Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Error installing backend dependencies
    exit /b 1
)
cd ..

echo.
echo ✓ Setup complete!
echo.
echo Quick Start Options:
echo.
echo 1. Docker (Recommended):
echo    docker-compose up -d
echo    Then visit: http://localhost:3000
echo.
echo 2. Local Development:
echo    Terminal 1: cd backend ^& npm start
echo    Terminal 2: cd frontend ^& npm start
echo.
echo 3. Database Setup:
echo    PostgreSQL required on localhost:5432
echo    Run: psql -U postgres -h localhost -d payment_system -f database/schema.sql
echo.
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo Database: localhost:5432
echo ========================================
echo.
pause
