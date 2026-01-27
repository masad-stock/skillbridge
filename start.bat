@echo off
REM SkillBridge254 - Quick Start Script
REM This script provides easy access to common development tasks

:menu
cls
echo ========================================
echo    SkillBridge254 - Quick Start Menu
echo ========================================
echo.
echo 1. Setup Project (First Time)
echo 2. Start Full Stack (Frontend + Backend)
echo 3. Start Backend Only
echo 4. Start Frontend Only
echo 5. Run Tests
echo 6. Build for Production
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto fullstack
if "%choice%"=="3" goto backend
if "%choice%"=="4" goto frontend
if "%choice%"=="5" goto tests
if "%choice%"=="6" goto build
if "%choice%"=="7" goto end
echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:setup
cls
echo ========================================
echo Setting up SkillBridge254...
echo ========================================
echo.

REM Check MongoDB
echo [1/4] Checking MongoDB...
mongo --eval "db.adminCommand('ismaster')" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB with: net start MongoDB
    pause
    goto menu
)
echo MongoDB is running ✓
echo.

REM Install frontend dependencies
echo [2/4] Installing frontend dependencies...
cd learner-pwa
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    goto menu
)
echo Frontend dependencies installed ✓
echo.

REM Install backend dependencies
echo [3/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    cd ..\..
    pause
    goto menu
)
echo Backend dependencies installed ✓
echo.

REM Seed database
echo [4/4] Seeding database...
node scripts/seedModules.js
if %errorlevel% neq 0 (
    echo WARNING: Database seeding failed
)
echo Database seeded ✓
cd ..\..
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
pause
goto menu

:fullstack
cls
echo ========================================
echo Starting Full Stack...
echo ========================================
echo.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.
cd learner-pwa
start cmd /k "cd backend && npm run dev"
timeout /t 3 >nul
start cmd /k "npm start"
cd ..
echo.
echo Both servers started in separate windows
pause
goto menu

:backend
cls
echo ========================================
echo Starting Backend Only...
echo ========================================
echo.
echo Backend: http://localhost:5001
echo.
cd learner-pwa\backend
call npm run dev
cd ..\..
pause
goto menu

:frontend
cls
echo ========================================
echo Starting Frontend Only...
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo.
cd learner-pwa
call npm start
cd ..
pause
goto menu

:tests
cls
echo ========================================
echo Running Tests...
echo ========================================
echo.
echo 1. Frontend Tests
echo 2. Backend Tests
echo 3. All Tests
echo 4. Back to Main Menu
echo.
set /p testchoice="Enter your choice (1-4): "

if "%testchoice%"=="1" (
    cd learner-pwa
    call npm test -- --watchAll=false --passWithNoTests
    cd ..
) else if "%testchoice%"=="2" (
    cd learner-pwa\backend
    call npm test
    cd ..\..
) else if "%testchoice%"=="3" (
    echo Running Frontend Tests...
    cd learner-pwa
    call npm test -- --watchAll=false --passWithNoTests
    echo.
    echo Running Backend Tests...
    cd backend
    call npm test
    cd ..\..
) else if "%testchoice%"=="4" (
    goto menu
)
pause
goto menu

:build
cls
echo ========================================
echo Building for Production...
echo ========================================
echo.
cd learner-pwa
if exist "build" rmdir /s /q build
call npm run build
if %errorlevel% equ 0 (
    echo.
    echo ✅ Build successful!
    echo 📁 Build files are in: learner-pwa\build
    echo.
    echo Deployment options:
    echo 1. Netlify: Drag 'build' folder to netlify.com
    echo 2. Vercel: Run 'npx vercel --prod'
    echo 3. Test locally: npx serve -s build -l 3000
) else (
    echo ❌ Build failed
)
cd ..
pause
goto menu

:end
echo.
echo Thank you for using SkillBridge254!
echo.
exit /b 0
