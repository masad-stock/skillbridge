import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Contact() {

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <h1 className="mb-4">📞 Contact Us</h1>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">Get in Touch</h5>
                            <p>
                                We're here to help! If you have any questions, concerns, or feedback about SkillBridge254,
                                please don't hesitate to reach out to us.
                            </p>
                        </Card.Body>
                    </Card>

                    <Row>
                        <Col md={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Body>
                                    <h6 className="mb-3">📱 Phone Support</h6>
                                    <p className="mb-2"><strong>Main Line:</strong></p>
                                    <p>+254 700 000 000</p>
                                    <p className="text-muted small">Monday - Friday: 8:00 AM - 6:00 PM EAT</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Body>
                                    <h6 className="mb-3">✉️ Email Support</h6>
                                    <p className="mb-2"><strong>General Inquiries:</strong></p>
                                    <p>support@skillbridge254.co.ke</p>
                                    <p className="mb-2"><strong>Technical Support:</strong></p>
                                    <p>tech@skillbridge254.co.ke</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Body>
                                    <h6 className="mb-3">📍 Physical Address</h6>
                                    <p>SkillBridge254</p>
                                    <p>Kiharu Constituency</p>
                                    <p>Murang'a County, Kenya</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Body>
                                    <h6 className="mb-3">🌐 Social Media</h6>
                                    <p className="mb-2">Connect with us on social media for updates and news:</p>
                                    <p className="text-muted small">
                                        Facebook | Twitter | LinkedIn | Instagram
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="mt-4">
                        <Card.Body>
                            <h6 className="mb-3">💬 Live Chat Support</h6>
                            <p>
                                For immediate assistance, use our AI-powered chat widget located at the bottom right
                                corner of the page. Our chatbot is available 24/7 to answer your questions.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="mt-4 bg-light">
                        <Card.Body>
                            <h6 className="mb-3">🎓 Research Project</h6>
                            <p className="mb-2">
                                <strong>Project Reference:</strong> MIT/2025/42733
                            </p>
                            <p className="text-muted small">
                                This platform is part of a research initiative focused on AI-driven digital skills
                                development for economic empowerment in Kiharu Constituency, Murang'a County.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Contact;
