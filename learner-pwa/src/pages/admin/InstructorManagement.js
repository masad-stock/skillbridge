import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { instructorAPI } from '../../services/api';

function InstructorManagement() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        title: '',
        bio: '',
        avatar: '',
        expertise: '',
        socialLinks: {
            linkedin: '',
            twitter: '',
            github: '',
            website: ''
        },
        active: true
    });

    useEffect(() => {
        loadInstructors();
    }, []);

    const loadInstructors = async () => {
        try {
            setLoading(true);
            const response = await instructorAPI.getAllInstructors();
            setInstructors(response.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load instructors');
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (instructor = null) => {
        if (instructor) {
            setEditingInstructor(instructor);
            setFormData({
                name: instructor.name || '',
                email: instructor.email || '',
                title: instructor.title || '',
                bio: instructor.bio || '',
                avatar: instructor.avatar || '',
                expertise: instructor.expertise?.join(', ') || '',
                socialLinks: instructor.socialLinks || {
                    linkedin: '',
                    twitter: '',
                    github: '',
                    website: ''
                },
                active: instructor.active !== false
            });
        } else {
            setEditingInstructor(null);
            setFormData({
                name: '',
                email: '',
                title: '',
                bio: '',
                avatar: '',
                expertise: '',
                socialLinks: {
                    linkedin: '',
                    twitter: '',
                    github: '',
                    website: ''
                },
                active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingInstructor(null);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('socialLinks.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const submitData = {
                ...formData,
                expertise: formData.expertise.split(',').map(e => e.trim()).filter(e => e)
            };

            if (editingInstructor) {
                await instructorAPI.updateInstructor(editingInstructor._id, submitData);
                setSuccess('Instructor updated successfully!');
            } else {
                await instructorAPI.createInstructor(submitData);
                setSuccess('Instructor created successfully!');
            }

            handleCloseModal();
            loadInstructors();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save instructor');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this instructor?')) {
            return;
        }

        try {
            await instructorAPI.deleteInstructor(id);
            setSuccess('Instructor deleted successfully!');
            loadInstructors();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete instructor');
        }
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading instructors...</p>
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
                                <span className="me-2">👨‍🏫</span>
                                Instructor Management
                            </h2>
                            <p className="text-muted mb-0">Manage platform instructors and their profiles</p>
                        </div>
                        <Button variant="primary" onClick={() => handleShowModal()}>
                            <span className="me-2">➕</span>
                            Add Instructor
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
                                <th>Name</th>
                                <th>Email</th>
                                <th>Title</th>
                                <th>Expertise</th>
                                <th>Students</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instructors.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        No instructors found. Click "Add Instructor" to create one.
                                    </td>
                                </tr>
                            ) : (
                                instructors.map((instructor) => (
                                    <tr key={instructor._id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}`}
                                                    alt={instructor.name}
                                                    className="rounded-circle me-2"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                />
                                                <strong>{instructor.name}</strong>
                                            </div>
                                        </td>
                                        <td>{instructor.email}</td>
                                        <td>{instructor.title}</td>
                                        <td>
                                            {instructor.expertise?.slice(0, 2).map((exp, idx) => (
                                                <Badge key={idx} bg="info" className="me-1">
                                                    {exp}
                                                </Badge>
                                            ))}
                                            {instructor.expertise?.length > 2 && (
                                                <Badge bg="secondary">+{instructor.expertise.length - 2}</Badge>
                                            )}
                                        </td>
                                        <td>{instructor.stats?.students || 0}</td>
                                        <td>
                                            <Badge bg={instructor.active ? 'success' : 'secondary'}>
                                                {instructor.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleShowModal(instructor)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(instructor._id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Senior Web Development Instructor"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Brief biography..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Avatar URL</Form.Label>
                            <Form.Control
                                type="url"
                                name="avatar"
                                value={formData.avatar}
                                onChange={handleChange}
                                placeholder="https://example.com/avatar.jpg"
                            />
                            <Form.Text className="text-muted">
                                Leave empty to use auto-generated avatar
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Expertise (comma-separated)</Form.Label>
                            <Form.Control
                                type="text"
                                name="expertise"
                                value={formData.expertise}
                                onChange={handleChange}
                                placeholder="Web Development, JavaScript, React"
                            />
                        </Form.Group>

                        <h6 className="mt-4 mb-3">Social Links</h6>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>LinkedIn</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="socialLinks.linkedin"
                                        value={formData.socialLinks.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Twitter</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="socialLinks.twitter"
                                        value={formData.socialLinks.twitter}
                                        onChange={handleChange}
                                        placeholder="https://twitter.com/username"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>GitHub</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="socialLinks.github"
                                        value={formData.socialLinks.github}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Website</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="socialLinks.website"
                                        value={formData.socialLinks.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="active"
                                label="Active (visible to users)"
                                checked={formData.active}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingInstructor ? 'Update' : 'Create'} Instructor
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default InstructorManagement;
