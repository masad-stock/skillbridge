@echo off
echo ========================================
echo SkillBridge254 - Complete Setup Script
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/5] Checking MongoDB...
mongo --eval "db.adminCommand('ismaster')" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB with: net start MongoDB
    echo.
    pause
    exit /b 1
)
echo MongoDB is running ✓
echo.

REM Install root dependencies
echo [2/5] Installing root dependencies...
cd /d "%~dp0"
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)
echo Root dependencies installed ✓
echo.

REM Install learner-pwa dependencies
echo [3/5] Installing learner-pwa dependencies...
cd learner-pwa
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Failed to install learner-pwa dependencies
    pause
    exit /b 1
)
echo Learner-pwa dependencies installed ✓
echo.

REM Install backend dependencies
echo [4/5] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed ✓
echo.

REM Seed database
echo [5/5] Seeding database...
node scripts/seedModules.js
if %errorlevel% neq 0 (
    echo WARNING: Database seeding failed
    echo You may need to seed manually later
)
echo Database seeded ✓
echo.

cd /d "%~dp0"
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start the application: cd learner-pwa ^&^& npm run start-fullstack
echo 2. Or use: learner-pwa\start-fullstack.bat
echo.
echo Access the app at: http://localhost:3000
echo.
pause
