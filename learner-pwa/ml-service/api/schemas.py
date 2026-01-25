"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# Assessment Schemas
class AssessmentResponse(BaseModel):
    """Single assessment response"""
    correct: bool
    category: str
    time_spent: Optional[float] = None
    confidence: Optional[float] = None

class AssessCompetencyRequest(BaseModel):
    """Request for competency assessment"""
    user_id: str = Field(..., description="User ID")
    responses: List[Dict[str, Any]] = Field(..., description="Assessment responses")
    timings: List[float] = Field(..., description="Time spent on each question (seconds)")
    confidence: Optional[List[float]] = Field(None, description="Confidence scores for each response")

class CompetencyResult(BaseModel):
    """Competency assessment result"""
    competency_level: int = Field(..., description="Competency level (1-4)")
    confidence: float = Field(..., description="Prediction confidence")
    probabilities: Dict[str, float] = Field(..., description="Probability distribution")
    learning_style: Optional[str] = None
    recommendations: Optional[List[str]] = None

# Recommendation Schemas
class RecommendContentRequest(BaseModel):
    """Request for content recommendation"""
    user_id: str
    current_module: Optional[str] = None
    performance: Dict[str, Any] = Field(..., description="Recent performance metrics")
    context: Optional[Dict[str, Any]] = None

class ContentRecommendation(BaseModel):
    """Content recommendation result"""
    module_id: str
    title: str
    difficulty: int
    estimated_duration: int
    relevance_score: float
    reasoning: str

class RecommendationResponse(BaseModel):
    """Response with content recommendations"""
    recommendations: List[ContentRecommendation]
    reasoning: str
    confidence: float

# Dropout Prediction Schemas
class PredictDropoutRequest(BaseModel):
    """Request for dropout prediction"""
    user_id: str
    engagement_metrics: Dict[str, Any] = Field(..., description="User engagement metrics")
    performance_history: Optional[List[Dict[str, Any]]] = None

class DropoutPrediction(BaseModel):
    """Dropout prediction result"""
    dropout_risk: float = Field(..., description="Dropout risk probability (0-1)")
    risk_level: str = Field(..., description="Risk level: low, medium, high")
    factors: List[Dict[str, Any]] = Field(..., description="Contributing risk factors")
    interventions: List[str] = Field(..., description="Recommended interventions")
    confidence: float

# Learning Path Schemas
class GenerateLearningPathRequest(BaseModel):
    """Request for learning path generation"""
    user_id: str
    goals: List[str] = Field(..., description="Learning goals")
    constraints: Optional[Dict[str, Any]] = None
    competency_profile: Dict[str, Any] = Field(..., description="User competency profile")

class LearningPathModule(BaseModel):
    """Module in learning path"""
    module_id: str
    title: str
    order: int
    estimated_duration: int
    difficulty: int
    prerequisites: List[str]

class LearningPathResponse(BaseModel):
    """Generated learning path"""
    learning_path: List[LearningPathModule]
    estimated_duration: int
    milestones: List[Dict[str, Any]]
    reasoning: str

# Generic Response
class MLResponse(BaseModel):
    """Generic ML service response"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    method: str = Field(..., description="ML method used")
    confidence: Optional[float] = None
