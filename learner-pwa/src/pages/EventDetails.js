import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import './EventDetails.css';

function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/events/${id}`);
            setEvent(response.data.event);

            // Check if user is registered
            if (user && response.data.event.attendees) {
                setIsRegistered(response.data.event.attendees.includes(user._id));
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching event details:', err);
            setError('Failed to load event details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            navigate('/');
            return;
        }

        try {
            setRegistering(true);
            await api.post(`/events/${id}/register`);
            setIsRegistered(true);
            alert('Successfully registered for the event!');
            fetchEventDetails(); // Refresh to get updated attendee count
        } catch (err) {
            console.error('Error registering:', err);
            alert(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setRegistering(false);
        }
    };

    const handleUnregister = async () => {
        if (!user) {
            return;
        }

        if (!window.confirm('Are you sure you want to unregister from this event?')) {
            return;
        }

        try {
            setRegistering(true);
            await api.delete(`/events/${id}/register`);
            setIsRegistered(false);
            alert('Successfully unregistered from the event.');
            fetchEventDetails(); // Refresh to get updated attendee count
        } catch (err) {
            console.error('Error unregistering:', err);
            alert(err.response?.data?.message || 'Failed to unregister. Please try again.');
        } finally {
            setRegistering(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const variants = {
            upcoming: 'primary',
            ongoing: 'success',
            completed: 'secondary',
            cancelled: 'danger'
        };
        return variants[status] || 'secondary';
    };

    const isEventFull = () => {
        if (!event || !event.maxAttendees) return false;
        return (event.attendees?.length || 0) >= event.maxAttendees;
    };

    const canRegister = () => {
        if (!user) return false;
        if (isRegistered) return false;
        if (event?.status !== 'upcoming') return false;
        if (isEventFull()) return false;
        return true;
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading event details...</p>
            </Container>
        );
    }

    if (error || !event) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error || 'Event not found'}
                </Alert>
                <Button variant="primary" onClick={() => navigate('/events')}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Events
                </Button>
            </Container>
        );
    }

    return (
        <div className="event-details-page">
            {/* Breadcrumb */}
            <section className="breadcrumb-section bg-light py-3">
                <Container>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item"><Link to="/events">Events</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">{event.title}</li>
                        </ol>
                    </nav>
                </Container>
            </section>

            {/* Event Header */}
            <section className="event-header bg-primary text-white py-5">
                <Container>
                    <Row>
                        <Col lg={8}>
                            <div className="mb-3">
                                <Badge bg={getStatusBadge(event.status)} className="me-2">
                                    {event.status || 'upcoming'}
                                </Badge>
                                <Badge bg="light" text="dark">
                                    {event.category}
                                </Badge>
                                {event.isOnline && (
                                    <Badge bg="info" className="ms-2">
                                        <i className="bi bi-camera-video me-1"></i>
                                        Online Event
                                    </Badge>
                                )}
                            </div>
                            <h1 className="display-4 fw-bold mb-4">{event.title}</h1>

                            <div className="event-meta-header d-flex flex-wrap gap-4 mb-4">
                                <div className="meta-item">
                                    <i className="bi bi-calendar3 me-2"></i>
                                    <strong>{formatDate(event.startDate)}</strong>
                                </div>
                                <div className="meta-item">
                                    <i className="bi bi-clock me-2"></i>
                                    <strong>{formatTime(event.startDate)}</strong>
                                </div>
                                <div className="meta-item">
                                    <i className="bi bi-geo-alt me-2"></i>
                                    <strong>{event.isOnline ? 'Online' : event.location}</strong>
                                </div>
                            </div>

                            {!isRegistered && canRegister() ? (
                                <Button
                                    variant="light"
                                    size="lg"
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className="px-5"
                                >
                                    {registering ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-calendar-check me-2"></i>
                                            Register for Event
                                        </>
                                    )}
                                </Button>
                            ) : isRegistered ? (
                                <div>
                                    <Badge bg="success" className="p-3 fs-6 mb-3">
                                        <i className="bi bi-check-circle me-2"></i>
                                        You're registered for this event
                                    </Badge>
                                    <div>
                                        <Button
                                            variant="outline-light"
                                            onClick={handleUnregister}
                                            disabled={registering}
                                        >
                                            {registering ? 'Processing...' : 'Unregister'}
                                        </Button>
                                    </div>
                                </div>
                            ) : isEventFull() ? (
                                <Alert variant="warning" className="mb-0">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    This event is full
                                </Alert>
                            ) : event.status !== 'upcoming' ? (
                                <Alert variant="info" className="mb-0">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Registration is not available for this event
                                </Alert>
                            ) : null}
                        </Col>
                        <Col lg={4}>
                            <Card className="event-preview-card shadow-lg">
                                {event.image ? (
                                    <Card.Img variant="top" src={event.image} alt={event.title} />
                                ) : (
                                    <div className="preview-placeholder bg-secondary text-white d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                                        <i className="bi bi-calendar-event display-1"></i>
                                    </div>
                                )}
                                <Card.Body>
                                    <h5 className="mb-3">Event Details</h5>
                                    <ul className="list-unstyled">
                                        <li className="mb-2">
                                            <i className="bi bi-people text-primary me-2"></i>
                                            {event.attendees?.length || 0}
                                            {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-clock text-primary me-2"></i>
                                            {event.endDate ? (
                                                <>
                                                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                                </>
                                            ) : (
                                                formatTime(event.startDate)
                                            )}
                                        </li>
                                        {event.isOnline && event.meetingLink && isRegistered && (
                                            <li className="mb-2">
                                                <i className="bi bi-link-45deg text-primary me-2"></i>
                                                <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                                                    Join Meeting
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Event Content */}
            <section className="event-content py-5">
                <Container>
                    <Row>
                        <Col lg={8}>
                            <Card className="mb-4 shadow-sm">
                                <Card.Body>
                                    <h3 className="mb-3">
                                        <i className="bi bi-info-circle me-2 text-primary"></i>
                                        About This Event
                                    </h3>
                                    <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                                        {event.description}
                                    </p>
                                </Card.Body>
                            </Card>

                            {/* Organizer Info */}
                            {event.organizer && (
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        <h3 className="mb-3">
                                            <i className="bi bi-person-badge me-2 text-primary"></i>
                                            Organized By
                                        </h3>
                                        <div className="d-flex align-items-center">
                                            <div className="organizer-avatar me-3">
                                                {event.organizer.profilePhoto ? (
                                                    <img
                                                        src={event.organizer.profilePhoto}
                                                        alt={event.organizer.name}
                                                        className="rounded-circle"
                                                        width="60"
                                                        height="60"
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                        <i className="bi bi-person fs-4"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h6 className="mb-1">{event.organizer.name}</h6>
                                                <p className="text-muted small mb-0">{event.organizer.role || 'Event Organizer'}</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>

                        {/* Sidebar */}
                        <Col lg={4}>
                            <Card className="sticky-sidebar shadow-sm">
                                <Card.Body>
                                    <h5 className="mb-3">Quick Info</h5>
                                    <ul className="list-unstyled">
                                        <li className="mb-3">
                                            <i className="bi bi-calendar3 text-primary me-2"></i>
                                            <strong>Date:</strong><br />
                                            <small>{formatDate(event.startDate)}</small>
                                        </li>
                                        <li className="mb-3">
                                            <i className="bi bi-clock text-primary me-2"></i>
                                            <strong>Time:</strong><br />
                                            <small>{formatTime(event.startDate)}</small>
                                        </li>
                                        <li className="mb-3">
                                            <i className="bi bi-geo-alt text-primary me-2"></i>
                                            <strong>Location:</strong><br />
                                            <small>{event.isOnline ? 'Online Event' : event.location}</small>
                                        </li>
                                        <li className="mb-3">
                                            <i className="bi bi-tag text-primary me-2"></i>
                                            <strong>Category:</strong><br />
                                            <small>{event.category}</small>
                                        </li>
                                        {event.maxAttendees && (
                                            <li className="mb-3">
                                                <i className="bi bi-people text-primary me-2"></i>
                                                <strong>Capacity:</strong><br />
                                                <small>{event.attendees?.length || 0} / {event.maxAttendees} registered</small>
                                            </li>
                                        )}
                                    </ul>

                                    <hr />

                                    <div className="d-grid gap-2">
                                        {canRegister() && (
                                            <Button
                                                variant="primary"
                                                onClick={handleRegister}
                                                disabled={registering}
                                            >
                                                {registering ? 'Registering...' : 'Register Now'}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => navigate('/events')}
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Back to Events
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default EventDetails;
