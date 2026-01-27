import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaDownload, FaLinkedin, FaPrint, FaCheckCircle, FaCopy, FaArrowRight } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { certificateAPI } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './CertificateView.css';

function CertificateView() {
    const { id } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const certificateRef = useRef(null);

    useEffect(() => {
        loadCertificate();
    }, [id]);

    const loadCertificate = async () => {
        try {
            setLoading(true);
            const response = await certificateAPI.getCertificate(id);
            if (response.data?.success || response.data?.data) {
                setCertificate(response.data.data || response.data.certificate);
            } else {
                setError('Certificate not found');
            }
        } catch (err) {
            console.error('Failed to load certificate:', err);
            setError(err.response?.data?.message || 'Failed to load certificate');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`certificate-${certificate?.certificateNumber || 'download'}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAddToLinkedIn = () => {
        const certName = encodeURIComponent(certificate?.module?.title || 'Course Completion');
        const orgName = encodeURIComponent('SkillBridge254');
        const issueYear = new Date(certificate?.issueDate).getFullYear();
        const issueMonth = new Date(certificate?.issueDate).getMonth() + 1;
        const certId = encodeURIComponent(certificate?.certificateNumber || '');
        const certUrl = encodeURIComponent(`${window.location.origin}/verify/${certificate?.verificationCode}`);

        const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certId=${certId}&certUrl=${certUrl}`;

        window.open(linkedInUrl, '_blank');
    };

    const handleCopyLink = () => {
        const verifyUrl = `${window.location.origin}/verify/${certificate?.verificationCode}`;
        navigator.clipboard.writeText(verifyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Container className="certificate-view-page py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading certificate...</p>
                </div>
            </Container>
        );
    }

    if (error || !certificate) {
        return (
            <Container className="certificate-view-page py-5">
                <Alert variant="danger">
                    <Alert.Heading>Certificate Not Found</Alert.Heading>
                    <p>{error || 'The certificate you are looking for does not exist.'}</p>
                    <Link to="/certificates" className="btn btn-primary">
                        View My Certificates
                    </Link>
                </Alert>
            </Container>
        );
    }

    const userName = certificate.user?.profile
        ? `${certificate.user.profile.firstName || ''} ${certificate.user.profile.lastName || ''}`.trim()
        : 'Learner';
    const courseTitle = certificate.module?.title || 'Course';
    const verifyUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;

    return (
        <Container className="certificate-view-page py-4">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/certificates">Achievements</Link>
                    </li>
                    <li className="breadcrumb-item active">Certificate Preview</li>
                </ol>
            </nav>

            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="certificate-page-title">Certificate of Completion</h1>
                <p className="text-muted">Congratulations on successfully mastering your new skills!</p>
            </div>

            <Row>
                {/* Certificate Preview */}
                <Col lg={7} className="mb-4">
                    <div className="certificate-preview-wrapper">
                        <div className="certificate-preview" ref={certificateRef}>
                            <div className="certificate-inner">
                                {/* Logo */}
                                <div className="certificate-logo">
                                    <div className="logo-circle">
                                        <span className="logo-icon">🎓</span>
                                    </div>
                                </div>

                                {/* Organization */}
                                <div className="certificate-org">SKILLBRIDGE254</div>

                                {/* Title */}
                                <div className="certificate-title">CERTIFICATE OF ACHIEVEMENT</div>

                                {/* Certify Text */}
                                <div className="certificate-certify">This is to certify that</div>

                                {/* Recipient Name */}
                                <div className="certificate-name">{userName}</div>

                                {/* Completion Text */}
                                <div className="certificate-completion">
                                    has successfully completed the vocational module
                                </div>

                                {/* Course Title */}
                                <div className="certificate-course">{courseTitle}</div>

                                {/* Footer Section */}
                                <div className="certificate-footer">
                                    <div className="certificate-date-section">
                                        <div className="certificate-date">
                                            {formatDate(certificate.issueDate)}
                                        </div>
                                        <div className="certificate-date-label">Date Issued</div>
                                    </div>

                                    <div className="certificate-qr-section">
                                        <QRCodeSVG
                                            value={verifyUrl}
                                            size={60}
                                            level="M"
                                            includeMargin={false}
                                        />
                                        <div className="certificate-id">
                                            ID: {certificate.certificateNumber}
                                        </div>
                                    </div>

                                    <div className="certificate-signature-section">
                                        <div className="certificate-signature">
                                            <span className="signature-text">SkillBridge</span>
                                        </div>
                                        <div className="certificate-signer">DIRECTOR</div>
                                        <div className="certificate-platform">SkillBridge Platform</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Badge */}
                    <Card className="verification-badge-card mt-3">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="verification-icon">
                                    <FaCheckCircle className="text-success" size={24} />
                                </div>
                                <div className="ms-3">
                                    <div className="fw-bold">Authenticity Verified</div>
                                    <small className="text-muted">
                                        Certificate ID: {certificate.certificateNumber}
                                    </small>
                                </div>
                            </div>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleCopyLink}
                            >
                                <FaCopy className="me-2" />
                                {copied ? 'Copied!' : 'Copy Verification Link'}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Actions Panel */}
                <Col lg={5}>
                    <Card className="actions-card mb-4">
                        <Card.Body>
                            <h6 className="text-muted mb-3">ACTIONS</h6>

                            <div className="d-grid gap-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleDownloadPDF}
                                    className="action-btn"
                                >
                                    <FaDownload className="me-2" />
                                    Download PDF
                                </Button>

                                <Button
                                    variant="outline-primary"
                                    size="lg"
                                    onClick={handleAddToLinkedIn}
                                    className="action-btn"
                                >
                                    <FaLinkedin className="me-2" />
                                    Add to LinkedIn
                                </Button>

                                <Button
                                    variant="outline-secondary"
                                    size="lg"
                                    onClick={handlePrint}
                                    className="action-btn"
                                >
                                    <FaPrint className="me-2" />
                                    Print Certificate
                                </Button>
                            </div>

                            <div className="mt-4 pt-3 border-top">
                                <small className="text-muted">
                                    This certificate is authentic and can be verified using the unique ID or the QR code.
                                </small>
                                <div className="mt-2">
                                    <Link
                                        to={`/verify/${certificate.verificationCode}`}
                                        className="text-primary small"
                                    >
                                        <FaCheckCircle className="me-1" />
                                        Verify credentials online
                                    </Link>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* What's Next Card */}
                    <Card className="whats-next-card">
                        <Card.Body>
                            <h6 className="text-warning mb-2">What's next?</h6>
                            <p className="text-muted small mb-3">
                                You're on a roll! Start the next module to further enhance your digital business expertise.
                            </p>
                            <Link to="/learning" className="text-primary fw-bold">
                                Browse Modules <FaArrowRight className="ms-1" />
                            </Link>
                        </Card.Body>
                    </Card>

                    {/* Certificate Details */}
                    <Card className="mt-4">
                        <Card.Body>
                            <h6 className="text-muted mb-3">CERTIFICATE DETAILS</h6>
                            <div className="detail-row">
                                <span className="detail-label">Grade:</span>
                                <Badge bg={certificate.grade?.startsWith('A') ? 'success' : 'primary'}>
                                    {certificate.grade}
                                </Badge>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Score:</span>
                                <span>{certificate.score}%</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Category:</span>
                                <span>{certificate.module?.category || 'General'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Issued:</span>
                                <span>{formatDate(certificate.issueDate)}</span>
                            </div>
                            {certificate.skills && certificate.skills.length > 0 && (
                                <div className="mt-3">
                                    <span className="detail-label d-block mb-2">Skills Acquired:</span>
                                    <div>
                                        {certificate.skills.map((skill, idx) => (
                                            <Badge key={idx} bg="info" className="me-1 mb-1">
                                                {typeof skill === 'string' ? skill : skill.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Footer */}
            <div className="text-center mt-5 pt-4 border-top">
                <small className="text-muted">
                    © {new Date().getFullYear()} SkillBridge254 Platform. Empowering Digital Skills for Economic Growth.
                </small>
            </div>
        </Container>
    );
}

export default CertificateView;
