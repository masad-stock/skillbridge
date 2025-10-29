@echo off
REM SkillBridge GitHub Push Script for Windows
REM This script initializes git and pushes to the specified repository

echo 🚀 SkillBridge GitHub Push Script
echo ==================================

REM Repository URL
set REPO_URL=https://github.com/masad-stock/learner.git

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the learner-pwa directory.
    pause
    exit /b 1
)

REM Initialize git if not already initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
)

REM Add all files
echo 📁 Adding files to Git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Initial commit: SkillBridge AI-powered digital skills platform

Features:
- AI-driven skills assessment and personalized learning paths
- Progressive Web App (PWA) with offline capabilities  
- Business automation tools (inventory, CRM, payments)
- Mobile-first responsive design with Manrope font
- Real YouTube course integration
- Multi-language support (English interface)
- Designed for economic empowerment in Kiharu Constituency, Kenya

Tech Stack: React 19, Bootstrap 5, TensorFlow.js, Service Workers
Research: MIT/2025/42733 - Mount Kenya University"

if %errorlevel% neq 0 (
    echo ℹ️  No changes to commit or commit failed
)

REM Add remote origin
echo 🔗 Adding remote origin...
git remote add origin %REPO_URL% 2>nul
if %errorlevel% equ 0 (
    echo ✅ Remote origin added
) else (
    echo ℹ️  Remote origin already exists or failed to add
)

REM Create main branch if needed
echo 🌿 Ensuring main branch...
git checkout -b main 2>nul || git checkout main 2>nul

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Successfully pushed to GitHub!
    echo 📍 Repository: %REPO_URL%
    echo.
    echo 🌐 Next Steps:
    echo 1. Visit your GitHub repository to verify the upload
    echo 2. Set up automatic deployment with Netlify/Vercel
    echo 3. Configure branch protection rules ^(optional^)
    echo 4. Add collaborators if needed
    echo.
    echo 🚀 Deploy Options:
    echo • Netlify: Connect your GitHub repo for auto-deploy
    echo • Vercel: Import project from GitHub  
    echo • GitHub Pages: Enable in repository settings
) else (
    echo.
    echo ❌ Push failed. This might be because:
    echo 1. Repository doesn't exist or you don't have access
    echo 2. Authentication issues ^(check your GitHub credentials^)
    echo 3. Network connectivity problems
    echo.
    echo 💡 Solutions:
    echo 1. Make sure the repository exists: %REPO_URL%
    echo 2. Check your GitHub authentication
    echo 3. Try: git push origin main --force ^(if you're sure about overwriting^)
)

pause