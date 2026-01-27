import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Alert } from 'react-bootstrap';
import { FaAward, FaDownload, FaEye, FaCheckCircle, FaShareAlt, FaWifi, FaSync } from 'react-icons/fa';
import { certificateAPI } from '../services/api';
import offlineCertificateGenerator from '../services/offlineStorage/OfflineCertificateGenerator';
import './Certificates.css';

function Certificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineCertificates, setOfflineCertificates] = useState([]);

    useEffect(() => {
        loadCertificates();

        // Listen for online/offline events
        const handleOnline = () => {
            setIsOnline(true);
            loadCertificates(); // Reload when coming online
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadCertificates = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if user is authenticated
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const userStr = localStorage.getItem('user') || localStorage.getItem('cachedUser');

            if (!token || !userStr) {
                setError('Please log in to view your certificates');
                setLoading(false);
                return;
            }

            let user;
            try {
                user = JSON.parse(userStr);
            } catch (e) {
                setError('Please log in to view your certificates');
                setLoading(false);
                return;
            }

            const userId = user._id || user.id;

            // Load offline certificates first (always available)
            try {
                const offlineCerts = await offlineCertificateGenerator.getCertificates(userId);
                setOfflineCertificates(offlineCerts || []);
            } catch (offlineErr) {
                console.error('Offline certificate load error:', offlineErr);
                setOfflineCertificates([]);
            }

            // Try to load online certificates if connected
            if (navigator.onLine) {
                try {
                    const response = await certificateAPI.getMyCertificates();
                    const onlineCerts = response.data?.data || response.data?.certificates || response.data || [];
                    setCertificates(Array.isArray(onlineCerts) ? onlineCerts : []);
                } catch (err) {
                    console.error('Online certificate load error:', err);
                    // If online load fails, we still have offline certificates
                    if (err.response?.status === 401) {
                        setError('Please log in to view your certificates');
                    }
                    // Don't show error if we have offline certificates
                }
            }
        } catch (err) {
            console.error('Certificate load error:', err);
            setError('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (certificate) => {
        // Navigate to the certificate view page
        const certId = certificate.certificateNumber || certificate._id || certificate.id;
        window.location.href = `/certificates/${certId}`;
    };

    const handleDownload = async (certificate) => {
        try {
            // Check if this is an offline certificate
            if (certificate.pdfBlob) {
                // Download from local blob
                const url = URL.createObjectURL(certificate.pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `certificate-${certificate.courseName.replace(/\s+/g, '-')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                // Download from server
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
                window.open(`${apiUrl}/api/v1/certificates/${certificate.certificateNumber}/download`, '_blank');
            }
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download certificate');
        }
    };

    const handleShare = (certificate) => {
        const courseTitle = certificate.module?.title || certificate.courseName;
        const verificationCode = certificate.verificationCode;
        const shareUrl = `${window.location.origin}/verify/${verificationCode}`;
        const shareText = `I've completed ${courseTitle} on SkillBridge! Verify my certificate here:`;

        if (navigator.share) {
            navigator.share({
                title: 'My Certificate',
                text: shareText,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            alert('Certificate link copied to clipboard!');
        }
    };

    const getGradeColor = (grade) => {
        // All grades use green color scheme
        return 'success';
    };

    const getSyncStatusBadge = (certificate) => {
        if (certificate.syncStatus === 'pending') {
            return <Badge bg="success" className="ms-2 bg-opacity-75"><FaSync className="me-1" />Pending Sync</Badge>;
        } else if (certificate.syncStatus === 'synced' || certificate.verified) {
            return <Badge bg="success" className="ms-2"><FaCheckCircle className="me-1" />Verified</Badge>;
        } else if (certificate.syncStatus === 'failed') {
            return <Badge bg="success" className="ms-2 bg-opacity-50">Sync Failed</Badge>;
        }
        return null;
    };

    // Merge online and offline certificates, avoiding duplicates
    const mergedCertificates = [...certificates];
    offlineCertificates.forEach(offlineCert => {
        // Check if this offline certificate is already in online certificates
        const exists = certificates.some(onlineCert =>
            onlineCert.verificationCode === offlineCert.verificationCode
        );
        if (!exists) {
            mergedCertificates.push(offlineCert);
        }
    });

    // Sort by completion date (newest first)
    mergedCertificates.sort((a, b) => {
        const dateA = new Date(a.completionDate || a.generatedAt);
        const dateB = new Date(b.completionDate || b.generatedAt);
        return dateB - dateA;
    });

    if (loading) {
        return (
            <Container className="certificates-page py-5">
                <div className="text-center">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container className="certificates-page py-5">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center">
                            <FaAward className="text-success me-3" size={40} />
                            <div>
                                <h2 className="mb-0">My Certificates</h2>
                                <p className="text-muted mb-0">Your achievements and completed courses</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            {!isOnline && (
                                <Badge bg="success" className="bg-opacity-75">
                                    <FaWifi className="me-1" />
                                    Offline Mode
                                </Badge>
                            )}
                            {offlineCertificates.length > 0 && (
                                <Badge bg="success" className="bg-opacity-50">
                                    {offlineCertificates.length} Offline
                                </Badge>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {error && (
                <Alert variant="success" className="border-success" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {!isOnline && offlineCertificates.length > 0 && (
                <Alert variant="success" className="mb-4 bg-opacity-10 border-success">
                    <FaWifi className="me-2" />
                    You're viewing offline certificates. Connect to the internet to sync and verify your certificates.
                </Alert>
            )}

            {mergedCertificates.length === 0 ? (
                <Card className="text-center py-5">
                    <Card.Body>
                        <FaAward size={60} className="text-muted mb-3" />
                        <h4>No Certificates Yet</h4>
                        <p className="text-muted">
                            Complete courses and assessments to earn certificates
                        </p>
                        <Button variant="success" href="/learning">
                            Browse Courses
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    {mergedCertificates.map((cert) => {
                        const isOffline = !!cert.pdfBlob;
                        const courseTitle = cert.module?.title || cert.courseName;
                        const courseCategory = cert.module?.category || 'Course';
                        const issueDate = cert.issueDate || cert.generatedAt;
                        const certificateNumber = cert.certificateNumber || cert.id;
                        const grade = cert.grade || 'N/A';
                        const score = cert.score || 0;

                        return (
                            <Col key={cert._id || cert.id} md={6} lg={4} className="mb-4">
                                <Card className={`certificate-card h-100 shadow-sm ${isOffline ? 'border-success' : ''}`}>
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="certificate-icon">
                                                <FaAward size={50} className="text-success" />
                                            </div>
                                            {isOffline && (
                                                <Badge bg="success" className="ms-2 bg-opacity-75">
                                                    Offline
                                                </Badge>
                                            )}
                                        </div>

                                        <h5 className="mb-2">{courseTitle}</h5>
                                        <p className="text-muted small mb-3">{courseCategory}</p>

                                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                                            <div>
                                                <Badge bg={getGradeColor(grade)} className="me-2">
                                                    Grade: {grade}
                                                </Badge>
                                                <Badge bg="success" className="bg-opacity-75">
                                                    Score: {score}%
                                                </Badge>
                                            </div>
                                            {getSyncStatusBadge(cert)}
                                        </div>

                                        <div className="certificate-meta mb-3">
                                            <small className="text-muted d-block">
                                                <FaCheckCircle className="text-success me-1" />
                                                Issued: {new Date(issueDate).toLocaleDateString()}
                                            </small>
                                            <small className="text-muted d-block">
                                                Certificate No: {certificateNumber}
                                            </small>
                                        </div>

                                        <div className="d-grid gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleView(cert)}
                                            >
                                                <FaEye className="me-2" />
                                                View Details
                                            </Button>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="flex-fill"
                                                    onClick={() => handleDownload(cert)}
                                                >
                                                    <FaDownload className="me-1" />
                                                    Download
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="flex-fill"
                                                    onClick={() => handleShare(cert)}
                                                >
                                                    <FaShareAlt className="me-1" />
                                                    Share
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Certificate Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaAward className="text-warning me-2" />
                        Certificate Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCertificate && (
                        <div className="certificate-details">
                            {selectedCertificate.pdfBlob && (
                                <Alert variant="warning" className="mb-3">
                                    <FaWifi className="me-2" />
                                    This certificate was generated offline. Connect to the internet to verify and sync.
                                </Alert>
                            )}

                            <Row className="mb-4">
                                <Col md={8}>
                                    <h4>{selectedCertificate.module?.title || selectedCertificate.courseName}</h4>
                                    <p className="text-muted">{selectedCertificate.module?.category || 'Course'}</p>
                                </Col>
                                <Col md={4} className="text-end">
                                    <Badge bg={getGradeColor(selectedCertificate.grade || 'N/A')} className="fs-5">
                                        {selectedCertificate.grade || 'N/A'}
                                    </Badge>
                                    {getSyncStatusBadge(selectedCertificate)}
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Certificate Number:</strong>
                                    <p>{selectedCertificate.certificateNumber || selectedCertificate.id}</p>
                                </Col>
                                <Col md={6}>
                                    <strong>Verification Code:</strong>
                                    <p className="font-monospace">{selectedCertificate.verificationCode}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Issue Date:</strong>
                                    <p>{new Date(selectedCertificate.issueDate || selectedCertificate.generatedAt).toLocaleDateString()}</p>
                                </Col>
                                <Col md={6}>
                                    <strong>Completion Date:</strong>
                                    <p>{new Date(selectedCertificate.completionDate).toLocaleDateString()}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Score:</strong>
                                    <p>{selectedCertificate.score || 0}%</p>
                                </Col>
                                <Col md={6}>
                                    <strong>Status:</strong>
                                    <p>
                                        {selectedCertificate.verified || selectedCertificate.status === 'verified' ? (
                                            <Badge bg="success">
                                                <FaCheckCircle className="me-1" />
                                                Verified
                                            </Badge>
                                        ) : selectedCertificate.syncStatus === 'pending' ? (
                                            <Badge bg="warning">
                                                <FaSync className="me-1" />
                                                Pending Verification
                                            </Badge>
                                        ) : (
                                            <Badge bg="secondary">
                                                {selectedCertificate.status || 'Generated'}
                                            </Badge>
                                        )}
                                    </p>
                                </Col>
                            </Row>

                            {((selectedCertificate.skills && selectedCertificate.skills.length > 0) ||
                                (selectedCertificate.skillsAcquired && selectedCertificate.skillsAcquired.length > 0)) && (
                                    <div className="mb-3">
                                        <strong>Skills Acquired:</strong>
                                        <div className="mt-2">
                                            {(selectedCertificate.skills || selectedCertificate.skillsAcquired).map((skill, index) => (
                                                <Badge key={index} bg="info" className="me-2 mb-2">
                                                    {typeof skill === 'string' ? skill : `${skill.name} - ${skill.level}`}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            <Alert variant="info" className="mt-4">
                                <strong>Verify this certificate:</strong>
                                <p className="mb-0 small">
                                    Visit: {window.location.origin}/verify/{selectedCertificate.verificationCode}
                                </p>
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => handleDownload(selectedCertificate)}
                    >
                        <FaDownload className="me-2" />
                        Download PDF
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Certificates;
