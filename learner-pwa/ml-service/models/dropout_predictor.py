"""
Dropout Predictor Model
Predicts the risk of user dropout based on engagement metrics
"""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os
import logging

logger = logging.getLogger(__name__)

class DropoutPredictor:
    """
    Logistic Regression model for dropout risk prediction
    Predicts probability of user dropping out (0-1)
    """
    
    def __init__(self, model_path=None):
        self.model = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced',
            solver='lbfgs'
        )
        self.model_path = model_path or './models/saved/dropout_predictor.pkl'
        self.is_trained = False
        self.feature_coefficients = None
        
    def train(self, X_train, y_train, X_val=None, y_val=None):
        """
        Train the dropout predictor
        
        Args:
            X_train: Training features
            y_train: Training labels (0=retained, 1=dropped out)
            X_val: Validation features (optional)
            y_val: Validation labels (optional)
            
        Returns:
            Training metrics
        """
        logger.info("Training dropout predictor...")
        
        # Train the model
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Store feature coefficients
        self.feature_coefficients = self.model.coef_[0]
        
        # Evaluate on training set
        train_pred = self.model.predict(X_train)
        train_pred_proba = self.model.predict_proba(X_train)[:, 1]
        
        train_accuracy = accuracy_score(y_train, train_pred)
        train_auc = roc_auc_score(y_train, train_pred_proba)
        
        metrics = {
            'train_accuracy': train_accuracy,
            'train_auc': train_auc,
            'train_samples': len(X_train)
        }
        
        # Evaluate on validation set if provided
        if X_val is not None and y_val is not None:
            val_pred = self.model.predict(X_val)
            val_pred_proba = self.model.predict_proba(X_val)[:, 1]
            
            val_accuracy = accuracy_score(y_val, val_pred)
            val_precision = precision_score(y_val, val_pred)
            val_recall = recall_score(y_val, val_pred)
            val_f1 = f1_score(y_val, val_pred)
            val_auc = roc_auc_score(y_val, val_pred_proba)
            
            metrics.update({
                'val_accuracy': val_accuracy,
                'val_precision': val_precision,
                'val_recall': val_recall,
                'val_f1': val_f1,
                'val_auc': val_auc,
                'val_samples': len(X_val)
            })
            
            logger.info(f"Validation AUC: {val_auc:.4f}, F1: {val_f1:.4f}")
        
        logger.info(f"Training AUC: {train_auc:.4f}")
        
        return metrics
    
    def predict_risk(self, X):
        """
        Predict dropout risk probability
        
        Args:
            X: Feature matrix
            
        Returns:
            Dropout risk probabilities (0-1)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        return self.model.predict_proba(X)[:, 1]
    
    def predict_with_factors(self, X, feature_names=None):
        """
        Predict dropout risk with contributing factors
        
        Args:
            X: Feature matrix
            feature_names: List of feature names
            
        Returns:
            List of predictions with risk factors
        """
        risk_scores = self.predict_risk(X)
        
        results = []
        for i, risk in enumerate(risk_scores):
            # Identify top risk factors
            factors = []
            if feature_names and self.feature_coefficients is not None:
                # Get feature contributions
                feature_contributions = X[i] * self.feature_coefficients
                top_indices = np.argsort(np.abs(feature_contributions))[-3:][::-1]
                
                for idx in top_indices:
                    if idx < len(feature_names):
                        factors.append({
                            'factor': feature_names[idx],
                            'contribution': float(feature_contributions[idx])
                        })
            
            # Determine risk level
            if risk < 0.3:
                risk_level = 'low'
            elif risk < 0.6:
                risk_level = 'medium'
            else:
                risk_level = 'high'
            
            # Generate interventions based on risk level
            interventions = self._generate_interventions(risk_level, factors)
            
            results.append({
                'dropout_risk': float(risk),
                'risk_level': risk_level,
                'factors': factors,
                'interventions': interventions
            })
        
        return results
    
    def _generate_interventions(self, risk_level, factors):
        """Generate intervention recommendations based on risk level"""
        interventions = []
        
        if risk_level == 'high':
            interventions.append('Send immediate personalized outreach message')
            interventions.append('Offer one-on-one support session')
            interventions.append('Provide motivational content and success stories')
        elif risk_level == 'medium':
            interventions.append('Send encouraging progress update')
            interventions.append('Recommend easier modules to build confidence')
            interventions.append('Enable peer support connections')
        else:
            interventions.append('Continue current learning path')
            interventions.append('Celebrate achievements and milestones')
        
        # Add factor-specific interventions
        for factor in factors:
            factor_name = factor.get('factor', '')
            if 'days_since_last_active' in factor_name:
                interventions.append('Send re-engagement notification')
            elif 'avg_score' in factor_name:
                interventions.append('Provide additional learning resources')
            elif 'modules_completed' in factor_name:
                interventions.append('Highlight progress and next steps')
        
        return list(set(interventions))  # Remove duplicates
    
    def save(self, path=None):
        """Save the trained model"""
        save_path = path or self.model_path
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        joblib.dump({
            'model': self.model,
            'is_trained': self.is_trained,
            'feature_coefficients': self.feature_coefficients
        }, save_path)
        
        logger.info(f"Model saved to {save_path}")
    
    def load(self, path=None):
        """Load a trained model"""
        load_path = path or self.model_path
        
        if not os.path.exists(load_path):
            logger.warning(f"Model file not found: {load_path}")
            return False
        
        data = joblib.load(load_path)
        self.model = data['model']
        self.is_trained = data['is_trained']
        self.feature_coefficients = data.get('feature_coefficients')
        
        logger.info(f"Model loaded from {load_path}")
        return True
    
    def get_feature_importance(self):
        """Get feature coefficients (importance)"""
        if self.feature_coefficients is None:
            return None
        
        return self.feature_coefficients.tolist()
