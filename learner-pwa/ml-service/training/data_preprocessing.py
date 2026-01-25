"""
Data Preprocessing Module
Handles feature extraction and data preparation for ML models
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Handles data preprocessing and feature extraction for ML models"""

    def __init__(self):
        self.feature_stats = {}

    def extract_assessment_features(self, assessment_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract features from assessment response data

        Args:
            assessment_data: Dictionary containing responses, timings, confidence

        Returns:
            Dictionary of extracted features
        """
        try:
            responses = assessment_data.get('responses', [])
            timings = assessment_data.get('timings', [])
            confidence = assessment_data.get('confidence', [])

            if not responses:
                return self._get_default_assessment_features()

            # Basic accuracy metrics
            correct_answers = sum(1 for r in responses if r.get('correct', False))
            accuracy = correct_answers / len(responses)

            # Timing analysis
            if timings:
                avg_response_time = np.mean(timings)
                response_time_std = np.std(timings)
                time_consistency = 1 / (1 + response_time_std / avg_response_time)  # Higher is more consistent
            else:
                avg_response_time = 30.0  # Default
                time_consistency = 0.5

            # Confidence analysis
            if confidence:
                avg_confidence = np.mean(confidence)
                confidence_consistency = 1 - np.std(confidence)  # Higher is more consistent
            else:
                avg_confidence = 0.5
                confidence_consistency = 0.5

            # Pattern analysis
            difficulty_progression = self._analyze_difficulty_progression(responses)
            error_patterns = self._analyze_error_patterns(responses)

            # Learning behavior indicators
            help_requests = sum(1 for r in responses if r.get('help_requested', False))
            review_patterns = sum(1 for r in responses if r.get('reviewed', False))

            features = {
                'accuracy': accuracy,
                'avg_response_time': avg_response_time,
                'time_consistency': time_consistency,
                'avg_confidence': avg_confidence,
                'confidence_consistency': confidence_consistency,
                'difficulty_progression': difficulty_progression,
                'error_patterns': error_patterns,
                'help_requests': help_requests / len(responses),  # Normalized
                'review_patterns': review_patterns / len(responses)  # Normalized
            }

            return features

        except Exception as e:
            logger.error(f"Error extracting assessment features: {e}")
            return self._get_default_assessment_features()

    def extract_learning_style_features(self, interaction_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract features from user interaction data for learning style detection

        Args:
            interaction_data: Dictionary containing interaction patterns

        Returns:
            Dictionary of extracted features
        """
        try:
            timings = interaction_data.get('timings', {})
            interactions = interaction_data.get('interactions', [])

            # Time spent on different content types
            video_watch_time = timings.get('video', 0)
            text_read_time = timings.get('text', 0)
            audio_listen_time = timings.get('audio', 0)
            interactive_time = timings.get('interactive', 0)

            # Normalize time features (convert to percentages if total time available)
            total_content_time = video_watch_time + text_read_time + audio_listen_time + interactive_time
            if total_content_time > 0:
                video_watch_time /= total_content_time
                text_read_time /= total_content_time
                audio_listen_time /= total_content_time
                interactive_time /= total_content_time

            # Interaction counts
            discussion_posts = sum(1 for i in interactions if i.get('type') == 'discussion')
            practice_sessions = sum(1 for i in interactions if i.get('type') == 'practice')
            quiz_attempts = sum(1 for i in interactions if i.get('type') == 'quiz')
            help_requests = sum(1 for i in interactions if i.get('type') == 'help')

            # Session patterns
            session_durations = [i.get('duration', 0) for i in interactions if i.get('type') == 'session']
            avg_session_duration = np.mean(session_durations) if session_durations else 30.0

            # Content engagement
            content_reviews = sum(1 for i in interactions if i.get('type') == 'review')
            bookmarks = sum(1 for i in interactions if i.get('type') == 'bookmark')

            # Learning pace indicators
            fast_interactions = sum(1 for i in interactions if i.get('duration', 0) < 10)
            slow_interactions = sum(1 for i in interactions if i.get('duration', 0) > 60)

            features = {
                'video_watch_time': video_watch_time,
                'text_read_time': text_read_time,
                'audio_listen_time': audio_listen_time,
                'interactive_time': interactive_time,
                'discussion_posts': discussion_posts,
                'practice_sessions': practice_sessions,
                'quiz_attempts': quiz_attempts,
                'help_requests': help_requests,
                'avg_session_duration': avg_session_duration,
                'content_reviews': content_reviews,
                'bookmarks': bookmarks,
                'fast_interactions': fast_interactions,
                'slow_interactions': slow_interactions
            }

            return features

        except Exception as e:
            logger.error(f"Error extracting learning style features: {e}")
            return self._get_default_learning_style_features()

    def _analyze_difficulty_progression(self, responses: List[Dict]) -> float:
        """Analyze performance progression across difficulty levels"""
        try:
            # Group responses by difficulty
            difficulty_groups = {}
            for response in responses:
                diff = response.get('difficulty', 1)
                if diff not in difficulty_groups:
                    difficulty_groups[diff] = []
                difficulty_groups[diff].append(response.get('correct', False))

            if not difficulty_groups:
                return 0.5

            # Calculate accuracy by difficulty
            progression_score = 0
            total_weight = 0

            for diff, answers in difficulty_groups.items():
                accuracy = sum(answers) / len(answers)
                weight = diff  # Higher difficulty = higher weight
                progression_score += accuracy * weight
                total_weight += weight

            return progression_score / total_weight if total_weight > 0 else 0.5

        except Exception:
            return 0.5

    def _analyze_error_patterns(self, responses: List[Dict]) -> float:
        """Analyze patterns in incorrect answers"""
        try:
            incorrect_responses = [r for r in responses if not r.get('correct', False)]

            if not incorrect_responses:
                return 0.0  # No errors = perfect pattern

            # Analyze error types (simplified)
            conceptual_errors = sum(1 for r in incorrect_responses if r.get('error_type') == 'conceptual')
            calculation_errors = sum(1 for r in incorrect_responses if r.get('error_type') == 'calculation')
            attention_errors = sum(1 for r in incorrect_responses if r.get('error_type') == 'attention')

            total_errors = len(incorrect_responses)

            # Lower score for more conceptual errors (harder to fix)
            error_severity = (conceptual_errors * 0.8 + calculation_errors * 0.5 + attention_errors * 0.2) / total_errors

            return error_severity

        except Exception:
            return 0.3

    def _get_default_assessment_features(self) -> Dict[str, float]:
        """Return default features when extraction fails"""
        return {
            'accuracy': 0.5,
            'avg_response_time': 30.0,
            'time_consistency': 0.5,
            'avg_confidence': 0.5,
            'confidence_consistency': 0.5,
            'difficulty_progression': 0.5,
            'error_patterns': 0.3,
            'help_requests': 0.2,
            'review_patterns': 0.3
        }

    def _get_default_learning_style_features(self) -> Dict[str, float]:
        """Return default features when extraction fails"""
        return {
            'video_watch_time': 0.25,
            'text_read_time': 0.25,
            'audio_listen_time': 0.25,
            'interactive_time': 0.25,
            'discussion_posts': 2,
            'practice_sessions': 2,
            'quiz_attempts': 3,
            'help_requests': 1,
            'avg_session_duration': 30.0,
            'content_reviews': 2,
            'bookmarks': 1,
            'fast_interactions': 2,
            'slow_interactions': 1
        }

    def normalize_features(self, features: Dict[str, float], feature_type: str) -> np.ndarray:
        """
        Normalize features using stored statistics

        Args:
            features: Raw feature dictionary
            feature_type: Type of features ('assessment' or 'learning_style')

        Returns:
            Normalized feature array
        """
        if feature_type not in self.feature_stats:
            # Initialize with current features if no stats available
            feature_values = list(features.values())
            self.feature_stats[feature_type] = {
                'mean': np.mean(feature_values),
                'std': np.std(feature_values)
            }

        stats = self.feature_stats[feature_type]
        normalized = [(val - stats['mean']) / stats['std'] for val in features.values()]

        return np.array(normalized)

    def prepare_training_data(self, raw_data: List[Dict], feature_type: str, target_col: str = None):
        """
        Prepare training data from raw records

        Args:
            raw_data: List of raw data records
            feature_type: Type of features to extract
            target_col: Target column name (if applicable)

        Returns:
            X, y: Feature matrix and targets
        """
        X = []
        y = []

        extract_method = {
            'assessment': self.extract_assessment_features,
            'learning_style': self.extract_learning_style_features
        }.get(feature_type)

        if not extract_method:
            raise ValueError(f"Unknown feature type: {feature_type}")

        for record in raw_data:
            features = extract_method(record)
            X.append(list(features.values()))

            if target_col and target_col in record:
                y.append(record[target_col])

        X = np.array(X)
        y = np.array(y) if y else None

        return X, y
