#!/bin/bash
# SkillBridge254 - Quick Start Script
# This script provides easy access to common development tasks

show_menu() {
    clear
    echo "========================================"
    echo "   SkillBridge254 - Quick Start Menu"
    echo "========================================"
    echo ""
    echo "1. Setup Project (First Time)"
    echo "2. Start Full Stack (Frontend + Backend)"
    echo "3. Start Backend Only"
    echo "4. Start Frontend Only"
    echo "5. Run Tests"
    echo "6. Build for Production"
    echo "7. Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1) setup_project ;;
        2) start_fullstack ;;
        3) start_backend ;;
        4) start_frontend ;;
        5) run_tests ;;
        6) build_production ;;
        7) exit 0 ;;
        *) echo "Invalid choice. Please try again." && sleep 2 && show_menu ;;
    esac
}

setup_project() {
    clear
    echo "========================================"
    echo "Setting up SkillBridge254..."
    echo "========================================"
    echo ""
    
    # Check MongoDB
    echo "[1/4] Checking MongoDB..."
    if ! pgrep -x mongod > /dev/null; then
        echo "WARNING: MongoDB is not running!"
        echo "Please start MongoDB with: sudo systemctl start mongod"
        read -p "Press Enter to continue..."
        show_menu
        return
    fi
    echo "MongoDB is running ✓"
    echo ""
    
    # Install frontend dependencies
    echo "[2/4] Installing frontend dependencies..."
    cd learner-pwa
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies"
        cd ..
        read -p "Press Enter to continue..."
        show_menu
        return
    fi
    echo "Frontend dependencies installed ✓"
    echo ""
    
    # Install backend dependencies
    echo "[3/4] Installing backend dependencies..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install backend dependencies"
        cd ../..
        read -p "Press Enter to continue..."
        show_menu
        return
    fi
    echo "Backend dependencies installed ✓"
    echo ""
    
    # Seed database
    echo "[4/4] Seeding database..."
    node scripts/seedModules.js
    if [ $? -ne 0 ]; then
        echo "WARNING: Database seeding failed"
    fi
    echo "Database seeded ✓"
    cd ../..
    echo ""
    echo "========================================"
    echo "Setup Complete!"
    echo "========================================"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

start_fullstack() {
    clear
    echo "========================================"
    echo "Starting Full Stack..."
    echo "========================================"
    echo ""
    echo "Backend: http://localhost:5001"
    echo "Frontend: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    cd learner-pwa
    
    # Start backend in background
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start frontend
    npm start
    
    # Kill backend when frontend stops
    kill $BACKEND_PID 2>/dev/null
    cd ..
}

start_backend() {
    clear
    echo "========================================"
    echo "Starting Backend Only..."
    echo "========================================"
    echo ""
    echo "Backend: http://localhost:5001"
    echo ""
    cd learner-pwa/backend
    npm run dev
    cd ../..
    read -p "Press Enter to continue..."
    show_menu
}

start_frontend() {
    clear
    echo "========================================"
    echo "Starting Frontend Only..."
    echo "========================================"
    echo ""
    echo "Frontend: http://localhost:3000"
    echo ""
    cd learner-pwa
    npm start
    cd ..
    read -p "Press Enter to continue..."
    show_menu
}

run_tests() {
    clear
    echo "========================================"
    echo "Running Tests..."
    echo "========================================"
    echo ""
    echo "1. Frontend Tests"
    echo "2. Backend Tests"
    echo "3. All Tests"
    echo "4. Back to Main Menu"
    echo ""
    read -p "Enter your choice (1-4): " testchoice
    
    case $testchoice in
        1)
            cd learner-pwa
            npm test -- --watchAll=false --passWithNoTests
            cd ..
            ;;
        2)
            cd learner-pwa/backend
            npm test
            cd ../..
            ;;
        3)
            echo "Running Frontend Tests..."
            cd learner-pwa
            npm test -- --watchAll=false --passWithNoTests
            echo ""
            echo "Running Backend Tests..."
            cd backend
            npm test
            cd ../..
            ;;
        4)
            show_menu
            return
            ;;
    esac
    read -p "Press Enter to continue..."
    show_menu
}

build_production() {
    clear
    echo "========================================"
    echo "Building for Production..."
    echo "========================================"
    echo ""
    cd learner-pwa
    rm -rf build
    npm run build
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Build successful!"
        echo "📁 Build files are in: learner-pwa/build"
        echo ""
        echo "Deployment options:"
        echo "1. Netlify: Drag 'build' folder to netlify.com"
        echo "2. Vercel: Run 'npx vercel --prod'"
        echo "3. Test locally: npx serve -s build -l 3000"
    else
        echo "❌ Build failed"
    fi
    cd ..
    read -p "Press Enter to continue..."
    show_menu
}

# Make script executable
chmod +x "$0" 2>/dev/null

# Start the menu
show_menu
