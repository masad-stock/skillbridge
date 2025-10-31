import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useOffline } from '../context/OfflineContext';
import { SKILL_CATEGORIES, COMPETENCY_LEVELS } from '../services/aiAssessment';

function Dashboard() {
    const { user, skillsProfile, learningPath, progress, assessmentResults } = useUser();
    const isOnline = useOffline();
    const [weeklyGoal] = useState(3); // 3 modules per week
    const [completedThisWeek, setCompletedThisWeek] = useState(0);

    useEffect(() => {
        // Calculate completed modules this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const completedCount = Object.values(progress || {}).filter(p =>
            p && p.completed && p.completedAt && new Date(p.completedAt) > oneWeekAgo
        ).length;

        setCompletedThisWeek(completedCount);
    }, [progress]);

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

    const getSkillLevelText = (level) => {
        switch (level) {
            case COMPETENCY_LEVELS.BEGINNER: return 'Beginner';
            case COMPETENCY_LEVELS.INTERMEDIATE: return 'Intermediate';
            case COMPETENCY_LEVELS.ADVANCED: return 'Advanced';
            case COMPETENCY_LEVELS.EXPERT: return 'Expert';
            default: return 'Unknown';
        }
    };

    const getSkillLevelColor = (level) => {
        switch (level) {
            case COMPETENCY_LEVELS.EXPERT: return 'success';
            case COMPETENCY_LEVELS.ADVANCED: return 'info';
            case COMPETENCY_LEVELS.INTERMEDIATE: return 'warning';
            default: return 'secondary';
        }
    };

    const calculateOverallProgress = () => {
        if (!learningPath || learningPath.length === 0) return 0;

        const completedModules = Object.values(progress || {}).filter(p => p && p.completed).length;
        return Math.round((completedModules / learningPath.length) * 100);
    };

    const getNextRecommendedModule = () => {
        if (!learningPath) return null;

        return learningPath.find(module => !progress || !progress[module.id] || !progress[module.id].completed);
    };

    const getRecentAchievements = () => {
        const achievements = [];

        // Check for completed modules
        const completedModules = Object.entries(progress || {})
            .filter(([_, p]) => p && p.completed)
            .length;

        if (completedModules >= 1) achievements.push('First Module Completed');
        if (completedModules >= 5) achievements.push('Dedicated Learner');
        if (completedModules >= 10) achievements.push('Digital Skills Expert');

        // Check for assessment completion
        if (assessmentResults) achievements.push('Skills Assessment Completed');

        // Check for weekly goals
        if (completedThisWeek >= weeklyGoal) achievements.push('Weekly Goal Achieved');

        return achievements.slice(-3); // Return last 3 achievements
    };

    const getTotalCompletedModules = () => {
        return Object.values(progress || {}).filter(p => p && p.completed).length;
    };

    const getTotalWatchTime = () => {
        const totalSeconds = Object.values(progress || {})
            .reduce((total, p) => total + (p?.totalWatchTime || 0), 0);
        return Math.floor(totalSeconds / 60); // Convert to minutes
    };



    if (!user) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5">
                                <div className="fs-1 mb-4">👋</div>
                                <h3 className="fw-bold mb-3">Welcome to SkillBridge254!</h3>
                                <p className="text-muted mb-4">
                                    To view your dashboard, you need to login or create an account first.
                                </p>
                                <Button as={Link} to="/profile" variant="primary" size="lg">
                                    <span className="me-2">🚀</span>
                                    Login / Register
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
            {/* Welcome Section */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold mb-2">
                                Welcome back, {user.name || 'User'}! 👋
                            </h2>
                            <p className="text-muted">
                                Here's your personalized digital skills learning dashboard
                            </p>
                        </div>
                        {!isOnline && (
                            <Alert variant="info" className="mb-0">
                                <small>📱 Working offline</small>
                            </Alert>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Quick Stats */}
            <Row className="mb-4">
                <Col md={3} className="mb-3">
                    <Card className="border-0 bg-primary text-white h-100 hover-lift">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">🎯</div>
                            <h4 className="mb-1">{calculateOverallProgress()}%</h4>
                            <small>Overall Progress</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="border-0 bg-success text-white h-100 hover-lift">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">✅</div>
                            <h4 className="mb-1">{getTotalCompletedModules()}</h4>
                            <small>Modules Completed</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="border-0 bg-info text-white h-100 hover-lift">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">📚</div>
                            <h4 className="mb-1">{learningPath?.length || 0}</h4>
                            <small>Learning Modules</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="border-0 bg-warning text-white h-100 hover-lift">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">🎥</div>
                            <h4 className="mb-1">{getTotalWatchTime()}</h4>
                            <small>Minutes Watched</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Learning Progress */}
                <Col lg={8} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-light border-0 py-3">
                            <h5 className="mb-0 fw-bold">
                                <span className="me-2">📈</span>
                                Learning Progress
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {!skillsProfile ? (
                                <div className="text-center py-4">
                                    <div className="fs-1 mb-3">📊</div>
                                    <h6 className="fw-bold mb-2">Take Your Skills Assessment</h6>
                                    <p className="text-muted mb-3">
                                        To get your personalized learning path, complete the skills assessment first.
                                    </p>
                                    <Button as={Link} to="/assessment" variant="primary">
                                        <span className="me-2">🚀</span>
                                        Start Assessment
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    {/* Overall Progress */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold">Overall Progress</span>
                                            <span className="text-muted">{calculateOverallProgress()}%</span>
                                        </div>
                                        <ProgressBar
                                            now={calculateOverallProgress()}
                                            variant="primary"
                                            style={{ height: '10px' }}
                                        />
                                    </div>

                                    {/* Weekly Goal */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold">Weekly Goal</span>
                                            <span className="text-muted">{completedThisWeek} / {weeklyGoal}</span>
                                        </div>
                                        <ProgressBar
                                            now={(completedThisWeek / weeklyGoal) * 100}
                                            variant={completedThisWeek >= weeklyGoal ? 'success' : 'warning'}
                                            style={{ height: '8px' }}
                                        />
                                        {completedThisWeek >= weeklyGoal && (
                                            <small className="text-success">
                                                <span className="me-1">🎉</span>
                                                Congratulations! You've reached your weekly goal!
                                            </small>
                                        )}
                                    </div>

                                    {/* Next Recommended Module */}
                                    {(() => {
                                        const nextModule = getNextRecommendedModule();
                                        return nextModule ? (
                                            <div className="bg-light p-3 rounded">
                                                <h6 className="fw-bold mb-2">
                                                    <span className="me-2">🎯</span>
                                                    Continue Learning
                                                </h6>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-bold">{nextModule.title}</div>
                                                        <small className="text-muted">{nextModule.description}</small>
                                                    </div>
                                                    <Button
                                                        as={Link}
                                                        to="/learning"
                                                        variant="primary"
                                                        size="sm"
                                                    >
                                                        Continue
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-success bg-opacity-10 p-3 rounded text-center">
                                                <div className="fs-2 mb-2">🎉</div>
                                                <h6 className="fw-bold text-success">Congratulations!</h6>
                                                <p className="text-muted mb-0">
                                                    You've completed all recommended modules!
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Skills Profile & Achievements */}
                <Col lg={4}>
                    {/* Skills Profile */}
                    {skillsProfile && (
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-light border-0 py-3">
                                <h6 className="mb-0 fw-bold">
                                    <span className="me-2">🏆</span>
                                    Skills Profile
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                {Object.entries(skillsProfile).map(([category, level]) => (
                                    <div key={category} className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small className="fw-bold">{getCategoryName(category)}</small>
                                            <Badge bg={getSkillLevelColor(level)}>
                                                {getSkillLevelText(level)}
                                            </Badge>
                                        </div>
                                        <ProgressBar
                                            now={(level / COMPETENCY_LEVELS.EXPERT) * 100}
                                            variant={getSkillLevelColor(level)}
                                            style={{ height: '6px' }}
                                        />
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    )}

                    {/* Recent Achievements */}
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light border-0 py-3">
                            <h6 className="mb-0 fw-bold">
                                <span className="me-2">🏅</span>
                                Recent Achievements
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            {getRecentAchievements().length > 0 ? (
                                <div>
                                    {getRecentAchievements().map((achievement, index) => (
                                        <div key={index} className="d-flex align-items-center mb-2">
                                            <span className="me-2">🏆</span>
                                            <small className="fw-bold">{achievement}</small>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <div className="fs-4 mb-2">🎯</div>
                                    <small className="text-muted">
                                        Keep learning to unlock achievements!
                                    </small>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row className="mt-4">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light border-0 py-3">
                            <h5 className="mb-0 fw-bold">
                                <span className="me-2">⚡</span>
                                Quick Actions
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3} className="mb-3">
                                    <Button
                                        as={Link}
                                        to="/learning"
                                        variant="outline-primary"
                                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 hover-lift"
                                    >
                                        <div className="fs-2 mb-2">📚</div>
                                        <span>Continue Learning</span>
                                    </Button>
                                </Col>
                                <Col md={3} className="mb-3">
                                    <Button
                                        as={Link}
                                        to="/business-tools"
                                        variant="outline-success"
                                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 hover-lift"
                                    >
                                        <div className="fs-2 mb-2">💼</div>
                                        <span>Business Tools</span>
                                    </Button>
                                </Col>
                                <Col md={3} className="mb-3">
                                    <Button
                                        as={Link}
                                        to="/assessment-info"
                                        variant="outline-info"
                                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 hover-lift"
                                    >
                                        <div className="fs-2 mb-2">📊</div>
                                        <span>Assessment Info</span>
                                    </Button>
                                </Col>
                                <Col md={3} className="mb-3">
                                    <Button
                                        as={Link}
                                        to="/profile"
                                        variant="outline-warning"
                                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 hover-lift"
                                    >
                                        <div className="fs-2 mb-2">⚙️</div>
                                        <span>Settings</span>
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Motivational Message */}
            {skillsProfile && (
                <Row className="mt-4">
                    <Col>
                        <Alert variant="primary" className="text-center border-0">
                            <h6 className="fw-bold mb-2">
                                <span className="me-2">💪</span>
                                Keep Up the Great Work!
                            </h6>
                            <p className="mb-0">
                                You're on your way to mastering digital skills that will transform your economic opportunities.
                                Every module you complete brings you closer to your goals!
                            </p>
                        </Alert>
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default Dashboard;