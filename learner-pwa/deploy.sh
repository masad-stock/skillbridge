#!/bin/bash

# SkillBridge Deployment Script
# This script builds and prepares the app for deployment

echo "🚀 SkillBridge Deployment Script"
echo "================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the learner-pwa directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build files are ready in the 'build' directory"
    echo ""
    echo "🌐 Deployment Options:"
    echo "1. Netlify: Drag the 'build' folder to netlify.com"
    echo "2. Vercel: Run 'npx vercel --prod'"
    echo "3. GitHub Pages: Run 'npm run deploy' (after setup)"
    echo "4. Firebase: Run 'firebase deploy' (after setup)"
    echo ""
    echo "📊 Test locally first:"
    echo "   npx serve -s build -l 3000"
    echo ""
    echo "🎉 Your SkillBridge platform is ready for deployment!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi