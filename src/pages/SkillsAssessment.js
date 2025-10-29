import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Alert, Badge } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { aiAssessment, SKILL_CATEGORIES, COMPETENCY_LEVELS } from '../services/aiAssessment';

function SkillsAssessment() {
    const { dispatch } = useUser();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [responses, setResponses] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [results, setResults] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [timeStarted, setTimeStarted] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        initializeAssessment();
        setTimeStarted(new Date());
    }, []);

    const initializeAssessment = async () => {
        await aiAssessment.initializeModel();
        setQuestions(getAssessmentQuestions());
    };

    const getAssessmentQuestions = () => {
        return [
            // Basic Digital Skills
            {
                id: 1,
                category: SKILL_CATEGORIES.BASIC_DIGITAL,
                question: "How comfortable are you with using a smartphone for calls and messaging?",
                type: "multiple_choice",
                options: [
                    { text: "Very comfortable - I use it daily", value: 4, correct: true },
                    { text: "Somewhat comfortable - I know the basics", value: 2, correct: false },
                    { text: "Not comfortable - I rarely use these features", value: 0, correct: false }
                ]
            },
            {
                id: 2,
                category: SKILL_CATEGORIES.BASIC_DIGITAL,
                question: "Can you use the internet to search for information?",
                type: "multiple_choice",
                options: [
                    { text: "Yes, I search online daily", value: 4, correct: true },
                    { text: "Sometimes, but I need help", value: 2, correct: false },
                    { text: "No, I don't know how to search", value: 0, correct: false }
                ]
            },
            {
                id: 3,
                category: SKILL_CATEGORIES.BASIC_DIGITAL,
                question: "Do you know how to create and use email?",
                type: "multiple_choice",
                options: [
                    { text: "Yes, I have email and use it regularly", value: 4, correct: true },
                    { text: "I have email but don't use it much", value: 2, correct: false },
                    { text: "I don't have an email account", value: 0, correct: false }
                ]
            },

            // Financial Management
            {
                id: 4,
                category: SKILL_CATEGORIES.FINANCIAL_MANAGEMENT,
                question: "How well do you use M-Pesa or other mobile money services?",
                type: "multiple_choice",
                options: [
                    { text: "Very well - I use it for most transactions", value: 4, correct: true },
                    { text: "Basic use - sending and receiving money", value: 2, correct: false },
                    { text: "I don't use mobile money services", value: 0, correct: false }
                ]
            },
            {
                id: 5,
                category: SKILL_CATEGORIES.FINANCIAL_MANAGEMENT,
                question: "Do you keep track of your business or personal finances?",
                type: "multiple_choice",
                options: [
                    { text: "Yes, I have a system for tracking money", value: 4, correct: true },
                    { text: "I try to keep track but it's not organized", value: 2, correct: false },
                    { text: "I don't keep financial records", value: 0, correct: false }
                ]
            },

            // Business Automation
            {
                id: 6,
                category: SKILL_CATEGORIES.BUSINESS_AUTOMATION,
                question: "Do you use any apps to help with your business or work?",
                type: "multiple_choice",
                options: [
                    { text: "Yes, I use several business apps", value: 4, correct: true },
                    { text: "I use one or two simple apps", value: 2, correct: false },
                    { text: "I don't use any business apps", value: 0, correct: false }
                ]
            },
            {
                id: 7,
                category: SKILL_CATEGORIES.BUSINESS_AUTOMATION,
                question: "Can you keep customer information organized?",
                type: "multiple_choice",
                options: [
                    { text: "Yes, I have a system for customer data", value: 4, correct: true },
                    { text: "I keep basic customer information", value: 2, correct: false },
                    { text: "I don't keep customer records", value: 0, correct: false }
                ]
            },

            // E-commerce
            {
                id: 8,
                category: SKILL_CATEGORIES.E_COMMERCE,
                question: "Have you ever sold anything online?",
                type: "multiple_choice",
                options: [
                    { text: "Yes, I sell online regularly", value: 4, correct: true },
                    { text: "I've tried selling online a few times", value: 2, correct: false },
                    { text: "I've never sold anything online", value: 0, correct: false }
                ]
            },

            // Digital Marketing
            {
                id: 9,
                category: SKILL_CATEGORIES.DIGITAL_MARKETING,
                question: "Do you use social media to promote your business or skills?",
                type: "multiple_choice",
                options: [
                    { text: "Yes, I actively use social media for business", value: 4, correct: true },
                    { text: "I use social media but not for business", value: 2, correct: false },
                    { text: "I don't use social media", value: 0, correct: false }
                ]
            },

            // Communication
            {
                id: 10,
                category: SKILL_CATEGORIES.COMMUNICATION,
                question: "How comfortable are you with basic English for business?",
                type: "multiple_choice",
                options: [
                    { text: "Very comfortable - I can communicate well", value: 4, correct: true },
                    { text: "Somewhat comfortable - I know some English", value: 2, correct: false },
                    { text: "Not comfortable - I prefer local languages", value: 0, correct: false }
                ]
            }
        ];
    };

    const handleAnswer = (selectedOption) => {
        setSelectedAnswer(selectedOption);

        // Add a small delay for better UX
        setTimeout(() => {
            const newResponse = {
                questionId: questions[currentQuestion].id,
                category: questions[currentQuestion].category,
                answer: selectedOption.text,
                value: selectedOption.value,
                correct: selectedOption.correct,
                timeSpent: new Date() - timeStarted
            };

            const newResponses = [...responses, newResponse];
            setResponses(newResponses);
            setSelectedAnswer(null);

            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            } else {
                completeAssessment(newResponses);
            }
        }, 500);
    };

    const completeAssessment = async (allResponses) => {
        setIsComplete(true);

        // Group responses by category
        const responsesByCategory = {};
        Object.values(SKILL_CATEGORIES).forEach(category => {
            responsesByCategory[category] = allResponses.filter(r => r.category === category);
        });

        // Calculate skill levels for each category
        const skillsProfile = {};
        Object.entries(responsesByCategory).forEach(([category, categoryResponses]) => {
            if (categoryResponses.length > 0) {
                skillsProfile[category] = aiAssessment.assessSkillLevel(categoryResponses, category);
            }
        });

        // Generate personalized learning path
        const learningPath = aiAssessment.generateLearningPath(skillsProfile);

        const totalTime = new Date() - timeStarted;
        const assessmentResults = {
            skillsProfile,
            learningPath,
            completedAt: new Date().toISOString(),
            totalScore: allResponses.reduce((sum, r) => sum + r.value, 0),
            maxScore: allResponses.length * 4,
            timeSpent: Math.round(totalTime / 1000 / 60), // minutes
            responses: allResponses.length
        };

        setResults(assessmentResults);

        // Save to user context
        dispatch({ type: 'SET_SKILLS_PROFILE', payload: skillsProfile });
        dispatch({ type: 'SET_LEARNING_PATH', payload: learningPath });
        dispatch({ type: 'SET_ASSESSMENT_RESULTS', payload: assessmentResults });
    };

    const getSkillLevelText = (level) => {
        switch (level) {
            case COMPETENCY_LEVELS.BEGINNER: return 'Beginner';
            case COMPETENCY_LEVELS.INTERMEDIATE: return 'Intermediate';
            case COMPETENCY_LEVELS.ADVANCED: return 'Advanced';
            case COMPETENCY_LEVELS.EXPERT: return 'Expert';
            default: return 'Unknown';
        }
    };

    const getSkillLevelDescription = (level) => {
        switch (level) {
            case COMPETENCY_LEVELS.BEGINNER: return 'You\'re just starting your digital journey';
            case COMPETENCY_LEVELS.INTERMEDIATE: return 'You have solid foundational skills';
            case COMPETENCY_LEVELS.ADVANCED: return 'You\'re proficient and ready for complex tasks';
            case COMPETENCY_LEVELS.EXPERT: return 'You have mastery-level skills';
            default: return 'Skill level assessment pending';
        }
    };

    const getCategoryName = (category) => {
        const names = {
            [SKILL_CATEGORIES.BASIC_DIGITAL]: 'Basic Digital Skills',
            [SKILL_CATEGORIES.BUSINESS_AUTOMATION]: 'Business Automation',
            [SKILL_CATEGORIES.E_COMMERCE]: 'E-Commerce',
            [SKILL_CATEGORIES.DIGITAL_MARKETING]: 'Digital Marketing',
            [SKILL_CATEGORIES.FINANCIAL_MANAGEMENT]: 'Financial Management',
            [SKILL_CATEGORIES.COMMUNICATION]: 'Communication'
        };
        return names[category] || category;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            [SKILL_CATEGORIES.BASIC_DIGITAL]: '📱',
            [SKILL_CATEGORIES.BUSINESS_AUTOMATION]: '⚙️',
            [SKILL_CATEGORIES.E_COMMERCE]: '🛒',
            [SKILL_CATEGORIES.DIGITAL_MARKETING]: '📢',
            [SKILL_CATEGORIES.FINANCIAL_MANAGEMENT]: '💰',
            [SKILL_CATEGORIES.COMMUNICATION]: '💬'
        };
        return icons[category] || '📚';
    };

    if (questions.length === 0) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Preparing your skills assessment...</p>
                </div>
            </Container>
        );
    }

    if (isComplete && results) {
        const overallScore = Math.round((results.totalScore / results.maxScore) * 100);
        const skillLevel = overallScore >= 90 ? 'Expert' :
            overallScore >= 70 ? 'Advanced' :
                overallScore >= 50 ? 'Intermediate' : 'Beginner';

        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="shadow-lg border-0 slide-in-up">
                            <Card.Header className="bg-success text-white text-center py-4">
                                <h2 className="mb-0">
                                    <span className="me-2">🎉</span>
                                    Assessment Complete!
                                </h2>
                                <p className="mb-0 mt-2 opacity-75">
                                    Completed in {results.timeSpent} minutes
                                </p>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {/* Overall Score */}
                                <div className="text-center mb-4">
                                    <div className="display-4 fw-bold text-primary mb-2">{overallScore}%</div>
                                    <h4 className="text-muted">Overall Digital Skills Level: <span className="text-primary">{skillLevel}</span></h4>
                                    <p className="text-muted">
                                        You scored {results.totalScore} out of {results.maxScore} points
                                    </p>
                                </div>

                                <Alert variant="info" className="mb-4">
                                    <Alert.Heading className="h6">
                                        <span className="me-2">💡</span>
                                        Your Personalized Assessment Results
                                    </Alert.Heading>
                                    <p className="mb-0">
                                        Based on your responses, we've identified your strengths and areas for improvement.
                                        Your learning path has been customized to help you grow most effectively.
                                    </p>
                                </Alert>

                                {/* Detailed Skills Breakdown */}
                                <h4 className="mb-4">Your Skills Profile:</h4>
                                <Row>
                                    {Object.entries(results.skillsProfile).map(([category, level]) => (
                                        <Col md={6} key={category} className="mb-4">
                                            <Card className="h-100 border-0 bg-light">
                                                <Card.Body className="text-center p-3">
                                                    <div className="fs-2 mb-2">{getCategoryIcon(category)}</div>
                                                    <h6 className="fw-bold mb-2">{getCategoryName(category)}</h6>
                                                    <Badge
                                                        bg={level === COMPETENCY_LEVELS.EXPERT ? 'success' :
                                                            level === COMPETENCY_LEVELS.ADVANCED ? 'info' :
                                                                level === COMPETENCY_LEVELS.INTERMEDIATE ? 'warning' : 'secondary'}
                                                        className="mb-2"
                                                    >
                                                        {getSkillLevelText(level)}
                                                    </Badge>
                                                    <p className="small text-muted mb-0">
                                                        {getSkillLevelDescription(level)}
                                                    </p>
                                                    <ProgressBar
                                                        now={(level / COMPETENCY_LEVELS.EXPERT) * 100}
                                                        variant={level === COMPETENCY_LEVELS.EXPERT ? 'success' :
                                                            level === COMPETENCY_LEVELS.ADVANCED ? 'info' :
                                                                level === COMPETENCY_LEVELS.INTERMEDIATE ? 'warning' : 'secondary'}
                                                        className="mt-2"
                                                        style={{ height: '6px' }}
                                                    />
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                <hr className="my-4" />

                                {/* Recommended Learning Path */}
                                <h4 className="mb-3">Your Personalized Learning Path:</h4>
                                <p className="text-muted mb-4">
                                    Based on your assessment, here are the top courses recommended for you:
                                </p>
                                <Row>
                                    {results.learningPath.slice(0, 3).map((module, index) => (
                                        <Col md={4} key={module.id} className="mb-3">
                                            <Card className="h-100 border-primary hover-lift">
                                                <Card.Body className="text-center p-3">
                                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                                                        style={{ width: '40px', height: '40px' }}>
                                                        <span className="fw-bold">{index + 1}</span>
                                                    </div>
                                                    <h6 className="fw-bold mb-2">{module.title}</h6>
                                                    <p className="small text-muted mb-2">{module.description}</p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <small className="text-primary">
                                                            <span className="me-1">⏱️</span>
                                                            {module.estimatedTime} min
                                                        </small>
                                                        <Badge bg="outline-primary" className="small">
                                                            Priority {module.priority}
                                                        </Badge>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                {/* Action Buttons */}
                                <div className="text-center mt-4">
                                    <Button
                                        href="/learning"
                                        variant="primary"
                                        size="lg"
                                        className="me-3 pulse-animation"
                                    >
                                        <span className="me-2">🚀</span>
                                        Start Learning Now
                                    </Button>
                                    <Button
                                        href="/dashboard"
                                        variant="outline-primary"
                                        size="lg"
                                    >
                                        <span className="me-2">📊</span>
                                        View Dashboard
                                    </Button>
                                </div>

                                {/* Additional Information */}
                                <div className="mt-4 p-3 bg-light rounded">
                                    <h6 className="fw-bold mb-2">
                                        <span className="me-2">📈</span>
                                        What's Next?
                                    </h6>
                                    <ul className="list-unstyled mb-0">
                                        <li className="mb-1">
                                            <span className="me-2">✓</span>
                                            Follow your personalized learning path
                                        </li>
                                        <li className="mb-1">
                                            <span className="me-2">✓</span>
                                            Practice with real business tools
                                        </li>
                                        <li className="mb-1">
                                            <span className="me-2">✓</span>
                                            Track your progress on the dashboard
                                        </li>
                                        <li className="mb-0">
                                            <span className="me-2">✓</span>
                                            Retake assessment anytime to see improvement
                                        </li>
                                    </ul>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="shadow-lg border-0 fade-in">
                        <Card.Header className="bg-primary text-white py-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">
                                    <span className="me-2">📊</span>
                                    Digital Skills Assessment
                                </h3>
                                <Badge bg="light" text="primary" className="fs-6">
                                    Question {currentQuestion + 1} of {questions.length}
                                </Badge>
                            </div>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="opacity-75">Progress</small>
                                    <small className="opacity-75">{Math.round(progress)}%</small>
                                </div>
                                <ProgressBar
                                    now={progress}
                                    style={{ height: '8px' }}
                                    variant="light"
                                />
                            </div>
                        </Card.Header>

                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <div className="fs-3 mb-3">
                                    {getCategoryIcon(currentQ.category)}
                                </div>
                                <Badge bg="secondary" className="mb-3">
                                    {getCategoryName(currentQ.category)}
                                </Badge>
                                <h4 className="fw-bold mb-3">{currentQ.question}</h4>
                                <p className="text-muted">
                                    Choose the option that best describes your current situation
                                </p>
                            </div>

                            <div className="d-grid gap-3">
                                {currentQ.options.map((option, index) => (
                                    <Button
                                        key={index}
                                        variant={selectedAnswer === option ? "primary" : "outline-primary"}
                                        size="lg"
                                        className="text-start p-4 hover-lift"
                                        onClick={() => handleAnswer(option)}
                                        disabled={selectedAnswer !== null}
                                    >
                                        <div className="d-flex align-items-center">
                                            <span className="me-3 fs-5 fw-bold">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span>{option.text}</span>
                                            {selectedAnswer === option && (
                                                <span className="ms-auto">
                                                    <span className="spinner-border spinner-border-sm" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>

                            <div className="text-center mt-4">
                                <small className="text-muted">
                                    <span className="me-2">🔒</span>
                                    Your responses are private and secure. This assessment takes 5-10 minutes.
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default SkillsAssessment;