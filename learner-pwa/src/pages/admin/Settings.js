import { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
    Tabs,
    Tab
} from 'react-bootstrap';

function Settings() {
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'Learner Platform',
        siteDescription: 'Adaptive Learning Platform for Digital Skills',
        contactEmail: 'admin@learner.com',
        supportEmail: 'support@learner.com'
    });

    const [emailSettings, setEmailSettings] = useState({
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
        fromName: 'Learner Platform'
    });

    const [assessmentSettings, setAssessmentSettings] = useState({
        passingScore: 70,
        maxAttempts: 3,
        timeLimit: 60,
        showCorrectAnswers: true,
        allowRetake: true
    });

    const [certificateSettings, setCertificateSettings] = useState({
        enabled: true,
        autoGenerate: true,
        requireMinScore: 80,
        includeQRCode: true,
        signatoryName: '',
        signatoryTitle: ''
    });

    const handleSaveGeneral = (e) => {
        e.preventDefault();
        // TODO: Implement API call
        setSuccess('General settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSaveEmail = (e) => {
        e.preventDefault();
        // TODO: Implement API call
        setSuccess('Email settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSaveAssessment = (e) => {
        e.preventDefault();
        // TODO: Implement API call
        setSuccess('Assessment settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSaveCertificate = (e) => {
        e.preventDefault();
        // TODO: Implement API call
        setSuccess('Certificate settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold">
                        <span className="me-2">⚙️</span>
                        Settings
                    </h2>
                    <p className="text-muted">Configure platform settings and preferences</p>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Tabs defaultActiveKey="general" className="mb-4">
                        {/* General Settings */}
                        <Tab eventKey="general" title="General">
                            <Form onSubmit={handleSaveGeneral}>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Site Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={generalSettings.siteName}
                                                onChange={(e) => setGeneralSettings({
                                                    ...generalSettings,
                                                    siteName: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Contact Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={generalSettings.contactEmail}
                                                onChange={(e) => setGeneralSettings({
                                                    ...generalSettings,
                                                    contactEmail: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Site Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={generalSettings.siteDescription}
                                                onChange={(e) => setGeneralSettings({
                                                    ...generalSettings,
                                                    siteDescription: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Support Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={generalSettings.supportEmail}
                                                onChange={(e) => setGeneralSettings({
                                                    ...generalSettings,
                                                    supportEmail: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button variant="primary" type="submit">
                                    Save General Settings
                                </Button>
                            </Form>
                        </Tab>

                        {/* Email Settings */}
                        <Tab eventKey="email" title="Email">
                            <Form onSubmit={handleSaveEmail}>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>SMTP Host</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={emailSettings.smtpHost}
                                                onChange={(e) => setEmailSettings({
                                                    ...emailSettings,
                                                    smtpHost: e.target.value
                                                })}
                                                placeholder="smtp.gmail.com"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>SMTP Port</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={emailSettings.smtpPort}
                                                onChange={(e) => setEmailSettings({
                                                    ...emailSettings,
                                                    smtpPort: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>SMTP Username</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={emailSettings.smtpUser}
                                                onChange={(e) => setEmailSettings({
                                                    ...emailSettings,
                                                    smtpUser: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>SMTP Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={emailSettings.smtpPassword}
                                                onChange={(e) => setEmailSettings({
                                                    ...emailSettings,
                                                    smtpPassword: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>From Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={emailSettings.fromEmail}
                                                onChange={(e) => setEmailSettings({
                                                    ...emailSettings,
                                                    fromEmail: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>From Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={emailSettings.fromName}
                                                onChange={(e) => setEmailSettings({
                                                    ...emailSettings,
                                                    fromName: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button variant="primary" type="submit">
                                    Save Email Settings
                                </Button>
                            </Form>
                        </Tab>

                        {/* Assessment Settings */}
                        <Tab eventKey="assessment" title="Assessment">
                            <Form onSubmit={handleSaveAssessment}>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Passing Score (%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={assessmentSettings.passingScore}
                                                onChange={(e) => setAssessmentSettings({
                                                    ...assessmentSettings,
                                                    passingScore: parseInt(e.target.value)
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Max Attempts</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={assessmentSettings.maxAttempts}
                                                onChange={(e) => setAssessmentSettings({
                                                    ...assessmentSettings,
                                                    maxAttempts: parseInt(e.target.value)
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Time Limit (minutes)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={assessmentSettings.timeLimit}
                                                onChange={(e) => setAssessmentSettings({
                                                    ...assessmentSettings,
                                                    timeLimit: parseInt(e.target.value)
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Check
                                                type="checkbox"
                                                label="Show Correct Answers After Completion"
                                                checked={assessmentSettings.showCorrectAnswers}
                                                onChange={(e) => setAssessmentSettings({
                                                    ...assessmentSettings,
                                                    showCorrectAnswers: e.target.checked
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Check
                                                type="checkbox"
                                                label="Allow Retake"
                                                checked={assessmentSettings.allowRetake}
                                                onChange={(e) => setAssessmentSettings({
                                                    ...assessmentSettings,
                                                    allowRetake: e.target.checked
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button variant="primary" type="submit">
                                    Save Assessment Settings
                                </Button>
                            </Form>
                        </Tab>

                        {/* Certificate Settings */}
                        <Tab eventKey="certificate" title="Certificate">
                            <Form onSubmit={handleSaveCertificate}>
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Check
                                                type="checkbox"
                                                label="Enable Certificates"
                                                checked={certificateSettings.enabled}
                                                onChange={(e) => setCertificateSettings({
                                                    ...certificateSettings,
                                                    enabled: e.target.checked
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Check
                                                type="checkbox"
                                                label="Auto-Generate on Completion"
                                                checked={certificateSettings.autoGenerate}
                                                onChange={(e) => setCertificateSettings({
                                                    ...certificateSettings,
                                                    autoGenerate: e.target.checked
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Minimum Score Required (%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={certificateSettings.requireMinScore}
                                                onChange={(e) => setCertificateSettings({
                                                    ...certificateSettings,
                                                    requireMinScore: parseInt(e.target.value)
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Check
                                                type="checkbox"
                                                label="Include QR Code for Verification"
                                                checked={certificateSettings.includeQRCode}
                                                onChange={(e) => setCertificateSettings({
                                                    ...certificateSettings,
                                                    includeQRCode: e.target.checked
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Signatory Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={certificateSettings.signatoryName}
                                                onChange={(e) => setCertificateSettings({
                                                    ...certificateSettings,
                                                    signatoryName: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Signatory Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={certificateSettings.signatoryTitle}
                                                onChange={(e) => setCertificateSettings({
                                                    ...certificateSettings,
                                                    signatoryTitle: e.target.value
                                                })}
                                                placeholder="e.g., Director of Education"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button variant="primary" type="submit">
                                    Save Certificate Settings
                                </Button>
                            </Form>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Settings;
