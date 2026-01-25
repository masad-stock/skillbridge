import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Alert, Badge, Row, Col, Button } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaAward, FaUser, FaBook } from 'react-icons/fa';
import { certificateAPI } from '../services/api';

function VerifyCertificate() {
    const { code } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        verifyCertificate();
    }, [code]);

    const verifyCertificate = async () => {
        try {
            setLoading(true);
            const response = await certificateAPI.verify(code);

            if (response.data.success) {
                setCertificate(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Certificate verification failed. Please check the code and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Verifying...</span>
                    </div>
                    <p className="mt-3">Verifying certificate...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Card className="text-center shadow">
                    <Card.Body className="py-5">
                        <FaTimesCircle size={80} className="text-danger mb-4" />
                        <h2>Certificate Not Found</h2>
                        <p className="text-muted">{error}</p>
                        <Button variant="primary" href="/">
                            Go to Homepage
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Card className="shadow-lg">
                <Card.Header className="bg-success text-white text-center py-4">
                    <FaCheckCircle size={60} className="mb-3" />
                    <h2>Certificate Verified</h2>
                    <p className="mb-0">This is a valid SkillBridge certificate</p>
                </Card.Header>

                <Card.Body className="p-5">
                    <div className="text-center mb-5">
                        <FaAward size={80} className="text-warning mb-3" />
                        <h3>{certificate.module.title}</h3>
                        <p className="text-muted">{certificate.module.category}</p>
                    </div>

                    <Row className="mb-4">
                        <Col md={6} className="mb-3">
                            <div className="d-flex align-items-start">
                                <FaUser className="text-primary me-3 mt-1" size={24} />
                                <div>
                                    <strong>Recipient</strong>
                                    <p className="mb-0">
                                        {certificate.user.profile.firstName} {certificate.user.profile.lastName}
                                    </p>
                                </div>
                            </div>
                        </Col>

                        <Col md={6} className="mb-3">
                            <div className="d-flex align-items-start">
                                <FaBook className="text-primary me-3 mt-1" size={24} />
                                <div>
                                    <strong>Course</strong>
                                    <p className="mb-0">{certificate.module.title}</p>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6} className="mb-3">
                            <strong>Certificate Number:</strong>
                            <p className="font-monospace">{certificate.certificateNumber}</p>
                        </Col>

                        <Col md={6} className="mb-3">
                            <strong>Verification Code:</strong>
                            <p className="font-monospace">{certificate.verificationCode}</p>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6} className="mb-3">
                            <strong>Issue Date:</strong>
                            <p>{new Date(certificate.issueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </Col>

                        <Col md={6} className="mb-3">
                            <strong>Completion Date:</strong>
                            <p>{new Date(certificate.completionDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6} className="mb-3">
                            <strong>Score:</strong>
                            <p>
                                <Badge bg="primary" className="fs-6">
                                    {certificate.score}%
                                </Badge>
                            </p>
                        </Col>

                        <Col md={6} className="mb-3">
                            <strong>Grade:</strong>
                            <p>
                                <Badge bg="success" className="fs-6">
                                    {certificate.grade}
                                </Badge>
                            </p>
                        </Col>
                    </Row>

                    {certificate.skills && certificate.skills.length > 0 && (
                        <div className="mb-4">
                            <strong>Skills Acquired:</strong>
                            <div className="mt-2">
                                {certificate.skills.map((skill, index) => (
                                    <Badge key={index} bg="info" className="me-2 mb-2">
                                        {skill.name} - {skill.level}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <Alert variant="success" className="mt-4">
                        <FaCheckCircle className="me-2" />
                        <strong>Verified!</strong> This certificate is authentic and was issued by SkillBridge.
                    </Alert>

                    <div className="text-center mt-4">
                        <p className="text-muted small">
                            SkillBridge - Empowering Digital Skills for Economic Growth
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default VerifyCertificate;
