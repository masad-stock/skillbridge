import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
    return (
        <footer className="bg-dark text-light py-4 mt-5">
            <Container>
                <Row>
                    <Col md={6}>
                        <h5 className="mb-3">
                            <span className="me-2">🎓</span>
                            SkillBridge
                        </h5>
                        <p className="mb-2">
                            AI-driven digital skills platform for economic empowerment in Kiharu Constituency.
                        </p>
                        <p className="small text-muted">
                            Designed for youth aged 18-35 in Murang'a County, Kenya.
                        </p>
                    </Col>
                    <Col md={3}>
                        <h6 className="mb-3">Quick Links</h6>
                        <ul className="list-unstyled">
                            <li><a href="#" className="text-light text-decoration-none">📞 Contact</a></li>
                            <li><a href="#" className="text-light text-decoration-none">❓ FAQ</a></li>
                            <li><a href="#" className="text-light text-decoration-none">🔒 Privacy</a></li>
                            <li><a href="#" className="text-light text-decoration-none">📋 Terms</a></li>
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
                                <small>support@skillbridge.co.ke</small>
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
                            © 2025 SkillBridge. All rights reserved.
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
    );
}

export default Footer;