"""
Analytics API Endpoints
Handles dropout prediction and learning analytics
"""

from fastapi import APIRouter, HTTPException
from api.schemas import (
    PredictDropoutRequest, DropoutPrediction, MLResponse
)
from models.dropout_predictor import DropoutPredictor
from training.data_preprocessing import DataPreprocessor
import logging
import numpy as np

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize models
dropout_model = DropoutPredictor()
preprocessor = DataPreprocessor()

# Load model
try:
    dropout_model.load()
    logger.info("Dropout predictor loaded")
except Exception as e:
    logger.warning(f"Could not load dropout predictor: {e}")

@router.post("/predict-dropout", response_model=MLResponse)
async def predict_dropout(request: PredictDropoutRequest):
    """
    Predict dropout risk based on engagement metrics
    """
    try:
        logger.info(f"Predicting dropout risk for user {request.user_id}")
        
        # Prepare data
        engagement_data = [request.engagement_metrics]
        
        # Extract features
        features = []
        for record in engagement_data:
            feature_dict = preprocessor.extract_dropout_features(record)
            features.append(feature_dict)
        
        # Convert to array
        X = np.array([list(features[0].values())])
        feature_names = list(features[0].keys())
        
        # Predict dropout risk
        if dropout_model.is_trained:
            result = dropout_model.predict_with_factors(X, feature_names)[0]
            method = "ml-model"
        else:
            # Fallback to rule-based
            metrics = request.engagement_metrics
            days_inactive = metrics.get('days_since_last_active', 0)
            avg_score = metrics.get('avg_score', 0)
            modules_completed = metrics.get('modules_completed', 0)
            
            risk = 0.3  # Base risk
            if days_inactive > 7:
                risk += 0.3
            if avg_score < 50:
                risk += 0.2
            if modules_completed < 2:
                risk += 0.2
            
            risk = min(risk, 0.95)
            
            result = {
                'dropout_risk': risk,
                'risk_level': 'high' if risk > 0.6 else 'medium' if risk > 0.3 else 'low',
                'factors': [
                    {'factor': 'days_since_last_active', 'contribution': days_inactive},
                    {'factor': 'avg_score', 'contribution': avg_score},
                    {'factor': 'modules_completed', 'contribution': modules_completed}
                ],
                'interventions': _generate_interventions(risk)
            }
            method = "rule-based-fallback"
        
        prediction = DropoutPrediction(
            dropout_risk=result['dropout_risk'],
            risk_level=result['risk_level'],
            factors=result['factors'],
            interventions=result['interventions'],
            confidence=0.75
        )
        
        return MLResponse(
            success=True,
            data=prediction.dict(),
            method=method,
            confidence=0.75
        )
        
    except Exception as e:
        logger.error(f"Error predicting dropout: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-analytics/{user_id}")
async def get_user_analytics(user_id: str):
    """
    Get comprehensive analytics for a user
    """
    try:
        logger.info(f"Getting analytics for user {user_id}")
        
        # This would fetch real data from database
        # For now, return placeholder
        analytics = {
            'user_id': user_id,
            'total_time_spent': 0,
            'modules_completed': 0,
            'avg_score': 0,
            'learning_streak': 0,
            'competency_levels': {},
            'learning_style': 'balanced',
            'dropout_risk': 0.3
        }
        
        return MLResponse(
            success=True,
            data=analytics,
            method="database-query"
        )
        
    except Exception as e:
        logger.error(f"Error getting user analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def _generate_interventions(risk_score: float) -> list:
    """Generate intervention recommendations based on risk score"""
    interventions = []
    
    if risk_score > 0.7:
        interventions.extend([
            "Send immediate personalized outreach message",
            "Offer one-on-one support session",
            "Provide motivational content and success stories",
            "Enable emergency support hotline"
        ])
    elif risk_score > 0.4:
        interventions.extend([
            "Send encouraging progress update",
            "Recommend easier modules to build confidence",
            "Enable peer support connections",
            "Provide flexible learning schedule options"
        ])
    else:
        interventions.extend([
            "Continue current learning path",
            "Celebrate achievements and milestones",
            "Encourage community participation"
        ])
    
    return interventions
