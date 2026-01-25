@echo off
REM SkillBridge Deployment Script for Windows
REM This script builds and prepares the app for deployment

echo 🚀 SkillBridge Deployment Script
echo =================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the learner-pwa directory.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist "build" rmdir /s /q build

REM Build the project
echo 🔨 Building the project...
npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo.
    echo 📁 Build files are ready in the 'build' directory
    echo.
    echo 🌐 Deployment Options:
    echo 1. Netlify: Drag the 'build' folder to netlify.com
    echo 2. Vercel: Run 'npx vercel --prod'
    echo 3. GitHub Pages: Run 'npm run deploy' ^(after setup^)
    echo 4. Firebase: Run 'firebase deploy' ^(after setup^)
    echo.
    echo 📊 Test locally first:
    echo    npx serve -s build -l 3000
    echo.
    echo 🎉 Your SkillBridge platform is ready for deployment!
) else (
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

pause