import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import Breadcrumbs from '../components/Breadcrumbs';

function About() {
    return (
        <Container className="py-5">
            <Breadcrumbs />
            <Row>
                <Col lg={10} className="mx-auto">
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h1 className="display-4 fw-bold mb-3">
                                    <span className="me-2">🎓</span>
                                    About SkillBridge254
                                </h1>
                                <Badge bg="primary" className="fs-6 px-3 py-2 mb-3">
                                    Research Project - MIT/2025/42733
                                </Badge>
                            </div>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <h3 className="fw-bold mb-3">Our Mission</h3>
                                    <p className="text-muted">
                                        SkillBridge254 is an AI-powered digital skills platform designed to bridge the digital divide in rural Kenya. 
                                        Our mission is to provide free, accessible, and personalized digital skills training to youth in Kiharu Constituency, 
                                        enabling economic empowerment through digital literacy.
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <h3 className="fw-bold mb-3">Key Features</h3>
                                    <ul className="text-muted">
                                        <li>AI-powered skills assessment</li>
                                        <li>Personalized learning paths</li>
                                        <li>Offline functionality</li>
                                        <li>Business management tools</li>
                                        <li>Certificate generation</li>
                                        <li>Mobile-first design</li>
                                    </ul>
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            <Row>
                                <Col>
                                    <h3 className="fw-bold mb-3">Research Information</h3>
                                    <Card className="bg-light border-0 mb-3">
                                        <Card.Body>
                                            <Row>
                                                <Col md={6}>
                                                    <p className="mb-2">
                                                        <strong>Student:</strong> Obike Emmanuel
                                                    </p>
                                                    <p className="mb-2">
                                                        <strong>Registration Number:</strong> MIT/2025/42733
                                                    </p>
                                                    <p className="mb-2">
                                                        <strong>Institution:</strong> Mount Kenya University
                                                    </p>
                                                </Col>
                                                <Col md={6}>
                                                    <p className="mb-2">
                                                        <strong>Programme:</strong> MSc Information Technology
                                                    </p>
                                                    <p className="mb-2">
                                                        <strong>Focus Area:</strong> Digital Skills & Economic Empowerment
                                                    </p>
                                                    <p className="mb-0">
                                                        <strong>Location:</strong> Kiharu Constituency, Kenya
                                                    </p>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col>
                                    <h3 className="fw-bold mb-3">Technology Stack</h3>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Badge bg="primary">React</Badge>
                                        <Badge bg="primary">Node.js</Badge>
                                        <Badge bg="primary">MongoDB</Badge>
                                        <Badge bg="primary">Express</Badge>
                                        <Badge bg="primary">Bootstrap</Badge>
                                        <Badge bg="primary">PWA</Badge>
                                        <Badge bg="primary">AI/ML</Badge>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col>
                                    <h3 className="fw-bold mb-3">Impact Goals</h3>
                                    <Row>
                                        <Col md={4} className="mb-3">
                                            <Card className="border-0 bg-primary text-white h-100">
                                                <Card.Body className="text-center">
                                                    <div className="fs-2 mb-2">54,000+</div>
                                                    <small>Target Youth in Kiharu</small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Card className="border-0 bg-success text-white h-100">
                                                <Card.Body className="text-center">
                                                    <div className="fs-2 mb-2">100%</div>
                                                    <small>Free Training</small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Card className="border-0 bg-info text-white h-100">
                                                <Card.Body className="text-center">
                                                    <div className="fs-2 mb-2">Offline</div>
                                                    <small>Works Without Internet</small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default About;
