#!/bin/bash

echo "Starting Adaptive Learning Platform (Full Stack)..."
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."
sleep 2

# Start backend in background
echo "Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting Frontend..."
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
npm start

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
