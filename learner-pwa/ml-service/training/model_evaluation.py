"""
Model Evaluation Module
Evaluates trained ML models and generates performance reports
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
import logging

logger = logging.getLogger(__name__)

class ModelEvaluator:
    """
    Evaluates ML model performance
    """
    
    def evaluate_classifier(self, model, X_test, y_test, model_name="Classifier"):
        """
        Evaluate a classification model
        
        Args:
            model: Trained model
            X_test: Test features
            y_test: Test labels
            model_name: Name of the model
            
        Returns:
            Dictionary of evaluation metrics
        """
        logger.info(f"Evaluating {model_name}...")
        
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        
        # For multi-class, use weighted average
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # Classification report
        report = classification_report(y_test, y_pred, zero_division=0)
        
        metrics = {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'confusion_matrix': cm.tolist(),
            'classification_report': report,
            'test_samples': len(y_test)
        }
        
        logger.info(f"{model_name} Accuracy: {accuracy:.4f}")
        logger.info(f"{model_name} F1 Score: {f1:.4f}")
        
        return metrics
    
    def evaluate_binary_classifier(self, model, X_test, y_test, model_name="Binary Classifier"):
        """
        Evaluate a binary classification model (e.g., dropout predictor)
        
        Args:
            model: Trained model
            X_test: Test features
            y_test: Test labels
            model_name: Name of the model
            
        Returns:
            Dictionary of evaluation metrics
        """
        logger.info(f"Evaluating {model_name}...")
        
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        auc = roc_auc_score(y_test, y_pred_proba)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # ROC curve
        fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
        
        metrics = {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'auc_roc': float(auc),
            'confusion_matrix': cm.tolist(),
            'roc_curve': {
                'fpr': fpr.tolist(),
                'tpr': tpr.tolist(),
                'thresholds': thresholds.tolist()
            },
            'test_samples': len(y_test)
        }
        
        logger.info(f"{model_name} AUC-ROC: {auc:.4f}")
        logger.info(f"{model_name} F1 Score: {f1:.4f}")
        
        return metrics
    
    def evaluate_clustering(self, model, X_test, model_name="Clustering"):
        """
        Evaluate a clustering model
        
        Args:
            model: Trained model
            X_test: Test features
            model_name: Name of the model
            
        Returns:
            Dictionary of evaluation metrics
        """
        from sklearn.metrics import silhouette_score, davies_bouldin_score
        
        logger.info(f"Evaluating {model_name}...")
        
        # Make predictions
        labels = model.predict(X_test)
        
        # Calculate metrics
        silhouette = silhouette_score(X_test, labels)
        davies_bouldin = davies_bouldin_score(X_test, labels)
        
        # Cluster sizes
        unique, counts = np.unique(labels, return_counts=True)
        cluster_sizes = dict(zip(unique.tolist(), counts.tolist()))
        
        metrics = {
            'silhouette_score': float(silhouette),
            'davies_bouldin_score': float(davies_bouldin),
            'n_clusters': len(unique),
            'cluster_sizes': cluster_sizes,
            'test_samples': len(X_test)
        }
        
        logger.info(f"{model_name} Silhouette Score: {silhouette:.4f}")
        
        return metrics
    
    def compare_models(self, results_dict):
        """
        Compare multiple model results
        
        Args:
            results_dict: Dictionary of model names and their metrics
            
        Returns:
            Comparison summary
        """
        logger.info("Comparing models...")
        
        comparison = {}
        
        for model_name, metrics in results_dict.items():
            comparison[model_name] = {
                'accuracy': metrics.get('accuracy', 'N/A'),
                'f1_score': metrics.get('f1_score', 'N/A'),
                'auc_roc': metrics.get('auc_roc', 'N/A'),
                'silhouette_score': metrics.get('silhouette_score', 'N/A')
            }
        
        return comparison
    
    def generate_report(self, model_name, metrics, output_path=None):
        """
        Generate a detailed evaluation report
        
        Args:
            model_name: Name of the model
            metrics: Evaluation metrics
            output_path: Path to save report (optional)
            
        Returns:
            Report string
        """
        report = f"""
{'=' * 60}
MODEL EVALUATION REPORT: {model_name}
{'=' * 60}

Test Samples: {metrics.get('test_samples', 'N/A')}

Performance Metrics:
-------------------
Accuracy:  {metrics.get('accuracy', 'N/A'):.4f}
Precision: {metrics.get('precision', 'N/A'):.4f}
Recall:    {metrics.get('recall', 'N/A'):.4f}
F1 Score:  {metrics.get('f1_score', 'N/A'):.4f}
"""
        
        if 'auc_roc' in metrics:
            report += f"AUC-ROC:   {metrics['auc_roc']:.4f}\n"
        
        if 'silhouette_score' in metrics:
            report += f"Silhouette Score: {metrics['silhouette_score']:.4f}\n"
        
        if 'confusion_matrix' in metrics:
            report += f"\nConfusion Matrix:\n{np.array(metrics['confusion_matrix'])}\n"
        
        if 'classification_report' in metrics:
            report += f"\nClassification Report:\n{metrics['classification_report']}\n"
        
        report += "=" * 60 + "\n"
        
        if output_path:
            with open(output_path, 'w') as f:
                f.write(report)
            logger.info(f"Report saved to {output_path}")
        
        return report
