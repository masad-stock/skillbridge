import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CompetencyRadar from '../components/learning/CompetencyRadar';
import './CompetencyDashboard.css';

const CompetencyDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [competencyData, setCompetencyData] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCompetencyData();
    }, []);

    const loadCompetencyData = async () => {
        try {
            setLoading(true);
            const [latestResponse, historyResponse] = await Promise.all([
                api.get('/api/v1/competency/latest'),
                api.get('/api/v1/competency/history?limit=5')
            ]);

            if (latestResponse.data.success) {
                setCompetencyData(latestResponse.data.data);
            }

            if (historyResponse.data.success) {
                setHistory(historyResponse.data.data);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setError('No competency evaluation found. Complete an assessment to get started!');
            } else {
                setError('Error loading competency data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async () => {
        try {
            setEvaluating(true);
            setError(null);

            const response = await api.post('/api/v1/competency/evaluate', {
                method: 'hybrid'
            });

            if (response.data.success) {
                setCompetencyData(response.data.data);
                alert('Competency evaluation completed successfully!');
                loadCompetencyData(); // Reload to get updated history
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error evaluating competency');
        } finally {
            setEvaluating(false);
        }
    };

    const getLevelBadgeClass = (level) => {
        const classes = {
            beginner: 'badge-beginner',
            intermediate: 'badge-intermediate',
            advanced: 'badge-advanced',
            expert: 'badge-expert'
        };
        return classes[level] || 'badge-beginner';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="competency-dashboard loading">
                <div className="spinner"></div>
                <p>Loading competency data...</p>
            </div>
        );
    }

    return (
        <div className="competency-dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Your Digital Skills Competency</h2>
                    <p className="subtitle">Track your progress across key digital skill areas</p>
                </div>
                <button
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="btn btn-primary"
                >
                    {evaluating ? 'Evaluating...' : 'Re-evaluate Skills'}
                </button>
            </div>

            {error && (
                <div className="alert alert-info">
                    {error}
                    {error.includes('No competency') && (
                        <button
                            onClick={() => navigate('/assessment')}
                            className="btn btn-sm btn-primary"
                            style={{ marginLeft: '10px' }}
                        >
                            Take Assessment
                        </button>
                    )}
                </div>
            )}

            {competencyData && (
                <>
                    {/* Overall Score Card */}
                    <div className="overall-score-card">
                        <div className="score-circle">
                            <svg viewBox="0 0 200 200">
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    stroke="#ecf0f1"
                                    strokeWidth="20"
                                />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    stroke="#3498db"
                                    strokeWidth="20"
                                    strokeDasharray={`${(competencyData.overallScore / 100) * 565} 565`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 100 100)"
                                />
                                <text
                                    x="100"
                                    y="100"
                                    textAnchor="middle"
                                    dy="10"
                                    fontSize="48"
                                    fontWeight="bold"
                                    fill="#2c3e50"
                                >
                                    {competencyData.overallScore}
                                </text>
                            </svg>
                        </div>
                        <div className="score-details">
                            <h3>Overall Competency Score</h3>
                            <span className={`level-badge ${getLevelBadgeClass(competencyData.overallLevel)}`}>
                                {competencyData.overallLevel.toUpperCase()}
                            </span>
                            <div className="score-metrics">
                                <div className="metric">
                                    <span className="metric-label">Learning Velocity</span>
                                    <span className="metric-value">{competencyData.learningVelocity.toFixed(1)}/10</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Time to Next Level</span>
                                    <span className="metric-value">{competencyData.estimatedTimeToNextLevel}h</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Data Quality</span>
                                    <span className="metric-value">{competencyData.dataQuality}</span>
                                </div>
                            </div>
                            <p className="evaluation-date">
                                Last evaluated: {formatDate(competencyData.evaluationDate)}
                            </p>
                        </div>
                    </div>

                    {/* Competency Radar Chart */}
                    <div className="radar-section">
                        <h3>Skills Breakdown</h3>
                        <CompetencyRadar competencies={competencyData.competencies} size={500} />
                    </div>

                    {/* Strengths and Improvements */}
                    <div className="strengths-improvements-grid">
                        <div className="strengths-card">
                            <h3>💪 Your Strengths</h3>
                            <div className="domain-list">
                                {competencyData.strengthAreas.map((area, index) => (
                                    <div key={index} className="domain-item strength">
                                        <span className="domain-name">
                                            {area.domain.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <div className="domain-score-bar">
                                            <div
                                                className="score-fill strength-fill"
                                                style={{ width: `${area.score}%` }}
                                            ></div>
                                            <span className="score-text">{area.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="improvements-card">
                            <h3>🎯 Areas for Improvement</h3>
                            <div className="domain-list">
                                {competencyData.improvementAreas.map((area, index) => (
                                    <div key={index} className="domain-item improvement">
                                        <div className="domain-header">
                                            <span className="domain-name">
                                                {area.domain.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className={`priority-badge priority-${area.priority}`}>
                                                {area.priority}
                                            </span>
                                        </div>
                                        <div className="domain-score-bar">
                                            <div
                                                className="score-fill improvement-fill"
                                                style={{ width: `${area.score}%` }}
                                            ></div>
                                            <span className="score-text">{area.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recommended Modules */}
                    {competencyData.suggestedModules && competencyData.suggestedModules.length > 0 && (
                        <div className="recommendations-section">
                            <h3>📚 Recommended Learning Modules</h3>
                            <div className="module-recommendations">
                                {competencyData.suggestedModules.map((suggestion, index) => (
                                    <div key={index} className="recommendation-card">
                                        <div className="recommendation-priority">
                                            Priority: {suggestion.priority}
                                        </div>
                                        <h4>{suggestion.moduleId?.title || 'Module'}</h4>
                                        <p className="recommendation-reason">{suggestion.reason}</p>
                                        <button
                                            onClick={() => navigate(`/learning?module=${suggestion.moduleId?._id}`)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Start Learning
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress History */}
                    {history.length > 1 && (
                        <div className="history-section">
                            <h3>📈 Progress Over Time</h3>
                            <div className="history-chart">
                                {history.reverse().map((evaluation, index) => (
                                    <div key={evaluation._id} className="history-point">
                                        <div className="history-date">{formatDate(evaluation.evaluationDate)}</div>
                                        <div className="history-bar-container">
                                            <div
                                                className="history-bar"
                                                style={{ height: `${evaluation.overallScore}%` }}
                                            >
                                                <span className="history-score">{evaluation.overallScore}</span>
                                            </div>
                                        </div>
                                        <div className="history-level">
                                            <span className={`level-badge-sm ${getLevelBadgeClass(evaluation.overallLevel)}`}>
                                                {evaluation.overallLevel.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CompetencyDashboard;
