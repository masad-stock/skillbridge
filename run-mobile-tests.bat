@echo off
REM Mobile Login Testing Script for Windows
REM This script runs comprehensive tests for mobile login issues

setlocal enabledelayedexpansion

echo ================================================
echo Mobile Login Testing Suite
echo ================================================
echo.

REM Check if backend directory exists
if not exist "learner-pwa\backend" (
    echo [ERROR] Backend directory not found!
    exit /b 1
)

REM Check if frontend directory exists
if not exist "learner-pwa" (
    echo [ERROR] Frontend directory not found!
    exit /b 1
)

echo.
echo [INFO] Step 1: Checking environment setup...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js version: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm version: %NPM_VERSION%

echo.
echo [INFO] Step 2: Installing backend dependencies...
echo.

cd learner-pwa\backend
if not exist "node_modules" (
    call npm install
) else (
    echo [SUCCESS] Dependencies already installed
)

echo.
echo [INFO] Step 3: Running backend tests...
echo.

REM Run all backend tests
echo [INFO] Running all backend tests...
call npm test > ..\..\backend-test-results.log 2>&1

REM Run mobile-specific tests
echo [INFO] Running mobile-specific authentication tests...
call npm test -- tests/api/auth.mobile.test.js > ..\..\mobile-auth-test-results.log 2>&1

echo.
echo [INFO] Step 4: Running backend authentication tests...
echo.

call npm test -- tests/api/auth.test.js > ..\..\auth-test-results.log 2>&1

echo.
echo [INFO] Step 5: Testing backend API endpoints...
echo.

REM Set backend URL
if "%BACKEND_URL%"=="" set BACKEND_URL=https://skillbridge-backend-t35r.onrender.com
echo [INFO] Testing backend at: %BACKEND_URL%

REM Test health endpoint
echo [INFO] Testing health endpoint...
curl -s -w "\n%%{http_code}" "%BACKEND_URL%/health" > health-response.tmp 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Health check completed
) else (
    echo [ERROR] Health check failed
)

REM Test CORS
echo [INFO] Testing CORS configuration...
curl -s -w "\n%%{http_code}" -X OPTIONS -H "Origin: https://skillbridge-tau.vercel.app" -H "Access-Control-Request-Method: POST" "%BACKEND_URL%/api/v1/auth/login" > cors-response.tmp 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] CORS check completed
) else (
    echo [WARNING] CORS check failed
)

REM Test login endpoint
echo [INFO] Testing login endpoint...
curl -s -w "\n%%{http_code}" -X POST -H "Content-Type: application/json" "%BACKEND_URL%/api/v1/auth/login" > login-response.tmp 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Login endpoint responding
) else (
    echo [WARNING] Login endpoint check failed
)

cd ..\..

echo.
echo [INFO] Step 6: Installing frontend dependencies...
echo.

cd learner-pwa
if not exist "node_modules" (
    call npm install
) else (
    echo [SUCCESS] Dependencies already installed
)

echo.
echo [INFO] Step 7: Running frontend tests...
echo.

REM Run frontend tests
echo [INFO] Running all frontend tests...
call npm test -- --watchAll=false > ..\frontend-test-results.log 2>&1

cd ..

echo.
echo [INFO] Step 8: Generating test report...
echo.

REM Create test report
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set REPORT_FILE=mobile-test-report-%mydate%-%mytime%.md

(
echo # Mobile Login Testing Report
echo.
echo **Date**: %date% %time%
echo **Backend URL**: %BACKEND_URL%
echo.
echo ## Test Results Summary
echo.
echo ### Backend Tests
echo - All backend tests: See `backend-test-results.log`
echo - Mobile auth tests: See `mobile-auth-test-results.log`
echo - Auth tests: See `auth-test-results.log`
echo.
echo ### Frontend Tests
echo - All frontend tests: See `frontend-test-results.log`
echo.
echo ### API Endpoint Tests
echo.
echo #### Health Check
echo - Status: Check health-response.tmp
echo.
echo #### CORS Configuration
echo - Status: Check cors-response.tmp
echo.
echo #### Login Endpoint
echo - Status: Check login-response.tmp
echo.
echo ## Next Steps
echo.
echo 1. Review test logs for any failures
echo 2. Test on actual mobile devices using the diagnostics page
echo 3. Check browser console for errors during mobile testing
echo 4. Monitor network requests in browser DevTools
echo.
echo ## Mobile Testing Checklist
echo.
echo - [ ] Test on iOS Safari
echo - [ ] Test on iOS Chrome
echo - [ ] Test on Android Chrome
echo - [ ] Test on Android Firefox
echo - [ ] Test on Samsung Internet
echo - [ ] Test with WiFi connection
echo - [ ] Test with cellular connection
echo - [ ] Test with slow network ^(throttled^)
echo - [ ] Test in private/incognito mode
echo - [ ] Test with localStorage disabled
echo.
echo ## Common Issues to Check
echo.
echo 1. **Token Storage**: Verify localStorage is available on mobile
echo 2. **Network Timeout**: Check if requests timeout on slow connections
echo 3. **CORS Errors**: Verify CORS headers are present
echo 4. **Service Worker**: Check if service worker is interfering
echo 5. **Rate Limiting**: Verify rate limiting isn't too aggressive
echo.
echo ## Debugging Resources
echo.
echo - Backend logs: Check Render dashboard
echo - Frontend logs: Use remote debugging ^(Safari/Chrome DevTools^)
echo - Network logs: Use Charles Proxy or browser DevTools
echo - Mobile diagnostics: Use the mobile-diagnostics.html page
echo.
) > %REPORT_FILE%

echo [SUCCESS] Test report generated: %REPORT_FILE%

REM Cleanup temporary files
if exist health-response.tmp del health-response.tmp
if exist cors-response.tmp del cors-response.tmp
if exist login-response.tmp del login-response.tmp

echo.
echo ================================================
echo [SUCCESS] Testing Complete!
echo ================================================
echo.
echo [INFO] Test logs saved:
echo   - backend-test-results.log
echo   - mobile-auth-test-results.log
echo   - auth-test-results.log
echo   - frontend-test-results.log
echo   - %REPORT_FILE%
echo.
echo [INFO] Next steps:
echo   1. Review test logs for failures
echo   2. Test on actual mobile devices
echo   3. Use mobile-diagnostics.html for on-device testing
echo   4. Check COMPREHENSIVE_LOGIN_TESTING_PLAN.md for detailed testing procedures
echo.
echo [WARNING] If tests are failing, check:
echo   - MongoDB connection (MONGODB_URI environment variable)
echo   - JWT_SECRET is set
echo   - Backend is accessible at %BACKEND_URL%
echo.

pause
