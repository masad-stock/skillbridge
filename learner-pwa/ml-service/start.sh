#!/bin/bash

# Start ML Service
echo "Starting SkillBridge ML Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p models/saved logs mlruns

# Copy .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Start the service
echo "Starting FastAPI server..."
python main.py
