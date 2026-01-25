import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './BaselineAssessment.css';

const BaselineAssessment = () => {
    const { skillCategory } = useParams();
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [confidence, setConfidence] = useState(3);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('en');

    const translations = {
        en: {
            title: 'Baseline Assessment',
            subtitle: 'This assessment helps us understand your current skill level',
            question: 'Question',
            of: 'of',
            selectAnswer: 'Select your answer:',
            confidence: 'How confident are you?',
            notConfident: 'Not Confident',
            veryConfident: 'Very Confident',
            next: 'Next',
            submit: 'Submit Assessment',
            submitting: 'Submitting...',
            loading: 'Loading assessment...'
        },
        sw: {
            title: 'Tathmini ya Msingi',
            subtitle: 'Tathmini hii inatusaidia kuelewa kiwango chako cha sasa',
            question: 'Swali',
            of: 'ya',
            selectAnswer: 'Chagua jibu lako:',
            confidence: 'Una uhakika kiasi gani?',
            notConfident: 'Sina Uhakika',
            veryConfident: 'Nina Uhakika Sana',
            next: 'Endelea',
            submit: 'Wasilisha Tathmini',
            submitting: 'Inawasilisha...',
            loading: 'Inapakia tathmini...'
        }
    };

    const t = translations[language];

    useEffect(() => {
        loadAssessment();
    }, [skillCategory]);

    const loadAssessment = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/research-assessments/generate/${skillCategory}`);
            setAssessment(response.data.data);
            setQuestionStartTime(Date.now());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleNext = () => {
        if (!selectedAnswer) return;

        const responseTime = Date.now() - questionStartTime;

        const newResponse = {
            questionId: assessment.questions[currentQuestionIndex].questionId,
            answer: selectedAnswer,
            responseTime,
            confidence
        };

        setResponses([...responses, newResponse]);

        if (currentQuestionIndex < assessment.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer('');
            setConfidence(3);
            setQuestionStartTime(Date.now());
        } else {
            handleSubmit([...responses, newResponse]);
        }
    };

    const handleSubmit = async (finalResponses) => {
        try {
            setSubmitting(true);

            const submissionData = {
                skillCategory: assessment.skillCategory,
                assessmentType: assessment.assessmentType,
                responses: finalResponses,
                metadata: {
                    deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    networkType: navigator.connection?.effectiveType || 'unknown',
                    language,
                    totalDuration: Date.now() - (Date.now() - responses.reduce((sum, r) => sum + r.responseTime, 0))
                }
            };

            const response = await api.post('/research-assessments/submit', submissionData);

            // Navigate to results page
            navigate('/assessment-results', {
                state: {
                    results: response.data.data,
                    skillCategory: assessment.skillCategory
                }
            });
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="baseline-assessment-container">
                <div className="loading-state">{t.loading}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="baseline-assessment-container">
                <div className="error-state">Error: {error}</div>
            </div>
        );
    }

    if (!assessment) return null;

    const currentQuestion = assessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

    return (
        <div className="baseline-assessment-container">
            <div className="assessment-header">
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
                <div className="language-toggle">
                    <button
                        className={language === 'en' ? 'active' : ''}
                        onClick={() => setLanguage('en')}
                    >
                        EN
                    </button>
                    <button
                        className={language === 'sw' ? 'active' : ''}
                        onClick={() => setLanguage('sw')}
                    >
                        SW
                    </button>
                </div>
            </div>

            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="question-counter">
                {t.question} {currentQuestionIndex + 1} {t.of} {assessment.questions.length}
            </div>

            <div className="question-card">
                <h2>{currentQuestion.question}</h2>

                <div className="answer-options">
                    <p>{t.selectAnswer}</p>
                    {['A', 'B', 'C', 'D'].map(option => (
                        <button
                            key={option}
                            className={`answer-option ${selectedAnswer === option ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="confidence-slider">
                    <label>{t.confidence}</label>
                    <div className="slider-container">
                        <span>{t.notConfident}</span>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={confidence}
                            onChange={(e) => setConfidence(parseInt(e.target.value))}
                        />
                        <span>{t.veryConfident}</span>
                    </div>
                    <div className="confidence-value">{confidence}/5</div>
                </div>

                <button
                    className="next-button"
                    onClick={handleNext}
                    disabled={!selectedAnswer || submitting}
                >
                    {currentQuestionIndex === assessment.questions.length - 1
                        ? submitting ? t.submitting : t.submit
                        : t.next}
                </button>
            </div>
        </div>
    );
};

export default BaselineAssessment;
