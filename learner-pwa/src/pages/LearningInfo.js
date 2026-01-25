import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function LearningInfo() {
    const { learningPath, progress, skillsProfile } = useUser();

    const learningFeatures = [
        {
            icon: '🎯',
            title: 'Personalized Learning',
            description: 'Every course is tailored to your current skill level and learning pace for maximum effectiveness.'
        },
        {
            icon: '📱',
            title: 'Mobile Optimized',
            description: 'Learn on any device, anywhere, anytime. All content is optimized for mobile learning.'
        },
        {
            icon: '🌐',
            title: 'Offline Access',
            description: 'Download content and continue learning even without internet connection.'
        },
        {
            icon: '🎥',
            title: 'Video Learning',
            description: 'High-quality video tutorials from professional instructors and industry experts.'
        },
        {
            icon: '🏆',
            title: 'Progress Tracking',
            description: 'Monitor your learning progress and celebrate achievements along the way.'
        },
        {
            icon: '💼',
            title: 'Practical Skills',
            description: 'Learn skills that directly translate to income opportunities and business growth.'
        }
    ];

    const courseCategories = [
        {
            name: 'Basic Digital Skills',
            icon: '📱',
            color: 'primary',
            courses: [
                'Mobile Phone Basics',
                'Internet Basics & Safety',
                'Digital Communication',
                'File Management'
            ],
            description: 'Master fundamental digital skills for everyday use'
        },
        {
            name: 'Business Automation',
            icon: '⚙️',
            color: 'success',
            courses: [
                'Digital Inventory Management',
                'Customer Relationship Management',
                'Business Process Automation',
                'Digital Record Keeping'
            ],
            description: 'Automate your business processes for efficiency'
        },
        {
            name: 'Financial Management',
            icon: '💰',
            color: 'warning',
            courses: [
                'Mobile Money & Digital Payments',
                'Digital Bookkeeping',
                'Online Banking',
                'Financial Planning Tools'
            ],
            description: 'Manage your finances digitally and securely'
        },
        {
            name: 'E-Commerce',
            icon: '🛒',
            color: 'info',
            courses: [
                'Online Store Setup',
                'Product Photography & Listing',
                'Digital Payment Integration',
                'Order Management'
            ],
            description: 'Start and grow your online business'
        },
        {
            name: 'Digital Marketing',
            icon: '📢',
            color: 'danger',
            courses: [
                'Social Media Marketing',
                'Content Creation & Strategy',
                'Online Advertising',
                'Brand Building'
            ],
            description: 'Promote your business and reach more customers'
        },
        {
            name: 'Communication',
            icon: '💬',
            color: 'secondary',
            courses: [
                'Professional Communication',
                'Business English',
                'Digital Etiquette',
                'Presentation Skills'
            ],
            description: 'Communicate effectively in the digital world'
        }
    ];

    const getCompletedCourses = () => {
        return Object.values(progress || {}).filter(p => p && p.completed).length;
    };

    const getTotalCourses = () => {
        return learningPath ? learningPath.length : 0;
    };

    const getOverallProgress = () => {
        const total = getTotalCourses();
        const completed = getCompletedCourses();
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    return (
        <Container className="py-5">
            {/* Header Section */}
            <Row className="text-center mb-5">
                <Col>
                    <h1 className="display-4 fw-bold mb-3">
                        <span className="me-3">📚</span>
                        Learning Center
                    </h1>
                    <p className="lead text-muted mb-4">
                        Comprehensive digital skills training designed for economic empowerment
                        in Kiharu Constituency and beyond.
                    </p>

                    {learningPath && learningPath.length > 0 ? (
                        <Alert variant="info" className="mb-4">
                            <Alert.Heading className="h5">
                                <span className="me-2">🎯</span>
                                Your Personalized Learning Path
                            </Alert.Heading>
                            <p className="mb-3">
                                You have <strong>{getTotalCourses()}</strong> courses in your learning path.
                                You've completed <strong>{getCompletedCourses()}</strong> courses ({getOverallProgress()}%).
                            </p>
                            <ProgressBar
                                now={getOverallProgress()}
                                variant="info"
                                className="mb-3"
                                style={{ height: '10px' }}
                            />
                            <div className="d-flex gap-3 justify-content-center">
                                <Button as={Link} to="/learning" variant="info">
                                    <span className="me-2">▶️</span>
                                    Continue Learning
                                </Button>
                                <Button as={Link} to="/dashboard" variant="outline-primary">
                                    <span className="me-2">📊</span>
                                    View Progress
                                </Button>
                            </div>
                        </Alert>
                    ) : (
                        <Alert variant="warning" className="mb-4">
                            <Alert.Heading className="h5">
                                <span className="me-2">📊</span>
                                Get Your Personalized Learning Path
                            </Alert.Heading>
                            <p className="mb-3">
                                Take our AI-powered skills assessment to get a customized learning path
                                designed specifically for your current skill level and goals.
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <Button as={Link} to="/assessment" variant="primary">
                                    <span className="me-2">🚀</span>
                                    Take Assessment
                                </Button>
                                <Button as={Link} to="/profile" variant="outline-primary">
                                    <span className="me-2">👤</span>
                                    Create Account
                                </Button>
                            </div>
                        </Alert>
                    )}
                </Col>
            </Row>

            {/* Learning Features */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">Why Choose Our Learning Platform?</h2>
                </Col>
            </Row>
            <Row className="mb-5">
                {learningFeatures.map((feature, index) => (
                    <Col md={6} lg={4} key={index} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm text-center">
                            <Card.Body className="p-4">
                                <div className="fs-1 mb-3">{feature.icon}</div>
                                <h5 className="fw-bold mb-3">{feature.title}</h5>
                                <p className="text-muted">{feature.description}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Course Categories */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">Course Categories</h2>
                    <p className="text-center text-muted mb-5">
                        Explore our comprehensive curriculum designed to build practical digital skills
                        for economic empowerment and business growth.
                    </p>
                </Col>
            </Row>
            <Row>
                {courseCategories.map((category, index) => (
                    <Col lg={4} md={6} key={index} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className={`bg-${category.color} text-white py-3`}>
                                <div className="d-flex align-items-center">
                                    <div className="fs-2 me-3">{category.icon}</div>
                                    <div>
                                        <h5 className="fw-bold mb-1">{category.name}</h5>
                                        <small className="opacity-75">{category.courses.length} courses</small>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <p className="text-muted mb-3">{category.description}</p>
                                <div className="mb-3">
                                    <small className="text-muted fw-bold">Featured Courses:</small>
                                    <ul className="list-unstyled mt-2">
                                        {category.courses.map((course, idx) => (
                                            <li key={idx} className="small text-muted mb-1">
                                                <span className="me-2">📖</span>{course}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {skillsProfile && (
                                    <div className="mt-3">
                                        <Badge bg={category.color} className="mb-2">
                                            Recommended for you
                                        </Badge>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Learning Journey */}
            <Row className="mt-5">
                <Col>
                    <Card className="border-0 bg-light">
                        <Card.Body className="p-5">
                            <h3 className="text-center mb-4">Your Learning Journey</h3>
                            <Row>
                                <Col md={3} className="text-center mb-4">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">1</span>
                                    </div>
                                    <h5 className="fw-bold">Assess Skills</h5>
                                    <p className="text-muted">
                                        Take our AI-powered assessment to understand your current digital skill level.
                                    </p>
                                </Col>
                                <Col md={3} className="text-center mb-4">
                                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">2</span>
                                    </div>
                                    <h5 className="fw-bold">Get Path</h5>
                                    <p className="text-muted">
                                        Receive a personalized learning path tailored to your needs and goals.
                                    </p>
                                </Col>
                                <Col md={3} className="text-center mb-4">
                                    <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">3</span>
                                    </div>
                                    <h5 className="fw-bold">Learn & Practice</h5>
                                    <p className="text-muted">
                                        Watch videos, complete exercises, and practice with real business tools.
                                    </p>
                                </Col>
                                <Col md={3} className="text-center mb-4">
                                    <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">4</span>
                                    </div>
                                    <h5 className="fw-bold">Apply Skills</h5>
                                    <p className="text-muted">
                                        Use your new skills to increase income and grow your business opportunities.
                                    </p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Success Stories */}
            <Row className="mt-5">
                <Col>
                    <h3 className="text-center mb-4">Success Stories</h3>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="p-4 text-center">
                                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">👩</span>
                                    </div>
                                    <h5 className="fw-bold">Mary Wanjiku</h5>
                                    <small className="text-muted">Completed 8 courses</small>
                                    <p className="text-muted mt-3">
                                        "The digital marketing courses helped me grow my clothing business by 150%.
                                        I now sell online and reach customers across Kenya."
                                    </p>
                                    <Badge bg="success">150% Income Increase</Badge>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="p-4 text-center">
                                    <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">👨</span>
                                    </div>
                                    <h5 className="fw-bold">John Kamau</h5>
                                    <small className="text-muted">Completed 6 courses</small>
                                    <p className="text-muted mt-3">
                                        "Learning digital bookkeeping and inventory management transformed my farming business.
                                        I now track profits and plan better."
                                    </p>
                                    <Badge bg="primary">Modern Farmer</Badge>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="p-4 text-center">
                                    <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">👩</span>
                                    </div>
                                    <h5 className="fw-bold">Grace Nyambura</h5>
                                    <small className="text-muted">Completed 12 courses</small>
                                    <p className="text-muted mt-3">
                                        "I started my own digital services company after completing the courses.
                                        Now I help others while earning sustainable income."
                                    </p>
                                    <Badge bg="warning">Entrepreneur</Badge>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Call to Action */}
            <Row className="mt-5 text-center">
                <Col>
                    <Card className="border-0 bg-primary text-white">
                        <Card.Body className="p-5">
                            <h3 className="mb-3">Ready to Start Learning?</h3>
                            <p className="lead mb-4">
                                Join thousands of learners in Kiharu who are building better lives through digital skills.
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                {learningPath && learningPath.length > 0 ? (
                                    <Button as={Link} to="/learning" variant="light" size="lg">
                                        <span className="me-2">▶️</span>
                                        Continue Learning
                                    </Button>
                                ) : (
                                    <Button as={Link} to="/assessment" variant="light" size="lg">
                                        <span className="me-2">🚀</span>
                                        Start Assessment
                                    </Button>
                                )}
                                <Button as={Link} to="/business-tools" variant="outline-light" size="lg">
                                    <span className="me-2">💼</span>
                                    Try Business Tools
                                </Button>
                            </div>
                            <div className="mt-3">
                                <small className="opacity-75">
                                    ✓ Free forever • ✓ Mobile optimized • ✓ Works offline
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LearningInfo;