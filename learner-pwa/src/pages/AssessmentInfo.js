import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function AssessmentInfo() {
    const { assessmentResults, skillsProfile } = useUser();

    const assessmentFeatures = [
        {
            icon: '🤖',
            title: 'AI-Powered Evaluation',
            description: 'Our artificial intelligence system evaluates your responses to determine your current skill level across multiple digital competencies.'
        },
        {
            icon: '📊',
            title: 'Comprehensive Analysis',
            description: 'Get detailed insights into your strengths and areas for improvement across 6 key digital skill categories.'
        },
        {
            icon: '🎯',
            title: 'Personalized Recommendations',
            description: 'Receive a customized learning path based on your assessment results and career goals.'
        },
        {
            icon: '⏱️',
            title: 'Quick & Efficient',
            description: 'Complete the assessment in just 5-10 minutes with 10 carefully designed questions.'
        }
    ];

    const skillCategories = [
        {
            name: 'Basic Digital Skills',
            icon: '📱',
            description: 'Mobile phone usage, internet navigation, email communication',
            examples: ['Smartphone operations', 'Web browsing', 'Email management']
        },
        {
            name: 'Financial Management',
            icon: '💰',
            description: 'Digital payments, mobile money, financial tracking',
            examples: ['M-Pesa usage', 'Digital bookkeeping', 'Online banking']
        },
        {
            name: 'Business Automation',
            icon: '⚙️',
            description: 'Business apps, customer management, inventory tracking',
            examples: ['CRM systems', 'Inventory apps', 'Business tools']
        },
        {
            name: 'E-Commerce',
            icon: '🛒',
            description: 'Online selling, digital marketplaces, product management',
            examples: ['Online stores', 'Product listings', 'Digital sales']
        },
        {
            name: 'Digital Marketing',
            icon: '📢',
            description: 'Social media marketing, content creation, online promotion',
            examples: ['Social media', 'Content strategy', 'Online advertising']
        },
        {
            name: 'Communication',
            icon: '💬',
            description: 'Professional communication, language skills, digital etiquette',
            examples: ['Business English', 'Professional messaging', 'Online communication']
        }
    ];

    return (
        <Container className="py-5">
            {/* Header Section */}
            <Row className="text-center mb-5">
                <Col>
                    <h1 className="display-4 fw-bold mb-3">
                        <span className="me-3">📊</span>
                        Digital Skills Assessment
                    </h1>
                    <p className="lead text-muted mb-4">
                        Discover your current digital skill level and get a personalized learning path
                        designed specifically for your needs and goals.
                    </p>

                    {assessmentResults ? (
                        <Alert variant="success" className="mb-4">
                            <Alert.Heading className="h5">
                                <span className="me-2">✅</span>
                                Assessment Completed!
                            </Alert.Heading>
                            <p className="mb-3">
                                You completed your skills assessment on {new Date(assessmentResults.completedAt).toLocaleDateString()}.
                                Your overall score: <strong>{Math.round((assessmentResults.totalScore / assessmentResults.maxScore) * 100)}%</strong>
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <Button as={Link} to="/dashboard" variant="success">
                                    <span className="me-2">📈</span>
                                    View Dashboard
                                </Button>
                                <Button as={Link} to="/assessment" variant="outline-primary">
                                    <span className="me-2">🔄</span>
                                    Retake Assessment
                                </Button>
                            </div>
                        </Alert>
                    ) : (
                        <div className="d-flex gap-3 justify-content-center">
                            <Button as={Link} to="/assessment" variant="primary" size="lg">
                                <span className="me-2">🚀</span>
                                Start Assessment
                            </Button>
                            <Button as={Link} to="/learning" variant="outline-primary" size="lg">
                                <span className="me-2">📚</span>
                                Browse Courses
                            </Button>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Assessment Features */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">How Our Assessment Works</h2>
                </Col>
            </Row>
            <Row className="mb-5">
                {assessmentFeatures.map((feature, index) => (
                    <Col md={6} lg={3} key={index} className="mb-4">
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

            {/* Skill Categories */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">Skills We Evaluate</h2>
                    <p className="text-center text-muted mb-5">
                        Our assessment covers 6 key digital skill areas essential for economic empowerment in today's digital economy.
                    </p>
                </Col>
            </Row>
            <Row>
                {skillCategories.map((category, index) => (
                    <Col lg={4} md={6} key={index} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="fs-2 me-3">{category.icon}</div>
                                    <h5 className="fw-bold mb-0">{category.name}</h5>
                                </div>
                                <p className="text-muted mb-3">{category.description}</p>
                                <div>
                                    <small className="text-muted fw-bold">Examples:</small>
                                    <ul className="list-unstyled mt-2">
                                        {category.examples.map((example, idx) => (
                                            <li key={idx} className="small text-muted">
                                                <span className="me-2">•</span>{example}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {skillsProfile && skillsProfile[category.name.toLowerCase().replace(/\s+/g, '_')] && (
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small className="fw-bold">Your Level:</small>
                                            <Badge bg="primary">
                                                Level {skillsProfile[category.name.toLowerCase().replace(/\s+/g, '_')]}
                                            </Badge>
                                        </div>
                                        <ProgressBar
                                            now={(skillsProfile[category.name.toLowerCase().replace(/\s+/g, '_')] / 4) * 100}
                                            variant="primary"
                                            style={{ height: '6px' }}
                                        />
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Assessment Process */}
            <Row className="mt-5">
                <Col>
                    <Card className="border-0 bg-light">
                        <Card.Body className="p-5">
                            <h3 className="text-center mb-4">Assessment Process</h3>
                            <Row>
                                <Col md={4} className="text-center mb-4">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">1</span>
                                    </div>
                                    <h5 className="fw-bold">Answer Questions</h5>
                                    <p className="text-muted">
                                        Complete 10 carefully designed questions about your current digital skills and experience.
                                    </p>
                                </Col>
                                <Col md={4} className="text-center mb-4">
                                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">2</span>
                                    </div>
                                    <h5 className="fw-bold">AI Analysis</h5>
                                    <p className="text-muted">
                                        Our AI system analyzes your responses to determine your skill levels across all categories.
                                    </p>
                                </Col>
                                <Col md={4} className="text-center mb-4">
                                    <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">3</span>
                                    </div>
                                    <h5 className="fw-bold">Get Results</h5>
                                    <p className="text-muted">
                                        Receive your personalized learning path and start improving your digital skills immediately.
                                    </p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Call to Action */}
            <Row className="mt-5 text-center">
                <Col>
                    <Card className="border-0 bg-primary text-white">
                        <Card.Body className="p-5">
                            <h3 className="mb-3">Ready to Discover Your Digital Skills Level?</h3>
                            <p className="lead mb-4">
                                Take the assessment now and start your personalized learning journey towards digital empowerment.
                            </p>
                            <Button as={Link} to="/assessment" variant="light" size="lg">
                                <span className="me-2">🚀</span>
                                Start Assessment Now
                            </Button>
                            <div className="mt-3">
                                <small className="opacity-75">
                                    ✓ Free forever • ✓ Takes 5-10 minutes • ✓ Instant results
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default AssessmentInfo;