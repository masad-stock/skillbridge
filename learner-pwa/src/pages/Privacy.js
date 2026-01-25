import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Privacy() {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <h1 className="mb-4">🔒 Privacy Policy</h1>

                    <Card className="mb-4">
                        <Card.Body>
                            <p className="text-muted">
                                <strong>Last Updated:</strong> January 2025
                            </p>
                            <p>
                                SkillBridge254 ("we," "our," or "us") is committed to protecting your privacy.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                                information when you use our platform.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">1. Information We Collect</h5>

                            <h6 className="mt-3">Personal Information</h6>
                            <p>When you register for an account, we collect:</p>
                            <ul>
                                <li>Name and contact information (email, phone number)</li>
                                <li>Age and location (to verify eligibility for the program)</li>
                                <li>Profile picture (optional)</li>
                                <li>Educational background and skills information</li>
                            </ul>

                            <h6 className="mt-3">Usage Information</h6>
                            <p>We automatically collect information about how you use our platform:</p>
                            <ul>
                                <li>Learning progress and course completion data</li>
                                <li>Assessment results and skill evaluations</li>
                                <li>Time spent on courses and modules</li>
                                <li>Device information and browser type</li>
                                <li>IP address and general location data</li>
                            </ul>

                            <h6 className="mt-3">Business Tools Data</h6>
                            <p>If you use our business management tools, we collect:</p>
                            <ul>
                                <li>Business information you enter (inventory, customers, sales)</li>
                                <li>Financial data for reporting purposes</li>
                                <li>Workflow and process information</li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">2. How We Use Your Information</h5>
                            <p>We use the collected information to:</p>
                            <ul>
                                <li>Provide and maintain our learning platform</li>
                                <li>Personalize your learning experience with AI-driven recommendations</li>
                                <li>Track your progress and issue certificates</li>
                                <li>Improve our courses and platform features</li>
                                <li>Communicate with you about updates, new features, and support</li>
                                <li>Conduct research on digital skills development (anonymized data)</li>
                                <li>Ensure platform security and prevent fraud</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">3. Data Sharing and Disclosure</h5>

                            <h6 className="mt-3">We Do NOT Sell Your Data</h6>
                            <p>
                                We will never sell your personal information to third parties.
                            </p>

                            <h6 className="mt-3">Limited Sharing</h6>
                            <p>We may share your information only in these circumstances:</p>
                            <ul>
                                <li><strong>Research Partners:</strong> Anonymized, aggregated data for academic research purposes</li>
                                <li><strong>Service Providers:</strong> Trusted third-party services that help us operate the platform (e.g., cloud hosting, email services)</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">4. Data Security</h5>
                            <p>We implement industry-standard security measures to protect your data:</p>
                            <ul>
                                <li>Encryption of data in transit and at rest</li>
                                <li>Secure authentication and password protection</li>
                                <li>Regular security audits and updates</li>
                                <li>Access controls and monitoring</li>
                                <li>Secure backup and recovery procedures</li>
                            </ul>
                            <p className="text-muted small mt-3">
                                While we strive to protect your information, no method of transmission over the
                                internet is 100% secure. We cannot guarantee absolute security.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">5. Your Rights and Choices</h5>
                            <p>You have the right to:</p>
                            <ul>
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
                            </ul>
                            <p className="mt-3">
                                To exercise these rights, contact us at support@skillbridge254.co.ke
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">6. Offline Data Storage</h5>
                            <p>
                                SkillBridge254 is designed as an offline-first platform. When you use offline features:
                            </p>
                            <ul>
                                <li>Data is stored locally on your device</li>
                                <li>You control what data is downloaded for offline use</li>
                                <li>Data syncs with our servers when you're back online</li>
                                <li>You can clear offline data from your device settings</li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">7. Cookies and Tracking</h5>
                            <p>We use cookies and similar technologies to:</p>
                            <ul>
                                <li>Remember your login and preferences</li>
                                <li>Analyze platform usage and performance</li>
                                <li>Provide personalized content and recommendations</li>
                            </ul>
                            <p className="mt-3">
                                You can control cookies through your browser settings, but some features may not
                                work properly if cookies are disabled.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">8. Children's Privacy</h5>
                            <p>
                                SkillBridge254 is designed for youth aged 18-35. We do not knowingly collect
                                information from individuals under 18. If we discover that we have collected
                                information from someone under 18, we will delete it promptly.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">9. Research and Data Usage</h5>
                            <p>
                                This platform is part of research project MIT/2025/42733. We may use anonymized,
                                aggregated data for research purposes to:
                            </p>
                            <ul>
                                <li>Study the effectiveness of digital skills training</li>
                                <li>Improve AI-driven learning recommendations</li>
                                <li>Publish academic research on digital literacy and economic empowerment</li>
                            </ul>
                            <p className="mt-3">
                                Individual identities are never disclosed in research publications.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">10. Changes to This Policy</h5>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any
                                significant changes by email or through a notice on our platform. Your continued
                                use of SkillBridge254 after changes indicates your acceptance of the updated policy.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-3">11. Contact Us</h5>
                            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
                            <ul className="list-unstyled">
                                <li>📧 Email: support@skillbridge254.co.ke</li>
                                <li>📱 Phone: +254 700 000 000</li>
                                <li>📍 Address: Kiharu Constituency, Murang'a County, Kenya</li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="bg-light">
                        <Card.Body>
                            <p className="mb-0 text-muted small">
                                <strong>Governing Law:</strong> This Privacy Policy is governed by the laws of Kenya,
                                including the Data Protection Act, 2019.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Privacy;
