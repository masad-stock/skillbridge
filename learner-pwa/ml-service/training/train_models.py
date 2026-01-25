"""
Model Training Script
Trains and saves ML models for the adaptive learning platform
"""

import os
import sys
import logging
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from models.assessment_classifier import AssessmentClassifier
from models.learning_style_detector import LearningStyleDetector
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def train_assessment_model():
    """Train and save the assessment classifier model"""
    logger.info("Training Assessment Classifier...")

    try:
        # Initialize model
        model = AssessmentClassifier()

        # Generate synthetic training data
        logger.info("Generating synthetic training data...")
        X, y = model.generate_synthetic_data(n_samples=2000)

        # Train model
        accuracy = model.train(X, y, test_size=0.2, random_state=42)
        logger.info(f"Assessment model trained with accuracy: {accuracy:.3f}")
        # Save model
        model.save()
        logger.info("Assessment model saved successfully")

        return True

    except Exception as e:
        logger.error(f"Failed to train assessment model: {e}")
        return False

def train_learning_style_model():
    """Train and save the learning style detector model"""
    logger.info("Training Learning Style Detector...")

    try:
        # Initialize model
        model = LearningStyleDetector()

        # Generate synthetic training data
        logger.info("Generating synthetic training data...")
        X, y = model.generate_synthetic_data(n_samples=2000)

        # Train model
        accuracy = model.train(X, y, test_size=0.2, random_state=42)
        logger.info(f"Learning style model trained with accuracy: {accuracy:.3f}")
        # Save model
        model.save()
        logger.info("Learning style model saved successfully")

        return True

    except Exception as e:
        logger.error(f"Failed to train learning style model: {e}")
        return False

def main():
    """Main training function"""
    logger.info("Starting ML model training...")

    # Create models directory if it doesn't exist
    models_dir = Path(__file__).parent.parent / "models" / "saved"
    models_dir.mkdir(parents=True, exist_ok=True)

    success_count = 0
    total_models = 2

    # Train assessment classifier
    if train_assessment_model():
        success_count += 1

    # Train learning style detector
    if train_learning_style_model():
        success_count += 1

    logger.info(f"Training completed: {success_count}/{total_models} models trained successfully")

    if success_count == total_models:
        logger.info("All models trained and saved successfully!")
        return 0
    else:
        logger.error(f"Failed to train {total_models - success_count} models")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
