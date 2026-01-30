import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import api from '../services/api';
import './Events.css';

function Events() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDateFilter, setSelectedDateFilter] = useState('upcoming');

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'webinar', label: 'Webinar' },
        { value: 'conference', label: 'Conference' },
        { value: 'networking', label: 'Networking' },
        { value: 'training', label: 'Training' },
        { value: 'seminar', label: 'Seminar' }
    ];

    const dateFilters = [
        { value: 'upcoming', label: 'Upcoming Events' },
        { value: 'this-week', label: 'This Week' },
        { value: 'this-month', label: 'This Month' },
        { value: 'all', label: 'All Events' }
    ];

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [events, selectedCategory, selectedDateFilter]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/events');
            setEvents(response.data.events || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filterEvents = () => {
        let filtered = [...events];

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(event =>
                event.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Date filter
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        if (selectedDateFilter === 'upcoming') {
            filtered = filtered.filter(event => new Date(event.startDate) >= now);
        } else if (selectedDateFilter === 'this-week') {
            filtered = filtered.filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate >= now && eventDate <= oneWeekFromNow;
            });
        } else if (selectedDateFilter === 'this-month') {
            filtered = filtered.filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate >= now && eventDate <= oneMonthFromNow;
            });
        }

        setFilteredEvents(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
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

    const getCapacityStatus = (event) => {
        if (!event.maxAttendees) return null;
        const attendeeCount = event.attendees?.length || 0;
        const percentage = (attendeeCount / event.maxAttendees) * 100;

        if (percentage >= 100) return { text: 'Full', variant: 'danger' };
        if (percentage >= 80) return { text: 'Almost Full', variant: 'warning' };
        return { text: `${attendeeCount}/${event.maxAttendees} spots`, variant: 'info' };
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading events...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
                <Button variant="primary" onClick={fetchEvents}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                </Button>
            </Container>
        );
    }

    return (
        <div className="events-page">
            <section className="events-hero bg-primary text-white py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <h1 className="display-4 fw-bold mb-3">Upcoming Events</h1>
                            <p className="lead mb-4">
                                Join our workshops, webinars, and networking events to connect with industry
                                professionals and expand your knowledge.
                            </p>
                            <div className="d-flex gap-3">
                                <div className="stat-item">
                                    <h3 className="mb-0">{events.length}+</h3>
                                    <small>Events</small>
                                </div>
                                <div className="stat-item">
                                    <h3 className="mb-0">5K+</h3>
                                    <small>Participants</small>
                                </div>
                                <div className="stat-item">
                                    <h3 className="mb-0">100%</h3>
                                    <small>Free to Join</small>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="filters-section py-4 bg-light">
                <Container>
                    <Row className="g-3">
                        <Col md={5}>
                            <Form.Select
                                value={selectedDateFilter}
                                onChange={(e) => setSelectedDateFilter(e.target.value)}
                            >
                                {dateFilters.map(filter => (
                                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={5}>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button
                                variant="outline-secondary"
                                className="w-100"
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSelectedDateFilter('upcoming');
                                }}
                                title="Clear filters"
                            >
                                <i className="bi bi-x-lg"></i> Clear
                            </Button>
                        </Col>
                    </Row>
                    <div className="mt-2 text-muted">
                        <small>Showing {filteredEvents.length} of {events.length} events</small>
                    </div>
                </Container>
            </section>

            <section className="events-grid py-5">
                <Container>
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-calendar-x display-1 text-muted"></i>
                            <h3 className="mt-3">No events found</h3>
                            <p className="text-muted">Try adjusting your filters or check back later for new events</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSelectedDateFilter('upcoming');
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {filteredEvents.map((event) => {
                                const capacityStatus = getCapacityStatus(event);
                                return (
                                    <Col key={event._id} lg={4} md={6}>
                                        <Card className="event-card h-100 shadow-sm">
                                            <div className="event-image-wrapper">
                                                {event.image ? (
                                                    <Card.Img
                                                        variant="top"
                                                        src={event.image}
                                                        alt={event.title}
                                                        className="event-image"
                                                    />
                                                ) : (
                                                    <div className="event-image-placeholder bg-primary text-white d-flex align-items-center justify-content-center">
                                                        <i className="bi bi-calendar-event display-4"></i>
                                                    </div>
                                                )}
                                                <div className="event-badges">
                                                    <Badge bg={getStatusBadge(event.status)}>
                                                        {event.status || 'upcoming'}
                                                    </Badge>
                                                    {event.isOnline && (
                                                        <Badge bg="info" className="ms-1">
                                                            <i className="bi bi-camera-video me-1"></i>
                                                            Online
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Card.Body className="d-flex flex-column">
                                                <div className="event-meta mb-2">
                                                    <Badge bg="light" text="dark">{event.category}</Badge>
                                                </div>
                                                <Card.Title className="h5 mb-2">
                                                    <Link
                                                        to={`/events/${event._id}`}
                                                        className="text-decoration-none text-dark"
                                                    >
                                                        {event.title}
                                                    </Link>
                                                </Card.Title>
                                                <Card.Text className="text-muted flex-grow-1 small">
                                                    {event.description?.substring(0, 100)}
                                                    {event.description?.length > 100 ? '...' : ''}
                                                </Card.Text>

                                                <div className="event-details mb-3">
                                                    <div className="detail-item mb-2">
                                                        <i className="bi bi-calendar3 text-primary me-2"></i>
                                                        <small>{formatDate(event.startDate)}</small>
                                                    </div>
                                                    <div className="detail-item mb-2">
                                                        <i className="bi bi-clock text-primary me-2"></i>
                                                        <small>{formatTime(event.startDate)}</small>
                                                    </div>
                                                    <div className="detail-item">
                                                        <i className="bi bi-geo-alt text-primary me-2"></i>
                                                        <small>{event.isOnline ? 'Online Event' : event.location}</small>
                                                    </div>
                                                </div>

                                                {capacityStatus && (
                                                    <div className="mb-3">
                                                        <Badge bg={capacityStatus.variant} className="w-100 p-2">
                                                            {capacityStatus.text}
                                                        </Badge>
                                                    </div>
                                                )}

                                                <Link
                                                    to={`/events/${event._id}`}
                                                    className="btn btn-primary w-100"
                                                >
                                                    View Details
                                                </Link>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </Container>
            </section>

            <section className="cta-section bg-light py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <h2 className="mb-3">Want to host an event?</h2>
                            <p className="text-muted mb-0">
                                Share your knowledge and connect with our community. Contact us to learn
                                about hosting workshops, webinars, or networking events.
                            </p>
                        </Col>
                        <Col lg={4} className="text-lg-end">
                            <Link to="/contact" className="btn btn-primary btn-lg">
                                <i className="bi bi-envelope me-2"></i>
                                Contact Us
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default Events;
