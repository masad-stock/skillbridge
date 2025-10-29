import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Modal, Alert } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useOffline } from '../context/OfflineContext';
import { SKILL_CATEGORIES } from '../services/aiAssessment';

function LearningPath() {
    const { learningPath, progress, dispatch } = useUser();
    const isOnline = useOffline();
    const [selectedModule, setSelectedModule] = useState(null);
    const [showModule, setShowModule] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(0);
    const [moduleProgress, setModuleProgress] = useState(0);

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

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 1: return 'success';
            case 2: return 'warning';
            case 3: return 'info';
            case 4: return 'danger';
            default: return 'secondary';
        }
    };

    const getDifficultyText = (difficulty) => {
        switch (difficulty) {
            case 1: return 'Easy';
            case 2: return 'Medium';
            case 3: return 'Hard';
            case 4: return 'Expert';
            default: return 'Unknown';
        }
    };

    const getModuleContent = (moduleId) => {
        // This would typically come from a backend API
        // For now, we'll generate content based on the module
        const contentMap = {
            'bd_001': {
                title: 'Mobile Phone Basics',
                lessons: [
                    {
                        title: 'Introduction to Smartphones',
                        content: 'Watch this comprehensive video to learn smartphone basics including powering on/off, navigation, and essential features.',
                        duration: 15,
                        type: 'video',
                        youtubeUrl: 'https://www.youtube.com/watch?v=8wHJuLNvNRE'
                    },
                    {
                        title: 'Making and Receiving Calls',
                        content: 'Practice making calls, answering calls, and managing your call history.',
                        duration: 10,
                        type: 'interactive'
                    },
                    {
                        title: 'Text Messaging Basics',
                        content: 'Learn to send, receive, and manage text messages effectively.',
                        duration: 15,
                        type: 'practice'
                    }
                ]
            },
            'bd_002': {
                title: 'Internet Basics & Safety',
                lessons: [
                    {
                        title: 'Internet Fundamentals',
                        content: 'Watch this comprehensive guide to understanding the internet, connecting devices, and basic navigation.',
                        duration: 20,
                        type: 'video',
                        youtubeUrl: 'https://www.youtube.com/watch?v=Dxcc6ycZ73M'
                    },
                    {
                        title: 'Safe Browsing Practices',
                        content: 'Learn to identify and avoid online scams, protect your personal information, and browse safely.',
                        duration: 15,
                        type: 'interactive'
                    },
                    {
                        title: 'Search Skills Practice',
                        content: 'Practice using search engines effectively to find reliable information.',
                        duration: 10,
                        type: 'practice'
                    }
                ]
            },
            'fm_001': {
                title: 'M-Pesa & Digital Payments',
                lessons: [
                    {
                        title: 'M-Pesa Complete Guide',
                        content: 'Watch the official Safaricom tutorial on how to use M-Pesa for all your financial transactions.',
                        duration: 25,
                        type: 'video',
                        youtubeUrl: 'https://www.youtube.com/watch?v=MEL4dGZ_XoI'
                    },
                    {
                        title: 'Digital Payment Security',
                        content: 'Learn best practices for secure digital transactions and protecting your mobile money.',
                        duration: 15,
                        type: 'interactive'
                    },
                    {
                        title: 'Bill Payment Practice',
                        content: 'Practice paying various bills and services using mobile money platforms.',
                        duration: 10,
                        type: 'practice'
                    }
                ]
            }
        };

        return contentMap[moduleId] || {
            title: 'Course Content',
            lessons: [
                {
                    title: 'First Lesson',
                    content: 'Basic content for this lesson.',
                    duration: 10,
                    type: 'reading'
                }
            ]
        };
    };

    const startModule = (module) => {
        setSelectedModule(module);
        setCurrentLesson(0);
        setModuleProgress(0);
        setShowModule(true);
    };

    const completeLesson = () => {
        const moduleContent = getModuleContent(selectedModule.id);
        const nextLesson = currentLesson + 1;
        const newProgress = (nextLesson / moduleContent.lessons.length) * 100;

        setModuleProgress(newProgress);

        if (nextLesson < moduleContent.lessons.length) {
            setCurrentLesson(nextLesson);
        } else {
            // Module completed
            dispatch({
                type: 'UPDATE_PROGRESS',
                moduleId: selectedModule.id,
                progress: {
                    completed: true,
                    completedAt: new Date().toISOString(),
                    score: 100
                }
            });
            setShowModule(false);
            setSelectedModule(null);
        }
    };

    if (!learningPath || learningPath.length === 0) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5">
                                <div className="fs-1 mb-4">📊</div>
                                <h3 className="fw-bold mb-3">No Learning Path Available</h3>
                                <p className="text-muted mb-4">
                                    To get your personalized learning path, you need to complete the skills assessment first.
                                </p>
                                <Button href="/assessment" variant="primary" size="lg">
                                    <span className="me-2">📊</span>
                                    Take Assessment
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold mb-2">
                                <span className="me-2">🎯</span>
                                Your Learning Path
                            </h2>
                            <p className="text-muted">
                                Personalized training modules designed for your skill level
                            </p>
                        </div>
                        {!isOnline && (
                            <Alert variant="warning" className="mb-0">
                                <small>📱 Cached content available</small>
                            </Alert>
                        )}
                    </div>
                </Col>
            </Row>

            <Row>
                {learningPath.map((module, index) => {
                    const moduleProgress = progress[module.id];
                    const isCompleted = moduleProgress?.completed || false;
                    const progressPercent = moduleProgress?.score || 0;

                    return (
                        <Col lg={4} md={6} key={module.id} className="mb-4">
                            <Card className={`h-100 border-0 shadow-sm ${isCompleted ? 'border-success' : ''}`}>
                                <Card.Header className="bg-light border-0 py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="fs-4 me-2">
                                                {getCategoryIcon(module.category)}
                                            </span>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{module.title}</h6>
                                                <small className="text-muted">
                                                    {getCategoryName(module.category)}
                                                </small>
                                            </div>
                                        </div>
                                        {isCompleted && (
                                            <span className="text-success fs-4">✅</span>
                                        )}
                                    </div>
                                </Card.Header>

                                <Card.Body className="p-4">
                                    <p className="text-muted mb-3">{module.description}</p>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="text-muted">Progress</small>
                                            <small className="text-muted">{progressPercent}%</small>
                                        </div>
                                        <ProgressBar
                                            now={progressPercent}
                                            variant={isCompleted ? 'success' : 'primary'}
                                            style={{ height: '6px' }}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <Badge bg={getDifficultyColor(module.difficulty)}>
                                            {getDifficultyText(module.difficulty)}
                                        </Badge>
                                        <small className="text-muted">
                                            <span className="me-1">⏱️</span>
                                            {module.estimatedTime} minutes
                                        </small>
                                    </div>

                                    <div className="mb-3">
                                        {module.recommended && (
                                            <Badge bg="warning" className="me-2">
                                                <span className="me-1">⭐</span>
                                                Recommended
                                            </Badge>
                                        )}
                                        {module.youtubeUrl && (
                                            <Badge bg="danger">
                                                <span className="me-1">▶️</span>
                                                YouTube Course
                                            </Badge>
                                        )}
                                    </div>
                                    {module.instructor && (
                                        <p className="small text-muted mb-2">
                                            <strong>Instructor:</strong> {module.instructor}
                                        </p>
                                    )}
                                </Card.Body>

                                <Card.Footer className="bg-transparent border-0 p-4 pt-0">
                                    <Button
                                        variant={isCompleted ? 'outline-success' : 'primary'}
                                        className="w-100"
                                        onClick={() => startModule(module)}
                                    >
                                        {isCompleted ? (
                                            <>
                                                <span className="me-2">🔄</span>
                                                Retake
                                            </>
                                        ) : (
                                            <>
                                                <span className="me-2">▶️</span>
                                                Start
                                            </>
                                        )}
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Module Learning Modal */}
            <Modal
                show={showModule}
                onHide={() => setShowModule(false)}
                size="lg"
                centered
            >
                {selectedModule && (
                    <>
                        <Modal.Header closeButton className="bg-primary text-white">
                            <Modal.Title>
                                <span className="me-2">{getCategoryIcon(selectedModule.category)}</span>
                                {selectedModule.title}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            {(() => {
                                const moduleContent = getModuleContent(selectedModule.id);
                                const currentLessonData = moduleContent.lessons[currentLesson];

                                return (
                                    <>
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 className="mb-0">{currentLessonData.title}</h5>
                                                <Badge bg="info">
                                                    Lesson {currentLesson + 1} / {moduleContent.lessons.length}
                                                </Badge>
                                            </div>
                                            <ProgressBar
                                                now={moduleProgress}
                                                className="mb-3"
                                                style={{ height: '8px' }}
                                            />
                                        </div>

                                        <div className="lesson-content">
                                            <div className="mb-4">
                                                {currentLessonData.type === 'video' && (
                                                    <div className="bg-light p-4 rounded text-center">
                                                        <div className="fs-1 mb-3">🎥</div>
                                                        <h6>Training Video</h6>
                                                        <p className="text-muted">{currentLessonData.content}</p>
                                                        {(currentLessonData.youtubeUrl || selectedModule.youtubeUrl) && (
                                                            <div className="mt-3">
                                                                <Button
                                                                    variant="danger"
                                                                    href={currentLessonData.youtubeUrl || selectedModule.youtubeUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    size="lg"
                                                                >
                                                                    <span className="me-2">▶️</span>
                                                                    Watch on YouTube
                                                                </Button>
                                                                {selectedModule.instructor && (
                                                                    <p className="small text-muted mt-2">
                                                                        <strong>Instructor:</strong> {selectedModule.instructor}
                                                                    </p>
                                                                )}
                                                                <p className="small text-success mt-2">
                                                                    <span className="me-1">✨</span>
                                                                    Real professional course content
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {currentLessonData.type === 'interactive' && (
                                                    <div className="bg-info bg-opacity-10 p-4 rounded">
                                                        <div className="fs-1 mb-3 text-center">🎮</div>
                                                        <h6>Interactive Exercise</h6>
                                                        <p className="text-muted">{currentLessonData.content}</p>
                                                        <div className="text-center mt-3">
                                                            <Button variant="info" size="sm">
                                                                Start Exercise
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {currentLessonData.type === 'reading' && (
                                                    <div className="bg-light p-4 rounded">
                                                        <div className="fs-1 mb-3 text-center">📖</div>
                                                        <h6>Read and Learn</h6>
                                                        <p>{currentLessonData.content}</p>
                                                    </div>
                                                )}

                                                {currentLessonData.type === 'practice' && (
                                                    <div className="bg-success bg-opacity-10 p-4 rounded">
                                                        <div className="fs-1 mb-3 text-center">✋</div>
                                                        <h6>Hands-on Practice</h6>
                                                        <p className="text-muted">{currentLessonData.content}</p>
                                                        <div className="text-center mt-3">
                                                            <Button variant="success" size="sm">
                                                                Start Practice
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    <span className="me-1">⏱️</span>
                                                    Duration: {currentLessonData.duration} minutes
                                                </small>
                                                <Button
                                                    variant="primary"
                                                    onClick={completeLesson}
                                                >
                                                    {currentLesson < moduleContent.lessons.length - 1 ? (
                                                        <>
                                                            <span className="me-2">➡️</span>
                                                            Next Lesson
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="me-2">✅</span>
                                                            Complete Module
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </Modal.Body>
                    </>
                )}
            </Modal>
        </Container>
    );
}

export default LearningPath;