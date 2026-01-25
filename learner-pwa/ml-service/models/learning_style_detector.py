"""
Learning Style Detector Model
Uses machine learning to identify user learning preferences based on interaction patterns
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler, LabelEncoder
import logging

logger = logging.getLogger(__name__)

class LearningStyleDetector:
    """ML model for learning style detection"""

    # Learning style categories
    LEARNING_STYLES = {
        0: 'visual',
        1: 'auditory',
        2: 'kinesthetic',
        3: 'reading_writing'
    }

    STYLE_RECOMMENDATIONS = {
        'visual': [
            'Use more video content and diagrams',
            'Include visual aids in assessments',
            'Provide graphical representations of concepts',
            'Use color-coded learning materials'
        ],
        'auditory': [
            'Incorporate audio lectures and discussions',
            'Use voice-based assessments',
            'Include audio explanations',
            'Facilitate group discussions'
        ],
        'kinesthetic': [
            'Add hands-on practice activities',
            'Include interactive simulations',
            'Use real-world project-based learning',
            'Provide physical manipulatives when possible'
        ],
        'reading_writing': [
            'Provide detailed text-based materials',
            'Include reading assignments and writing exercises',
            'Use text-based assessments',
            'Encourage note-taking and journaling'
        ]
    }

    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoder = None
        self.is_trained = False
        self.model_path = os.path.join(os.path.dirname(__file__), 'saved', 'learning_style_detector.pkl')
        self.scaler_path = os.path.join(os.path.dirname(__file__), 'saved', 'learning_style_scaler.pkl')
        self.encoder_path = os.path.join(os.path.dirname(__file__), 'saved', 'learning_style_encoder.pkl')

        # Ensure model directory exists
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)

    def train(self, X, y, test_size=0.2, random_state=42):
        """
        Train the learning style detection model

        Args:
            X: Feature matrix
            y: Target learning styles (encoded)
            test_size: Test set proportion
            random_state: Random seed
        """
        try:
            logger.info("Training learning style detector...")

            # Encode labels if they're strings
            if isinstance(y[0], str):
                self.encoder = LabelEncoder()
                y_encoded = self.encoder.fit_transform(y)
            else:
                y_encoded = y
                self.encoder = LabelEncoder()
                self.encoder.fit(y_encoded)

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y_encoded, test_size=test_size, random_state=random_state, stratify=y_encoded
            )

            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)

            # Train Random Forest model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=8,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=random_state,
                class_weight='balanced'
            )

            self.model.fit(X_train_scaled, y_train)

            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)

            logger.info(f"Learning style model trained with accuracy: {accuracy:.3f}")
            logger.info(f"Classification Report:\n{classification_report(y_test, y_pred, target_names=list(self.LEARNING_STYLES.values()))}")

            self.is_trained = True
            return accuracy

        except Exception as e:
            logger.error(f"Error training learning style detector: {e}")
            raise

    def predict_style(self, X):
        """
        Predict learning styles with probabilities

        Args:
            X: Feature matrix

        Returns:
            List of prediction dictionaries with style and confidence
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained")

        X_scaled = self.scaler.transform(X)
        predictions = self.model.predict(X_scaled)
        probabilities = self.model.predict_proba(X_scaled)

        results = []
        for i, pred in enumerate(predictions):
            style_name = self.LEARNING_STYLES[pred]
            prob_dist = probabilities[i]

            # Calculate confidence as max probability
            confidence = float(np.max(prob_dist))

            # Get recommendations for this style
            recommendations = self.STYLE_RECOMMENDATIONS.get(style_name, [])

            results.append({
                'learning_style': style_name,
                'confidence': confidence,
                'probabilities': {self.LEARNING_STYLES[j]: float(prob_dist[j]) for j in range(len(prob_dist))},
                'recommendations': recommendations
            })

        return results

    def save(self):
        """Save model, scaler, and encoder to disk"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")

        try:
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            joblib.dump(self.encoder, self.encoder_path)
            logger.info(f"Learning style model saved to {self.model_path}")
        except Exception as e:
            logger.error(f"Error saving learning style model: {e}")
            raise

    def load(self):
        """Load model, scaler, and encoder from disk"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path) and os.path.exists(self.encoder_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.encoder = joblib.load(self.encoder_path)
                self.is_trained = True
                logger.info(f"Learning style model loaded from {self.model_path}")
            else:
                logger.warning("Learning style model files not found, initializing untrained model")
                self.is_trained = False
        except Exception as e:
            logger.error(f"Error loading learning style model: {e}")
            self.is_trained = False
            raise

    def generate_synthetic_data(self, n_samples=1000):
        """
        Generate synthetic training data for demonstration

        Returns:
            X, y: Feature matrix and target labels
        """
        np.random.seed(42)

        # Feature names based on interaction patterns
        features = [
            'video_watch_time', 'text_read_time', 'audio_listen_time', 'interactive_time',
            'discussion_posts', 'practice_sessions', 'quiz_attempts', 'help_requests',
            'avg_session_duration', 'content_reviews', 'bookmarks',
            'fast_interactions', 'slow_interactions'
        ]

        X = []
        y = []

        for _ in range(n_samples):
            # Generate learning style preferences
            style_preference = np.random.choice(['visual', 'auditory', 'kinesthetic', 'reading_writing'])

            # Generate features based on learning style
            if style_preference == 'visual':
                video_watch_time = np.random.beta(3, 1)  # High preference
                text_read_time = np.random.beta(1, 2)
                audio_listen_time = np.random.beta(1, 2)
                interactive_time = np.random.beta(2, 1)
                discussion_posts = np.random.poisson(1)
                practice_sessions = np.random.poisson(3)
                quiz_attempts = np.random.poisson(2)
                help_requests = np.random.poisson(1)
                avg_session_duration = np.random.normal(35, 10)
                content_reviews = np.random.poisson(2)
                bookmarks = np.random.poisson(3)
                fast_interactions = np.random.poisson(1)
                slow_interactions = np.random.poisson(2)

            elif style_preference == 'auditory':
                video_watch_time = np.random.beta(1, 2)
                text_read_time = np.random.beta(1, 2)
                audio_listen_time = np.random.beta(3, 1)  # High preference
                interactive_time = np.random.beta(2, 1)
                discussion_posts = np.random.poisson(4)  # High discussion
                practice_sessions = np.random.poisson(2)
                quiz_attempts = np.random.poisson(2)
                help_requests = np.random.poisson(2)
                avg_session_duration = np.random.normal(30, 8)
                content_reviews = np.random.poisson(1)
                bookmarks = np.random.poisson(1)
                fast_interactions = np.random.poisson(2)
                slow_interactions = np.random.poisson(1)

            elif style_preference == 'kinesthetic':
                video_watch_time = np.random.beta(1, 2)
                text_read_time = np.random.beta(1, 2)
                audio_listen_time = np.random.beta(1, 2)
                interactive_time = np.random.beta(3, 1)  # High preference
                discussion_posts = np.random.poisson(2)
                practice_sessions = np.random.poisson(5)  # High practice
                quiz_attempts = np.random.poisson(3)
                help_requests = np.random.poisson(1)
                avg_session_duration = np.random.normal(45, 12)  # Longer sessions
                content_reviews = np.random.poisson(3)
                bookmarks = np.random.poisson(2)
                fast_interactions = np.random.poisson(1)
                slow_interactions = np.random.poisson(3)  # More slow interactions

            else:  # reading_writing
                video_watch_time = np.random.beta(1, 2)
                text_read_time = np.random.beta(3, 1)  # High preference
                audio_listen_time = np.random.beta(1, 2)
                interactive_time = np.random.beta(1, 2)
                discussion_posts = np.random.poisson(1)
                practice_sessions = np.random.poisson(2)
                quiz_attempts = np.random.poisson(4)  # High quiz attempts
                help_requests = np.random.poisson(3)  # More help requests
                avg_session_duration = np.random.normal(40, 10)
                content_reviews = np.random.poisson(4)  # High reviews
                bookmarks = np.random.poisson(4)  # High bookmarks
                fast_interactions = np.random.poisson(3)
                slow_interactions = np.random.poisson(2)

            features_data = [
                video_watch_time, text_read_time, audio_listen_time, interactive_time,
                discussion_posts, practice_sessions, quiz_attempts, help_requests,
                avg_session_duration, content_reviews, bookmarks,
                fast_interactions, slow_interactions
            ]

            X.append(features_data)
            y.append(style_preference)

        return np.array(X), np.array(y)
