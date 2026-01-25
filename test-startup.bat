@echo off
echo ========================================
echo Testing Critical App Startup
echo ========================================

echo.
echo [1/3] Checking if backend can start...
cd learner-pwa\backend
timeout /t 2 /nobreak >nul
node -e "try { require('./server.js'); console.log('✓ Backend loads without syntax errors'); process.exit(0); } catch(e) { console.error('✗ Backend has errors:', e.message); process.exit(1); }"
if %errorlevel% neq 0 (
    echo CRITICAL: Backend has syntax errors!
    cd ..\..
    exit /b 1
)
cd ..\..

echo.
echo [2/3] Checking if frontend can build...
cd learner-pwa
set CI=true
call npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Frontend build failed
    cd ..
    exit /b 1
) else (
    echo ✓ Frontend builds successfully
)
cd ..

echo.
echo [3/3] Running quick backend tests...
cd learner-pwa\backend
call npm test -- --testPathPattern="tests/properties" --bail
cd ..\..

echo.
echo ========================================
echo Startup Test Complete
echo ========================================
