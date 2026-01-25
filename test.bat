@echo off
echo ========================================
echo SkillBridge254 - Test Runner
echo ========================================
echo.
echo Select test suite to run:
echo.
echo 1. Frontend Tests (React components)
echo 2. Backend Tests (API and services)
echo 3. Validation Tests
echo 4. All Tests
echo 5. Frontend Tests with Coverage
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

cd /d "%~dp0learner-pwa"

if "%choice%"=="1" (
    echo.
    echo Running Frontend Tests...
    call npm test -- --watchAll=false --passWithNoTests
) else if "%choice%"=="2" (
    echo.
    echo Running Backend Tests...
    cd backend
    call npm test
    cd ..
) else if "%choice%"=="3" (
    echo.
    echo Running Validation Tests...
    call npm test -- --testPathPattern=validation.test.js --watchAll=false
) else if "%choice%"=="4" (
    echo.
    echo Running All Tests...
    echo.
    echo [1/2] Frontend Tests...
    call npm test -- --watchAll=false --passWithNoTests
    echo.
    echo [2/2] Backend Tests...
    cd backend
    call npm test
    cd ..
) else if "%choice%"=="5" (
    echo.
    echo Running Frontend Tests with Coverage...
    call npm test -- --watchAll=false --coverage --passWithNoTests
) else if "%choice%"=="6" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Tests Complete!
echo ========================================
pause
