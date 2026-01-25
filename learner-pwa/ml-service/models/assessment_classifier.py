"""
Assessment Classifier Model
Uses machine learning to classify user competency levels based on assessment responses
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)

class AssessmentClassifier:
    """ML model for competency level classification"""

    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_trained = False
        self.model_path = os.path.join(os.path.dirname(__file__), 'saved', 'assessment_classifier.pkl')
        self.scaler_path = os.path.join(os.path.dirname(__file__), 'saved', 'assessment_scaler.pkl')

        # Ensure model directory exists
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)

    def train(self, X, y, test_size=0.2, random_state=42):
        """
        Train the competency classification model

        Args:
            X: Feature matrix
            y: Target competency levels (1-4)
            test_size: Test set proportion
            random_state: Random seed
        """
        try:
            logger.info("Training assessment classifier...")

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state, stratify=y
            )

            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)

            # Train Random Forest model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=random_state,
                class_weight='balanced'
            )

            self.model.fit(X_train_scaled, y_train)

            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)

            logger.info(f"Model trained with accuracy: {accuracy:.3f}")
            logger.info(f"Classification Report:\n{classification_report(y_test, y_pred)}")

            self.is_trained = True
            return accuracy

        except Exception as e:
            logger.error(f"Error training assessment classifier: {e}")
            raise

    def predict(self, X):
        """
        Predict competency levels

        Args:
            X: Feature matrix

        Returns:
            Predicted competency levels (1-4)
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained")

        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)

    def predict_with_confidence(self, X):
        """
        Predict competency levels with confidence scores

        Args:
            X: Feature matrix

        Returns:
            List of prediction dictionaries with confidence
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained")

        X_scaled = self.scaler.transform(X)
        predictions = self.model.predict(X_scaled)
        probabilities = self.model.predict_proba(X_scaled)

        results = []
        for i, pred in enumerate(predictions):
            prob_dist = probabilities[i]

            # Calculate confidence as max probability
            confidence = float(np.max(prob_dist))

            # Create probability distribution for all levels
            prob_dict = {
                'beginner': float(prob_dist[0]) if len(prob_dist) > 0 else 0.25,
                'intermediate': float(prob_dist[1]) if len(prob_dist) > 1 else 0.25,
                'advanced': float(prob_dist[2]) if len(prob_dist) > 2 else 0.25,
                'expert': float(prob_dist[3]) if len(prob_dist) > 3 else 0.25
            }

            results.append({
                'competency_level': int(pred),
                'confidence': confidence,
                'probabilities': prob_dict
            })

        return results

    def save(self):
        """Save model and scaler to disk"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")

        try:
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            logger.info(f"Model saved to {self.model_path}")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise

    def load(self):
        """Load model and scaler from disk"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info(f"Model loaded from {self.model_path}")
            else:
                logger.warning("Model files not found, initializing untrained model")
                self.is_trained = False
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.is_trained = False
            raise

    def generate_synthetic_data(self, n_samples=1000):
        """
        Generate synthetic training data for demonstration

        Returns:
            X, y: Feature matrix and target labels
        """
        np.random.seed(42)

        # Feature names based on assessment patterns
        features = [
            'accuracy',           # Overall accuracy
            'avg_response_time',  # Average time per question
            'consistency',        # Answer consistency
            'difficulty_progression',  # Performance on harder questions
            'help_requests',      # Number of help requests
            'review_patterns',    # Content review frequency
            'practice_frequency', # Practice session frequency
            'error_patterns'      # Types of errors made
        ]

        X = []
        y = []

        for _ in range(n_samples):
            # Generate realistic assessment patterns
            base_skill = np.random.beta(2, 2)  # Skill level 0-1

            # Features based on skill level with noise
            accuracy = np.clip(base_skill + np.random.normal(0, 0.1), 0, 1)
            avg_response_time = 30 + (1 - base_skill) * 60 + np.random.normal(0, 10)
            consistency = base_skill + np.random.normal(0, 0.15)
            difficulty_progression = base_skill * 0.8 + np.random.normal(0, 0.1)
            help_requests = max(0, int((1 - base_skill) * 5 + np.random.normal(0, 1)))
            review_patterns = base_skill * 3 + np.random.normal(0, 1)
            practice_frequency = base_skill * 7 + np.random.normal(0, 2)
            error_patterns = (1 - base_skill) * 3 + np.random.normal(0, 0.5)

            features_data = [
                accuracy, avg_response_time, consistency, difficulty_progression,
                help_requests, review_patterns, practice_frequency, error_patterns
            ]

            X.append(features_data)

            # Assign competency level based on skill
            if base_skill >= 0.85:
                level = 4  # Expert
            elif base_skill >= 0.65:
                level = 3  # Advanced
            elif base_skill >= 0.35:
                level = 2  # Intermediate
            else:
                level = 1  # Beginner

            y.append(level)

        return np.array(X), np.array(y)
