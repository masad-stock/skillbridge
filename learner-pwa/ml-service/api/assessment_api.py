"""
Assessment API Endpoints
Handles competency assessment and learning style detection
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from api.schemas import (
    AssessCompetencyRequest, CompetencyResult, MLResponse
)
from models.assessment_classifier import AssessmentClassifier
from models.learning_style_detector import LearningStyleDetector
from training.data_preprocessing import DataPreprocessor
import logging
import numpy as np

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize models (will be loaded on startup)
assessment_model = AssessmentClassifier()
learning_style_model = LearningStyleDetector()
preprocessor = DataPreprocessor()

# Load models
try:
    assessment_model.load()
    logger.info("Assessment classifier loaded")
except Exception as e:
    logger.warning(f"Could not load assessment classifier: {e}")

try:
    learning_style_model.load()
    logger.info("Learning style detector loaded")
except Exception as e:
    logger.warning(f"Could not load learning style detector: {e}")

@router.post("/assess-competency", response_model=MLResponse)
async def assess_competency(request: AssessCompetencyRequest):
    """
    Assess user competency level based on assessment responses
    
    Returns competency level (1-4) with confidence score
    """
    try:
        logger.info(f"Assessing competency for user {request.user_id}")
        
        # Prepare data
        assessment_data = [{
            'responses': request.responses,
            'timings': request.timings,
            'confidence': request.confidence or [0.5] * len(request.responses)
        }]
        
        # Extract features
        features = []
        for record in assessment_data:
            feature_dict = preprocessor.extract_assessment_features(record)
            features.append(feature_dict)
        
        # Convert to array
        X = np.array([list(features[0].values())])
        
        # Predict competency
        if assessment_model.is_trained:
            result = assessment_model.predict_with_confidence(X)[0]
            method = "ml-model"
        else:
            # Fallback to rule-based
            correct_count = sum(1 for r in request.responses if r.get('correct', False))
            accuracy = correct_count / len(request.responses)
            
            if accuracy >= 0.9:
                level = 4
            elif accuracy >= 0.7:
                level = 3
            elif accuracy >= 0.5:
                level = 2
            else:
                level = 1
            
            result = {
                'competency_level': level,
                'confidence': 0.7,
                'probabilities': {
                    'beginner': 0.25,
                    'intermediate': 0.25,
                    'advanced': 0.25,
                    'expert': 0.25
                }
            }
            method = "rule-based-fallback"
        
        # Detect learning style
        learning_style = None
        if learning_style_model.is_trained:
            try:
                style_data = [{
                    'timings': request.timings,
                    'interactions': []  # Would come from user history
                }]
                style_features = []
                for record in style_data:
                    feature_dict = preprocessor.extract_learning_style_features(record)
                    style_features.append(feature_dict)
                
                X_style = np.array([list(style_features[0].values())])
                style_result = learning_style_model.predict_style(X_style)[0]
                learning_style = style_result['learning_style']
            except Exception as e:
                logger.warning(f"Could not detect learning style: {e}")
        
        # Prepare response
        competency_result = CompetencyResult(
            competency_level=result['competency_level'],
            confidence=result['confidence'],
            probabilities=result['probabilities'],
            learning_style=learning_style,
            recommendations=_generate_recommendations(result['competency_level'])
        )
        
        return MLResponse(
            success=True,
            data=competency_result.dict(),
            method=method,
            confidence=result['confidence']
        )
        
    except Exception as e:
        logger.error(f"Error assessing competency: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-learning-style")
async def detect_learning_style(user_id: str, interaction_data: dict):
    """
    Detect user learning style based on interaction patterns
    """
    try:
        logger.info(f"Detecting learning style for user {user_id}")
        
        # Extract features
        features = preprocessor.extract_learning_style_features(interaction_data)
        X = np.array([list(features.values())])
        
        # Predict style
        if learning_style_model.is_trained:
            result = learning_style_model.predict_style(X)[0]
            method = "ml-model"
        else:
            # Fallback
            result = {
                'learning_style': 'balanced',
                'confidence': 0.5,
                'recommendations': ['Provide mixed-media content']
            }
            method = "fallback"
        
        return MLResponse(
            success=True,
            data=result,
            method=method,
            confidence=result.get('confidence', 0.5)
        )
        
    except Exception as e:
        logger.error(f"Error detecting learning style: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def _generate_recommendations(competency_level: int) -> list:
    """Generate learning recommendations based on competency level"""
    recommendations = {
        1: [
            "Start with foundational modules",
            "Focus on basic digital skills",
            "Take time to practice each concept",
            "Use visual learning aids"
        ],
        2: [
            "Progress to intermediate modules",
            "Practice with real-world scenarios",
            "Explore business automation tools",
            "Join peer learning groups"
        ],
        3: [
            "Tackle advanced topics",
            "Work on complex projects",
            "Mentor other learners",
            "Explore specialized areas"
        ],
        4: [
            "Master expert-level content",
            "Lead community projects",
            "Create your own learning materials",
            "Pursue certification opportunities"
        ]
    }
    
    return recommendations.get(competency_level, recommendations[1])
