@echo off
REM Start ML Service on Windows

echo Starting SkillBridge ML Service...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create necessary directories
if not exist "models\saved" mkdir models\saved
if not exist "logs" mkdir logs
if not exist "mlruns" mkdir mlruns

REM Copy .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

REM Start the service
echo Starting FastAPI server...
python main.py
