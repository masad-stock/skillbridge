import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { eventAPI } from '../../services/api';

function EventManagement() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedEventAttendees, setSelectedEventAttendees] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        isOnline: false,
        meetingLink: '',
        category: '',
        maxAttendees: '',
        image: ''
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await eventAPI.getAllEvents();
            setEvents(response.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title || '',
                description: event.description || '',
                startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
                endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
                location: event.location || '',
                isOnline: event.isOnline || false,
                meetingLink: event.meetingLink || '',
                category: event.category || '',
                maxAttendees: event.maxAttendees || '',
                image: event.image || ''
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                location: '',
                isOnline: false,
                meetingLink: '',
                category: '',
                maxAttendees: '',
                image: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEvent(null);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const submitData = {
                ...formData,
                maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined
            };

            if (editingEvent) {
                await eventAPI.updateEvent(editingEvent._id, submitData);
                setSuccess('Event updated successfully!');
            } else {
                await eventAPI.createEvent(submitData);
                setSuccess('Event created successfully!');
            }

            handleCloseModal();
            loadEvents();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save event');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            await eventAPI.deleteEvent(id);
            setSuccess('Event deleted successfully!');
            loadEvents();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete event');
        }
    };

    const handleShowAttendees = async (event) => {
        try {
            const response = await eventAPI.getEventAttendees(event._id);
            setSelectedEventAttendees(response.data || []);
            setShowAttendeesModal(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load attendees');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventStatus = (event) => {
        const now = new Date();
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);

        if (now < start) return { label: 'Upcoming', variant: 'info' };
        if (now >= start && now <= end) return { label: 'Ongoing', variant: 'success' };
        return { label: 'Completed', variant: 'secondary' };
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading events...</p>
            </Container>
        );
    }

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-2">
                                <span className="me-2">📅</span>
                                Event Management
                            </h2>
                            <p className="text-muted mb-0">Manage events and workshops</p>
                        </div>
                        <Button variant="primary" onClick={() => handleShowModal()}>
                            <span className="me-2">➕</span>
                            Add Event
                        </Button>
                    </div>
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

            <Card className="shadow-sm">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Attendees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        No events found. Click "Add Event" to create one.
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => {
                                    const status = getEventStatus(event);
                                    return (
                                        <tr key={event._id}>
                                            <td>
                                                <strong>{event.title}</strong>
                                                {event.category && (
                                                    <div className="mt-1">
                                                        <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>
                                                            {event.category}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div>{formatDate(event.startDate)}</div>
                                                {event.endDate && (
                                                    <small className="text-muted">
                                                        to {formatDate(event.endDate)}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                {event.isOnline ? (
                                                    <Badge bg="primary">Online</Badge>
                                                ) : (
                                                    event.location || 'TBD'
                                                )}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => handleShowAttendees(event)}
                                                    className="p-0"
                                                >
                                                    {event.attendees?.length || 0}
                                                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                                                </Button>
                                            </td>
                                            <td>
                                                <Badge bg={status.variant}>{status.label}</Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleShowModal(event)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(event._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingEvent ? 'Edit Event' : 'Add New Event'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label>Title *</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter event title"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Event description"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date & Time *</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date & Time</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="isOnline"
                                label="Online Event"
                                checked={formData.isOnline}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        {formData.isOnline ? (
                            <Form.Group className="mb-3">
                                <Form.Label>Meeting Link</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="meetingLink"
                                    value={formData.meetingLink}
                                    onChange={handleChange}
                                    placeholder="https://zoom.us/j/..."
                                />
                            </Form.Group>
                        ) : (
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Event venue address"
                                />
                            </Form.Group>
                        )}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g., Workshop, Webinar"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Max Attendees</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maxAttendees"
                                        value={formData.maxAttendees}
                                        onChange={handleChange}
                                        placeholder="Leave empty for unlimited"
                                        min="1"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Event Image URL</Form.Label>
                            <Form.Control
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingEvent ? 'Update' : 'Create'} Event
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Attendees Modal */}
            <Modal show={showAttendeesModal} onHide={() => setShowAttendeesModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Event Attendees</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEventAttendees.length === 0 ? (
                        <p className="text-muted text-center py-3">No attendees yet</p>
                    ) : (
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedEventAttendees.map((attendee, idx) => (
                                    <tr key={idx}>
                                        <td>{attendee.name}</td>
                                        <td>{attendee.email}</td>
                                        <td>{formatDate(attendee.registeredAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAttendeesModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default EventManagement;