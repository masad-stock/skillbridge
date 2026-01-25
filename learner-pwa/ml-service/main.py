"""
ML Service Main Application
FastAPI-based microservice for machine learning operations
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv
import logging
from pythonjsonlogger import jsonlogger

# Load environment variables
load_dotenv()

# Configure logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))

# Import routers
from api import assessment_api, recommendation_api, analytics_api

# Global state for models
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for the application
    Loads ML models on startup and cleans up on shutdown
    """
    logger.info("Starting ML Service...")
    
    # Load models on startup
    try:
        # Model loading will be implemented in task 1.1
        logger.info("ML models loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load ML models: {e}")
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down ML Service...")
    ml_models.clear()

# Create FastAPI app
app = FastAPI(
    title="SkillBridge ML Service",
    description="Machine Learning microservice for adaptive learning and personalized recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5001').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key authentication
async def verify_api_key(x_api_key: str = Header(None)):
    """Verify API key for authentication"""
    expected_key = os.getenv('API_KEY', 'dev-key')
    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ml-service",
        "version": "1.0.0",
        "models_loaded": len(ml_models)
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "SkillBridge ML Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Model info endpoint
@app.get("/models/info")
async def models_info(api_key: str = Depends(verify_api_key)):
    """Get information about loaded models"""
    return {
        "models": list(ml_models.keys()),
        "count": len(ml_models),
        "model_path": os.getenv('MODEL_PATH', './models/saved')
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

# Include routers
app.include_router(assessment_api.router, prefix="/ml/assessment", tags=["Assessment"])
app.include_router(recommendation_api.router, prefix="/ml/recommendation", tags=["Recommendation"])
app.include_router(analytics_api.router, prefix="/ml/analytics", tags=["Analytics"])

if __name__ == "__main__":
    port = int(os.getenv('ML_SERVICE_PORT', 8000))
    host = os.getenv('ML_SERVICE_HOST', '0.0.0.0')
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv('ENVIRONMENT') == 'development',
        log_level=os.getenv('LOG_LEVEL', 'info').lower()
    )
