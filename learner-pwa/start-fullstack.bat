@echo off
echo Starting Adaptive Learning Platform (Full Stack)...
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 2 /nobreak > nul

REM Start backend in a new window
echo Starting Backend Server...
start "Backend API" cmd /k "cd backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo Starting Frontend...
echo.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
npm start
