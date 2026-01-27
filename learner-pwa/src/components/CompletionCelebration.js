import { useState, useEffect } from 'react';
import { Modal, Button, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import './CompletionCelebration.css';

function CompletionCelebration({
    show,
    onHide,
    courseTitle,
    certificate,
    score,
    timeSpent,
    nextCourse
}) {
    const { t } = useTranslation();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        console.log('[CompletionCelebration] Props received:', {
            show,
            courseTitle,
            certificate: certificate ? 'present' : 'missing',
            score,
            timeSpent
        });
        if (show) {
            console.log('[CompletionCelebration] Modal should be visible now');
            // Reset confetti state when modal opens
            setShowConfetti(false);
            // Trigger confetti after a small delay
            const timer = setTimeout(() => {
                console.log('[CompletionCelebration] Triggering confetti');
                triggerConfetti();
                setShowConfetti(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [show, courseTitle, certificate, score, timeSpent]);

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    const formatTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes} ${t('learning.estimatedTime')}`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            className="completion-celebration-modal"
        >
            <Modal.Header closeButton className="border-0 pb-0">
                <div className="w-100 text-center">
                    <div className="celebration-icon mb-3">
                        🎉
                    </div>
                    <Modal.Title className="celebration-title">
                        {t('completion.congratulations') || 'Congratulations!'}
                    </Modal.Title>
                </div>
            </Modal.Header>

            <Modal.Body className="text-center px-4 pb-4">
                <h4 className="mb-3">{t('completion.courseCompleted') || 'Course Completed!'}</h4>
                <h5 className="text-primary mb-4">{courseTitle}</h5>

                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    {score !== undefined && (
                        <div className="col-md-4">
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon">📊</div>
                                    <div className="stat-value">{score}%</div>
                                    <div className="stat-label">Score</div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}

                    {timeSpent && (
                        <div className="col-md-4">
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon">⏱️</div>
                                    <div className="stat-value">{formatTime(timeSpent)}</div>
                                    <div className="stat-label">Time Spent</div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}

                    {certificate && (
                        <div className="col-md-4">
                            <Card className="stat-card certificate-card">
                                <Card.Body>
                                    <div className="stat-icon">🏆</div>
                                    <div className="stat-label">{t('completion.certificateReady') || 'Certificate Ready!'}</div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Certificate Actions */}
                {certificate && (
                    <div className="certificate-section mb-4">
                        {/* Certificate Details */}
                        <Card className="mb-3 border-success">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <span className="fs-2 me-3">🏆</span>
                                    <div className="text-start">
                                        <h6 className="mb-0 fw-bold">Certificate Earned!</h6>
                                        <small className="text-muted">
                                            {certificate.certificateNumber || certificate.id}
                                        </small>
                                    </div>
                                </div>
                                <div className="row text-start">
                                    <div className="col-6">
                                        <small className="text-muted">Grade</small>
                                        <div className="fw-bold text-success">{certificate.grade || 'A'}</div>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted">Score</small>
                                        <div className="fw-bold">{certificate.score || score}%</div>
                                    </div>
                                </div>
                                {certificate.verificationCode && (
                                    <div className="mt-2 text-start">
                                        <small className="text-muted">Verification Code</small>
                                        <div className="font-monospace small">{certificate.verificationCode}</div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        <div className="certificate-actions">
                            {!certificate.isLocal ? (
                                <Link
                                    to={`/certificates/${certificate.certificateNumber || certificate._id || certificate.id}`}
                                    className="btn btn-primary btn-lg me-2"
                                >
                                    📜 {t('completion.viewCertificate') || 'View Certificate'}
                                </Link>
                            ) : (
                                <Link
                                    to="/certificates"
                                    className="btn btn-primary btn-lg me-2"
                                >
                                    📜 {t('completion.viewCertificates') || 'View Certificates'}
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Next Course Recommendation */}
                {nextCourse && (
                    <Card className="next-course-card">
                        <Card.Body>
                            <h6 className="mb-3">{t('completion.nextCourse') || 'Recommended Next Course'}</h6>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="text-start">
                                    <div className="fw-bold">{nextCourse.title}</div>
                                    <small className="text-muted">{nextCourse.description}</small>
                                </div>
                                <Link
                                    to={`/learning/${nextCourse._id}`}
                                    className="btn btn-success"
                                >
                                    {t('common.continue') || 'Continue'} →
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Social Share */}
                <div className="social-share mt-4">
                    <p className="text-muted mb-2">{t('completion.shareSuccess') || 'Share your achievement!'}</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                                const text = `I just completed ${courseTitle} on SkillBridge254! 🎉`;
                                const url = window.location.origin;
                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                            }}
                        >
                            🐦 Twitter
                        </Button>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                                const text = `I just completed ${courseTitle} on SkillBridge254!`;
                                const url = window.location.origin;
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                            }}
                        >
                            📘 Facebook
                        </Button>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                                const text = `I just completed ${courseTitle} on SkillBridge254!`;
                                const url = window.location.origin;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                            }}
                        >
                            💬 WhatsApp
                        </Button>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="border-0 justify-content-center">
                <Button variant="secondary" onClick={onHide}>
                    {t('common.close') || 'Close'}
                </Button>
                <Link to="/certificates" className="btn btn-primary">
                    {t('completion.viewCertificates') || 'View My Certificates'}
                </Link>
            </Modal.Footer>
        </Modal>
    );
}

export default CompletionCelebration;