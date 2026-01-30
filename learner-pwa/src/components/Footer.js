import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import AuthModal from './AuthModal';

function Footer() {
    const { isAuthenticated } = useUser();
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <>
            <footer className="bg-dark text-light py-4 mt-5">
                <Container>
                    <Row>
                        <Col md={6}>
                            <h5 className="mb-3">
                                <span className="me-2">🎓</span>
                                SkillBridge254
                            </h5>
                            <p className="mb-2">
                                AI-driven digital skills platform for economic empowerment in Kiharu Constituency.
                            </p>
                            <p className="small text-muted">
                                Designed for youth aged 18-35 in Murang'a County, Kenya.
                            </p>
                            {!isAuthenticated && (
                                <div className="mt-3 d-flex gap-2">
                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        className="rounded-pill"
                                        onClick={() => setShowAuthModal(true)}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="rounded-pill"
                                        onClick={() => setShowAuthModal(true)}
                                    >
                                        Sign Up
                                    </Button>
                                </div>
                            )}
                        </Col>
                        <Col md={3}>
                            <h6 className="mb-3">Quick Links</h6>
                            <ul className="list-unstyled">
                                <li><Link to="/courses" className="text-light text-decoration-none">📚 Courses</Link></li>
                                <li><Link to="/instructors" className="text-light text-decoration-none">👨‍🏫 Instructors</Link></li>
                                <li><Link to="/blog" className="text-light text-decoration-none">📝 Blog</Link></li>
                                <li><Link to="/events" className="text-light text-decoration-none">📅 Events</Link></li>
                                <li><Link to="/contact" className="text-light text-decoration-none">📞 Contact</Link></li>
                                <li><Link to="/faq" className="text-light text-decoration-none">❓ FAQ</Link></li>
                            </ul>
                        </Col>
                        <Col md={3}>
                            <h6 className="mb-3">Legal</h6>
                            <ul className="list-unstyled">
                                <li><Link to="/privacy" className="text-light text-decoration-none">🔒 Privacy Policy</Link></li>
                                <li><Link to="/terms" className="text-light text-decoration-none">📋 Terms of Service</Link></li>
                            </ul>
                        </Col>
                        <Col md={3}>
                            <h6 className="mb-3">Support</h6>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <span className="me-2">📱</span>
                                    <small>+254 700 000 000</small>
                                </li>
                                <li className="mb-2">
                                    <span className="me-2">✉️</span>
                                    <small>support@skillbridge254.co.ke</small>
                                </li>
                                <li className="mb-2">
                                    <span className="me-2">🕒</span>
                                    <small>Monday - Friday: 8AM - 6PM</small>
                                </li>
                            </ul>
                        </Col>
                    </Row>
                    <hr className="my-4" />
                    <Row>
                        <Col md={6}>
                            <small className="text-muted">
                                © 2025 SkillBridge254. All rights reserved.
                            </small>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <small className="text-muted">
                                Developed for research MIT/2025/42733
                            </small>
                        </Col>
                    </Row>
                </Container>
            </footer>
            <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
        </>
    );
}

export default Footer;