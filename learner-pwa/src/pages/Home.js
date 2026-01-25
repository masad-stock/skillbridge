import { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AuthModal from '../components/AuthModal';
import SuccessStoryImage from '../components/home/SuccessStoryImage';

function Home() {
    const { isAuthenticated, skillsProfile, loading } = useUser();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const features = [
        {
            icon: '🤖',
            title: 'AI-Powered Assessment',
            description: 'Our platform uses artificial intelligence to evaluate your skills and guide you with personalized learning paths.',
            color: 'primary'
        },
        {
            icon: '📱',
            title: 'Learn Anywhere',
            description: 'Study even without internet connection. Your content stays on your device for offline learning.',
            color: 'success'
        },
        {
            icon: '💼',
            title: 'Business Tools',
            description: 'Get modern tools to manage your business - accounting, customers, and payments.',
            color: 'info'
        },
        {
            icon: '🎯',
            title: 'Personalized Training',
            description: 'Everyone gets training that fits their current skill level and learning pace.',
            color: 'warning'
        }
    ];

    const stats = [
        { number: '54,000+', label: 'Youth in Kiharu', icon: '👥' },
        { number: '95.2%', label: 'Mobile Phone Access', icon: '📱' },
        { number: '31%', label: 'Job-Ready Skills', icon: '💼' },
        { number: '100%', label: 'Free Training', icon: '🎓' }
    ];

    const benefits = [
        {
            icon: '💰',
            title: 'Increase Income',
            description: 'Learn digital skills that directly translate to earning opportunities',
            examples: ['Online selling', 'Digital payments', 'Business automation'],
            imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80' // African woman with laptop
        },
        {
            icon: '🚀',
            title: 'Start Your Business',
            description: 'Get tools and knowledge to launch and grow your own business',
            examples: ['Inventory management', 'Customer tracking', 'Financial planning'],
            imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80' // African business meeting
        },
        {
            icon: '🌐',
            title: 'Join Digital Economy',
            description: 'Participate in Kenya\'s growing digital marketplace',
            examples: ['E-commerce platforms', 'Mobile money', 'Online marketing'],
            imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80' // African students learning
        }
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="hero-section text-white py-5" style={{
                backgroundImage: 'linear-gradient(rgba(13, 110, 253, 0.85), rgba(13, 110, 253, 0.85)), url(https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <Container>
                    <Row className="align-items-center min-vh-50">
                        <Col lg={6}>
                            <h1 className="display-4 fw-bold mb-4">
                                Transform Your Future with Digital Skills
                            </h1>
                            <p className="lead mb-4">
                                The first AI-powered digital skills learning platform in Kiharu Constituency.
                                Learn, build your business, and increase your income with personalized training.
                            </p>

                            {loading ? (
                                <div className="d-flex gap-3 flex-wrap">
                                    <Button variant="light" size="lg" disabled>
                                        Loading...
                                    </Button>
                                </div>
                            ) : isAuthenticated ? (
                                <div className="d-flex gap-3 flex-wrap">
                                    <Button as={Link} to="/dashboard" variant="light" size="lg">
                                        <span className="me-2">📈</span>
                                        Continue Learning
                                    </Button>
                                    {!skillsProfile?.assessmentCompleted && (
                                        <Button as={Link} to="/assessment-info" variant="outline-light" size="lg">
                                            <span className="me-2">📊</span>
                                            Take Assessment
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="d-flex gap-3 flex-wrap">
                                    <Button onClick={() => setShowAuthModal(true)} variant="light" size="lg">
                                        <span className="me-2">🚀</span>
                                        Get Started
                                    </Button>
                                    <Button as={Link} to="/assessment-info" variant="outline-light" size="lg">
                                        <span className="me-2">📊</span>
                                        Learn About Assessment
                                    </Button>
                                </div>
                            )}

                            <div className="mt-4">
                                <small className="text-light opacity-75">
                                    ✅ Free forever &nbsp;&nbsp; ✅ Works offline &nbsp;&nbsp; ✅ Mobile optimized
                                </small>
                            </div>
                        </Col>
                        <Col lg={6} className="text-center">
                            <div className="position-relative">
                                <div className="bg-light rounded-3 p-4 shadow-lg">
                                    <h3 className="text-dark mb-3">Kiharu Statistics</h3>
                                    <Row>
                                        {stats.map((stat, index) => (
                                            <Col sm={6} key={index} className="mb-3">
                                                <div className="text-center">
                                                    <div className="fs-1 mb-2">{stat.icon}</div>
                                                    <div className="h4 text-primary mb-1">{stat.number}</div>
                                                    <small className="text-muted">{stat.label}</small>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Impact Alert */}
            <section className="py-3">
                <Container>
                    <Alert variant="success" className="mb-0 text-center border-0">
                        <strong>🎯 Research Impact:</strong> This platform is part of academic research (MIT/2025/42733)
                        focused on bridging the digital divide in rural Kenya through AI-driven personalized learning.
                    </Alert>
                </Container>
            </section>

            {/* Features Section */}
            <section className="py-5">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold mb-3">Why Choose SkillBridge254?</h2>
                            <p className="lead text-muted">
                                Built specifically for the needs of youth in Kiharu Constituency
                            </p>
                        </Col>
                    </Row>

                    <Row>
                        {features.map((feature, index) => (
                            <Col md={6} lg={3} key={index} className="mb-4">
                                <Card className="h-100 border-0 shadow-sm hover-lift">
                                    <Card.Body className="text-center p-4">
                                        <div className="fs-1 mb-3">{feature.icon}</div>
                                        <h5 className="fw-bold mb-3">{feature.title}</h5>
                                        <p className="text-muted mb-3">{feature.description}</p>
                                        <Badge bg={feature.color} className="px-3 py-2">
                                            Available Now
                                        </Badge>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Benefits Section */}
            <section className="bg-light py-5">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold mb-3">Real Economic Impact</h2>
                            <p className="lead text-muted">
                                Learn skills that directly improve your income and business opportunities
                            </p>
                        </Col>
                    </Row>

                    <Row>
                        {benefits.map((benefit, index) => (
                            <Col lg={4} key={index} className="mb-4">
                                <Card className="h-100 border-0 shadow-sm overflow-hidden">
                                    {/* Image Header */}
                                    <div style={{
                                        height: '200px',
                                        backgroundImage: `url(${benefit.imageUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }} />
                                    <Card.Body className="p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="fs-2 me-3">{benefit.icon}</div>
                                            <h4 className="fw-bold mb-0">{benefit.title}</h4>
                                        </div>
                                        <p className="text-muted mb-3">{benefit.description}</p>
                                        <div>
                                            <small className="text-muted fw-bold">Examples:</small>
                                            <ul className="list-unstyled mt-2">
                                                {benefit.examples.map((example, idx) => (
                                                    <li key={idx} className="small text-muted">
                                                        <span className="me-2">✓</span>{example}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Learning Path Preview */}
            <section className="py-5">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold mb-3">Your Learning Journey</h2>
                            <p className="lead text-muted">
                                Simple steps to gain digital skills and economic empowerment
                            </p>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} className="mb-4">
                            <div className="text-center">
                                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{ width: '80px', height: '80px' }}>
                                    <span className="fs-2">1️⃣</span>
                                </div>
                                <h4 className="fw-bold mb-3">Skills Assessment</h4>
                                <p className="text-muted">
                                    Start by understanding your current digital skills so we can guide you properly.
                                </p>
                                <small className="text-primary">⏱️ Takes 5-10 minutes</small>
                            </div>
                        </Col>
                        <Col md={4} className="mb-4">
                            <div className="text-center">
                                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{ width: '80px', height: '80px' }}>
                                    <span className="fs-2">2️⃣</span>
                                </div>
                                <h4 className="fw-bold mb-3">Personalized Training</h4>
                                <p className="text-muted">
                                    Get training modules designed specifically for your skill level and goals.
                                </p>
                                <small className="text-success">🎯 AI-powered recommendations</small>
                            </div>
                        </Col>
                        <Col md={4} className="mb-4">
                            <div className="text-center">
                                <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{ width: '80px', height: '80px' }}>
                                    <span className="fs-2">3️⃣</span>
                                </div>
                                <h4 className="fw-bold mb-3">Apply Skills</h4>
                                <p className="text-muted">
                                    Use your new skills to increase income and improve your quality of life.
                                </p>
                                <small className="text-info">💰 Real economic impact</small>
                            </div>
                        </Col>
                    </Row>

                    <Row className="text-center mt-4">
                        <Col>
                            <Button as={Link} to="/assessment-info" variant="primary" size="lg" className="me-3">
                                <span className="me-2">🚀</span>
                                Start Your Journey
                            </Button>
                            <Button as={Link} to="/learning-info" variant="outline-primary" size="lg">
                                <span className="me-2">📚</span>
                                Explore Learning
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Success Stories Preview */}
            <section className="bg-light py-5">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold mb-3">Success Stories</h2>
                            <p className="lead text-muted">
                                See how others have transformed their lives through digital skills
                            </p>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="border-0 shadow-sm h-100 success-story-card">
                                <Card.Body className="p-4">
                                    <div className="text-center mb-3">
                                        <SuccessStoryImage
                                            name="Mary Wanjiku"
                                            gender="female"
                                            size={80}
                                        />
                                        <h5 className="fw-bold mt-3 mb-1">Mary Wanjiku</h5>
                                        <small className="text-muted">Tailor & Seamstress, Kiharu</small>
                                    </div>
                                    <p className="text-muted testimonial-text">
                                        "After learning digital skills, my tailoring business increased by 150%.
                                        I now take orders through WhatsApp and receive payments via M-Pesa."
                                    </p>
                                    <div className="text-center">
                                        <Badge bg="success" className="px-3 py-2">
                                            ✂️ 150% Income Increase
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="border-0 shadow-sm h-100 success-story-card">
                                <Card.Body className="p-4">
                                    <div className="text-center mb-3">
                                        <SuccessStoryImage
                                            name="John Kamau"
                                            gender="male"
                                            size={80}
                                        />
                                        <h5 className="fw-bold mt-3 mb-1">John Kamau</h5>
                                        <small className="text-muted">Mechanic & Welder, Kiharu</small>
                                    </div>
                                    <p className="text-muted testimonial-text">
                                        "I learned to use accounting apps and now I track my workshop profits.
                                        I also advertise my services on social media to get more customers."
                                    </p>
                                    <div className="text-center">
                                        <Badge bg="primary" className="px-3 py-2">
                                            🔧 Skilled Technician
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="border-0 shadow-sm h-100 success-story-card">
                                <Card.Body className="p-4">
                                    <div className="text-center mb-3">
                                        <SuccessStoryImage
                                            name="Grace Nyambura"
                                            gender="female"
                                            size={80}
                                        />
                                        <h5 className="fw-bold mt-3 mb-1">Grace Nyambura</h5>
                                        <small className="text-muted">Hair Stylist & Beautician, Kiharu</small>
                                    </div>
                                    <p className="text-muted testimonial-text">
                                        "I started booking appointments online and accepting M-Pesa payments.
                                        My salon business has grown and I serve more clients daily."
                                    </p>
                                    <div className="text-center">
                                        <Badge bg="warning" className="px-3 py-2 text-dark">
                                            💇‍♀️ Growing Business
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Call to Action */}
            <section className="cta-section text-white py-5">
                <Container>
                    <Row className="text-center">
                        <Col lg={8} className="mx-auto">
                            <h2 className="display-5 fw-bold mb-3">Ready to Transform Your Future?</h2>
                            <p className="lead mb-4">
                                Join thousands of youth in Kiharu who are building better lives through digital skills.
                                Start your journey today - it's completely free!
                            </p>
                            <div className="d-flex gap-3 justify-content-center flex-wrap">
                                {isAuthenticated ? (
                                    <Button as={Link} to="/dashboard" variant="light" size="lg">
                                        <span className="me-2">📈</span>
                                        Go to Dashboard
                                    </Button>
                                ) : (
                                    <Button onClick={() => setShowAuthModal(true)} variant="light" size="lg">
                                        <span className="me-2">🚀</span>
                                        Create Free Account
                                    </Button>
                                )}
                                <Button as={Link} to="/assessment-info" variant="outline-light" size="lg">
                                    <span className="me-2">📊</span>
                                    Learn About Assessment
                                </Button>
                            </div>

                            <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
                            <div className="mt-4">
                                <small className="opacity-75">
                                    No credit card required • Works on any device • Available offline
                                </small>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default Home;