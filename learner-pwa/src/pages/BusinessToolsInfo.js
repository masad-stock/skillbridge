import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function BusinessToolsInfo() {
    const { user } = useUser();

    const businessTools = [
        {
            icon: '📦',
            title: 'Inventory Management',
            description: 'Track your products, quantities, and prices in real-time',
            features: [
                'Add and manage products',
                'Track stock levels',
                'Low stock alerts',
                'Category organization',
                'Value calculations'
            ],
            color: 'primary',
            available: true
        },
        {
            icon: '👥',
            title: 'Customer Management',
            description: 'Store and organize customer information efficiently',
            features: [
                'Customer database',
                'Contact information',
                'Purchase history',
                'Customer segmentation',
                'Communication tracking'
            ],
            color: 'success',
            available: true
        },
        {
            icon: '💳',
            title: 'Payment System',
            description: 'Record and track digital payments and transactions',
            features: [
                'M-Pesa integration',
                'Payment recording',
                'Transaction history',
                'Receipt generation',
                'Payment reminders'
            ],
            color: 'info',
            available: false
        },
        {
            icon: '📊',
            title: 'Business Reports',
            description: 'Generate insights and analytics for your business',
            features: [
                'Sales reports',
                'Inventory analytics',
                'Customer insights',
                'Financial summaries',
                'Growth tracking'
            ],
            color: 'warning',
            available: true
        },
        {
            icon: '📱',
            title: 'Mobile POS',
            description: 'Point of sale system for mobile transactions',
            features: [
                'Quick sales processing',
                'Barcode scanning',
                'Receipt printing',
                'Offline capability',
                'Multi-payment methods'
            ],
            color: 'danger',
            available: false
        },
        {
            icon: '📈',
            title: 'Analytics Dashboard',
            description: 'Comprehensive business performance monitoring',
            features: [
                'Real-time metrics',
                'Performance trends',
                'Profit analysis',
                'Goal tracking',
                'Predictive insights'
            ],
            color: 'secondary',
            available: false
        }
    ];

    const benefits = [
        {
            icon: '💰',
            title: 'Increase Profits',
            description: 'Better inventory management and customer tracking leads to increased sales and reduced waste.',
            stats: 'Up to 25% profit increase'
        },
        {
            icon: '⏰',
            title: 'Save Time',
            description: 'Automate routine tasks and spend more time growing your business instead of managing paperwork.',
            stats: '5+ hours saved weekly'
        },
        {
            icon: '📊',
            title: 'Make Better Decisions',
            description: 'Use data and analytics to make informed business decisions and identify growth opportunities.',
            stats: '90% better decision accuracy'
        },
        {
            icon: '🚀',
            title: 'Scale Your Business',
            description: 'Professional tools that grow with your business from small shop to large enterprise.',
            stats: 'Unlimited scalability'
        }
    ];

    const useCases = [
        {
            business: 'Small Retail Shop',
            icon: '🏪',
            description: 'Track inventory, manage customers, and process sales efficiently',
            tools: ['Inventory Management', 'Customer Management', 'Business Reports']
        },
        {
            business: 'Agriculture Business',
            icon: '🌾',
            description: 'Monitor crop inventory, track buyers, and manage seasonal sales',
            tools: ['Inventory Management', 'Customer Management', 'Analytics Dashboard']
        },
        {
            business: 'Service Provider',
            icon: '🔧',
            description: 'Manage client information, track services, and monitor payments',
            tools: ['Customer Management', 'Payment System', 'Business Reports']
        },
        {
            business: 'Online Seller',
            icon: '🛒',
            description: 'Integrate with e-commerce platforms and manage digital sales',
            tools: ['Inventory Management', 'Payment System', 'Analytics Dashboard']
        }
    ];

    return (
        <Container className="py-5">
            {/* Header Section */}
            <Row className="text-center mb-5">
                <Col>
                    <h1 className="display-4 fw-bold mb-3">
                        <span className="me-3">💼</span>
                        Business Tools
                    </h1>
                    <p className="lead text-muted mb-4">
                        Professional business management tools designed for small and medium enterprises
                        in Kiharu Constituency and across Kenya.
                    </p>

                    {user ? (
                        <Alert variant="success" className="mb-4">
                            <Alert.Heading className="h5">
                                <span className="me-2">👋</span>
                                Welcome back, {user.name}!
                            </Alert.Heading>
                            <p className="mb-3">
                                You have access to our business tools. Start managing your business more efficiently today.
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <Button as={Link} to="/business-tools" variant="success">
                                    <span className="me-2">🚀</span>
                                    Open Business Tools
                                </Button>
                                <Button as={Link} to="/dashboard" variant="outline-primary">
                                    <span className="me-2">📊</span>
                                    View Dashboard
                                </Button>
                            </div>
                        </Alert>
                    ) : (
                        <Alert variant="info" className="mb-4">
                            <Alert.Heading className="h5">
                                <span className="me-2">🔐</span>
                                Login Required
                            </Alert.Heading>
                            <p className="mb-3">
                                Create a free account to access our comprehensive business management tools.
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <Button as={Link} to="/profile" variant="primary">
                                    <span className="me-2">👤</span>
                                    Create Account
                                </Button>
                                <Button as={Link} to="/assessment" variant="outline-primary">
                                    <span className="me-2">📊</span>
                                    Take Assessment
                                </Button>
                            </div>
                        </Alert>
                    )}
                </Col>
            </Row>

            {/* Business Tools Grid */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">Available Business Tools</h2>
                    <p className="text-center text-muted mb-5">
                        Comprehensive suite of tools to help you manage and grow your business effectively.
                    </p>
                </Col>
            </Row>
            <Row>
                {businessTools.map((tool, index) => (
                    <Col lg={4} md={6} key={index} className="mb-4">
                        <Card className={`h-100 border-0 shadow-sm ${!tool.available ? 'opacity-75' : ''}`}>
                            <Card.Header className={`bg-${tool.color} text-white py-3`}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="fs-2 me-3">{tool.icon}</div>
                                        <h5 className="fw-bold mb-0">{tool.title}</h5>
                                    </div>
                                    {tool.available ? (
                                        <Badge bg="light" text="dark">Available</Badge>
                                    ) : (
                                        <Badge bg="warning">Coming Soon</Badge>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <p className="text-muted mb-3">{tool.description}</p>
                                <div className="mb-3">
                                    <small className="text-muted fw-bold">Key Features:</small>
                                    <ul className="list-unstyled mt-2">
                                        {tool.features.map((feature, idx) => (
                                            <li key={idx} className="small text-muted mb-1">
                                                <span className="me-2">✓</span>{feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-transparent border-0 p-4 pt-0">
                                {tool.available ? (
                                    <Button
                                        as={Link}
                                        to="/business-tools"
                                        variant={tool.color}
                                        className="w-100"
                                        disabled={!user}
                                    >
                                        <span className="me-2">🚀</span>
                                        {user ? 'Use Tool' : 'Login Required'}
                                    </Button>
                                ) : (
                                    <Button variant="outline-secondary" className="w-100" disabled>
                                        <span className="me-2">⏳</span>
                                        Coming Soon
                                    </Button>
                                )}
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Benefits Section */}
            <Row className="mt-5 mb-5">
                <Col>
                    <h2 className="text-center mb-4">Why Use Our Business Tools?</h2>
                </Col>
            </Row>
            <Row>
                {benefits.map((benefit, index) => (
                    <Col md={6} lg={3} key={index} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm text-center">
                            <Card.Body className="p-4">
                                <div className="fs-1 mb-3">{benefit.icon}</div>
                                <h5 className="fw-bold mb-3">{benefit.title}</h5>
                                <p className="text-muted mb-3">{benefit.description}</p>
                                <Badge bg="primary" className="px-3 py-2">
                                    {benefit.stats}
                                </Badge>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Use Cases */}
            <Row className="mt-5">
                <Col>
                    <h2 className="text-center mb-4">Perfect for Your Business Type</h2>
                    <p className="text-center text-muted mb-5">
                        Our tools are designed to work for various business types and sizes across Kenya.
                    </p>
                </Col>
            </Row>
            <Row>
                {useCases.map((useCase, index) => (
                    <Col md={6} key={index} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="fs-2 me-3">{useCase.icon}</div>
                                    <h5 className="fw-bold mb-0">{useCase.business}</h5>
                                </div>
                                <p className="text-muted mb-3">{useCase.description}</p>
                                <div>
                                    <small className="text-muted fw-bold">Recommended Tools:</small>
                                    <div className="mt-2">
                                        {useCase.tools.map((tool, idx) => (
                                            <Badge key={idx} bg="outline-primary" className="me-2 mb-1">
                                                {tool}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Getting Started */}
            <Row className="mt-5">
                <Col>
                    <Card className="border-0 bg-light">
                        <Card.Body className="p-5">
                            <h3 className="text-center mb-4">Getting Started with Business Tools</h3>
                            <Row>
                                <Col md={3} className="text-center mb-4">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">1</span>
                                    </div>
                                    <h5 className="fw-bold">Create Account</h5>
                                    <p className="text-muted">
                                        Sign up for free to access all business tools and features.
                                    </p>
                                </Col>
                                <Col md={3} className="text-center mb-4">
                                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">2</span>
                                    </div>
                                    <h5 className="fw-bold">Setup Business</h5>
                                    <p className="text-muted">
                                        Add your business information and configure your preferred tools.
                                    </p>
                                </Col>
                                <Col md={3} className="text-center mb-4">
                                    <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">3</span>
                                    </div>
                                    <h5 className="fw-bold">Add Data</h5>
                                    <p className="text-muted">
                                        Import or add your products, customers, and business information.
                                    </p>
                                </Col>
                                <Col md={3} className="text-center mb-4">
                                    <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '60px', height: '60px' }}>
                                        <span className="fs-4">4</span>
                                    </div>
                                    <h5 className="fw-bold">Grow Business</h5>
                                    <p className="text-muted">
                                        Use insights and automation to grow your business efficiently.
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
                            <h3 className="mb-3">Ready to Modernize Your Business?</h3>
                            <p className="lead mb-4">
                                Join thousands of business owners in Kenya who are using digital tools
                                to increase profits and efficiency.
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                {user ? (
                                    <Button as={Link} to="/business-tools" variant="light" size="lg">
                                        <span className="me-2">🚀</span>
                                        Start Using Tools
                                    </Button>
                                ) : (
                                    <Button as={Link} to="/profile" variant="light" size="lg">
                                        <span className="me-2">👤</span>
                                        Create Free Account
                                    </Button>
                                )}
                                <Button as={Link} to="/learning" variant="outline-light" size="lg">
                                    <span className="me-2">📚</span>
                                    Learn Business Skills
                                </Button>
                            </div>
                            <div className="mt-3">
                                <small className="opacity-75">
                                    ✓ Free forever • ✓ No credit card required • ✓ Works offline
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default BusinessToolsInfo;