"""
Recommendation API Endpoints
Handles content recommendations and learning path generation
"""

from fastapi import APIRouter, HTTPException
from api.schemas import (
    RecommendContentRequest, RecommendationResponse,
    GenerateLearningPathRequest, LearningPathResponse,
    ContentRecommendation, LearningPathModule, MLResponse
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/recommend-content", response_model=MLResponse)
async def recommend_content(request: RecommendContentRequest):
    """
    Recommend learning content based on user performance and context using ML models
    """
    try:
        logger.info(f"Generating ML-powered recommendations for user {request.user_id}")

        # Extract performance metrics
        performance = request.performance
        avg_score = performance.get('avg_score', 0)
        modules_completed = performance.get('modules_completed', 0)

        # Prepare data for ML model
        assessment_data = {
            'responses': [{'correct': True, 'difficulty': 1}] * int(avg_score / 10),  # Mock responses based on score
            'timings': [30.0] * modules_completed if modules_completed > 0 else [30.0],
            'confidence': [0.8] * max(1, modules_completed)
        }

        # Extract features using ML preprocessor
        features = preprocessor.extract_assessment_features(assessment_data)
        X = np.array([list(features.values())])

        # Use ML model for intelligent recommendations
        recommendations = []
        method = "rule-based-fallback"
        confidence = 0.75

        if recommendation_model.is_trained:
            try:
                # Get competency prediction from ML model
                competency_results = recommendation_model.predict_with_confidence(X)
                predicted_level = competency_results[0]['competency_level']
                model_confidence = competency_results[0]['confidence']

                # Generate recommendations based on ML-predicted competency
                recommendations = _generate_ml_recommendations(predicted_level, avg_score)
                method = "ml-model"
                confidence = model_confidence

                logger.info(f"ML model predicted competency level {predicted_level} with confidence {model_confidence:.3f}")

            except Exception as e:
                logger.warning(f"ML recommendation failed, falling back to rule-based: {e}")
                recommendations = _generate_rule_based_recommendations(avg_score)
        else:
            # Fallback to rule-based
            recommendations = _generate_rule_based_recommendations(avg_score)

        response = RecommendationResponse(
            recommendations=recommendations,
            reasoning=f"ML-powered recommendations based on predicted competency level and performance metrics",
            confidence=confidence
        )

        return MLResponse(
            success=True,
            data=response.dict(),
            method=method,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def _generate_ml_recommendations(competency_level: int, avg_score: float):
    """Generate recommendations based on ML-predicted competency level"""
    recommendations = []

    if competency_level == 1:  # Beginner
        recommendations.extend([
            ContentRecommendation(
                module_id="bd_001",
                title="Mobile Phone Basics",
                difficulty=1,
                estimated_duration=30,
                relevance_score=0.95,
                reasoning="ML assessment indicates beginner level - start with fundamentals"
            ),
            ContentRecommendation(
                module_id="bd_002",
                title="Internet Basics & Safety",
                difficulty=1,
                estimated_duration=45,
                relevance_score=0.90,
                reasoning="Essential foundational skills for digital literacy"
            )
        ])
    elif competency_level == 2:  # Intermediate
        recommendations.extend([
            ContentRecommendation(
                module_id="ba_001",
                title="Digital Inventory Management",
                difficulty=2,
                estimated_duration=90,
                relevance_score=0.88,
                reasoning="Intermediate level - focus on practical business applications"
            ),
            ContentRecommendation(
                module_id="fm_001",
                title="Mobile Money & Digital Payments",
                difficulty=1,
                estimated_duration=60,
                relevance_score=0.85,
                reasoning="Build on existing skills with financial technology"
            )
        ])
    elif competency_level == 3:  # Advanced
        recommendations.extend([
            ContentRecommendation(
                module_id="ba_003",
                title="Business Process Automation",
                difficulty=3,
                estimated_duration=150,
                relevance_score=0.92,
                reasoning="Advanced level - master complex automation techniques"
            ),
            ContentRecommendation(
                module_id="dm_002",
                title="Content Creation & Strategy",
                difficulty=3,
                estimated_duration=120,
                relevance_score=0.89,
                reasoning="Strategic digital marketing for advanced users"
            )
        ])
    else:  # Expert
        recommendations.extend([
            ContentRecommendation(
                module_id="ba_003",
                title="Advanced Business Process Automation",
                difficulty=4,
                estimated_duration=180,
                relevance_score=0.95,
                reasoning="Expert level - advanced automation and optimization"
            ),
            ContentRecommendation(
                module_id="ec_002",
                title="Advanced E-commerce Strategies",
                difficulty=4,
                estimated_duration=150,
                relevance_score=0.90,
                reasoning="Expert-level online business management"
            )
        ])

    return recommendations

def _generate_rule_based_recommendations(avg_score: float):
    """Fallback rule-based recommendations"""
    recommendations = []

    if avg_score < 60:
        recommendations.extend([
            ContentRecommendation(
                module_id="bd_001",
                title="Mobile Phone Basics",
                difficulty=1,
                estimated_duration=30,
                relevance_score=0.9,
                reasoning="Foundational content to build confidence"
            ),
            ContentRecommendation(
                module_id="bd_002",
                title="Internet Basics & Safety",
                difficulty=1,
                estimated_duration=45,
                relevance_score=0.85,
                reasoning="Essential skills for digital literacy"
            )
        ])
    elif avg_score < 80:
        recommendations.extend([
            ContentRecommendation(
                module_id="ba_001",
                title="Digital Inventory Management",
                difficulty=2,
                estimated_duration=90,
                relevance_score=0.88,
                reasoning="Practical business skills"
            ),
            ContentRecommendation(
                module_id="dm_001",
                title="Social Media Marketing",
                difficulty=2,
                estimated_duration=90,
                relevance_score=0.82,
                reasoning="High-demand digital marketing skills"
            )
        ])
    else:
        recommendations.extend([
            ContentRecommendation(
                module_id="ba_003",
                title="Business Process Automation",
                difficulty=3,
                estimated_duration=150,
                relevance_score=0.92,
                reasoning="Advanced automation techniques"
            ),
            ContentRecommendation(
                module_id="dm_002",
                title="Content Creation & Strategy",
                difficulty=3,
                estimated_duration=120,
                relevance_score=0.87,
                reasoning="Strategic digital marketing"
            )
        ])

    return recommendations

@router.post("/generate-learning-path", response_model=MLResponse)
async def generate_learning_path(request: GenerateLearningPathRequest):
    """
    Generate personalized learning path based on goals and competency
    """
    try:
        logger.info(f"Generating learning path for user {request.user_id}")
        
        # Extract competency profile
        competency = request.competency_profile
        goals = request.goals
        
        # Generate learning path based on goals
        learning_path = []
        order = 1
        
        # Always start with basics if competency is low
        if competency.get('basic_digital', 1) < 3:
            learning_path.append(LearningPathModule(
                module_id="bd_001",
                title="Mobile Phone Basics",
                order=order,
                estimated_duration=30,
                difficulty=1,
                prerequisites=[]
            ))
            order += 1
            
            learning_path.append(LearningPathModule(
                module_id="bd_002",
                title="Internet Basics & Safety",
                order=order,
                estimated_duration=45,
                difficulty=1,
                prerequisites=["bd_001"]
            ))
            order += 1
        
        # Add goal-specific modules
        if "business_automation" in goals:
            learning_path.append(LearningPathModule(
                module_id="ba_001",
                title="Digital Inventory Management",
                order=order,
                estimated_duration=90,
                difficulty=2,
                prerequisites=["bd_002"]
            ))
            order += 1
            
            learning_path.append(LearningPathModule(
                module_id="ba_002",
                title="Customer Relationship Management",
                order=order,
                estimated_duration=120,
                difficulty=2,
                prerequisites=["ba_001"]
            ))
            order += 1
        
        if "digital_marketing" in goals:
            learning_path.append(LearningPathModule(
                module_id="dm_001",
                title="Social Media Marketing",
                order=order,
                estimated_duration=90,
                difficulty=2,
                prerequisites=["bd_002"]
            ))
            order += 1
        
        if "e_commerce" in goals:
            learning_path.append(LearningPathModule(
                module_id="ec_001",
                title="Online Store Setup",
                order=order,
                estimated_duration=120,
                difficulty=2,
                prerequisites=["bd_002"]
            ))
            order += 1
        
        # Calculate total duration
        total_duration = sum(m.estimated_duration for m in learning_path)
        
        # Define milestones
        milestones = [
            {
                "name": "Digital Literacy Foundation",
                "modules": 2,
                "description": "Complete basic digital skills"
            },
            {
                "name": "Practical Skills Application",
                "modules": 4,
                "description": "Apply skills to real business scenarios"
            },
            {
                "name": "Advanced Competency",
                "modules": len(learning_path),
                "description": "Master all learning objectives"
            }
        ]
        
        response = LearningPathResponse(
            learning_path=learning_path,
            estimated_duration=total_duration,
            milestones=milestones,
            reasoning=f"Path designed for goals: {', '.join(goals)}"
        )
        
        return MLResponse(
            success=True,
            data=response.dict(),
            method="rule-based",
            confidence=0.8
        )
        
    except Exception as e:
        logger.error(f"Error generating learning path: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
