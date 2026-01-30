import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { blogAPI } from '../../services/api';

function BlogManagement() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        category: '',
        tags: '',
        published: false
    });

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await blogAPI.getAllPosts({ includeUnpublished: true });
            setPosts(response.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (post = null) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title || '',
                content: post.content || '',
                excerpt: post.excerpt || '',
                featuredImage: post.featuredImage || '',
                category: post.category || '',
                tags: post.tags?.join(', ') || '',
                published: post.published || false
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                content: '',
                excerpt: '',
                featuredImage: '',
                category: '',
                tags: '',
                published: false
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPost(null);
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
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };

            if (editingPost) {
                await blogAPI.updatePost(editingPost._id, submitData);
                setSuccess('Blog post updated successfully!');
            } else {
                await blogAPI.createPost(submitData);
                setSuccess('Blog post created successfully!');
            }

            handleCloseModal();
            loadPosts();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save blog post');
        }
    };

    const handlePublish = async (id, currentStatus) => {
        try {
            if (currentStatus) {
                // Unpublish - update with published: false
                await blogAPI.updatePost(id, { published: false });
                setSuccess('Blog post unpublished successfully!');
            } else {
                // Publish
                await blogAPI.publishPost(id);
                setSuccess('Blog post published successfully!');
            }
            loadPosts();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update publish status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) {
            return;
        }

        try {
            await blogAPI.deletePost(id);
            setSuccess('Blog post deleted successfully!');
            loadPosts();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete blog post');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading blog posts...</p>
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
                                <span className="me-2">📝</span>
                                Blog Management
                            </h2>
                            <p className="text-muted mb-0">Manage blog posts and content</p>
                        </div>
                        <Button variant="primary" onClick={() => handleShowModal()}>
                            <span className="me-2">➕</span>
                            Add Blog Post
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
                                <th>Category</th>
                                <th>Views</th>
                                <th>Published</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        No blog posts found. Click "Add Blog Post" to create one.
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post._id}>
                                        <td>
                                            <strong>{post.title}</strong>
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="mt-1">
                                                    {post.tags.slice(0, 2).map((tag, idx) => (
                                                        <Badge key={idx} bg="secondary" className="me-1" style={{ fontSize: '0.7rem' }}>
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {post.tags.length > 2 && (
                                                        <Badge bg="light" text="dark" style={{ fontSize: '0.7rem' }}>
                                                            +{post.tags.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <Badge bg="info">{post.category || 'Uncategorized'}</Badge>
                                        </td>
                                        <td>{post.views || 0}</td>
                                        <td>
                                            <Badge bg={post.published ? 'success' : 'warning'}>
                                                {post.published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </td>
                                        <td>
                                            {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                                        </td>
                                        <td>
                                            <Button
                                                variant={post.published ? 'outline-warning' : 'outline-success'}
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handlePublish(post._id, post.published)}
                                            >
                                                {post.published ? 'Unpublish' : 'Publish'}
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleShowModal(post)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(post._id)}
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
                        {editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}
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
                                placeholder="Enter blog post title"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Excerpt</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                placeholder="Brief summary (shown in blog list)"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Content *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={8}
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                placeholder="Full blog post content (supports markdown)"
                            />
                            <Form.Text className="text-muted">
                                Supports markdown formatting
                            </Form.Text>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g., Digital Skills, Entrepreneurship"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tags (comma-separated)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="e.g., technology, business, tips"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Featured Image URL</Form.Label>
                            <Form.Control
                                type="url"
                                name="featuredImage"
                                value={formData.featuredImage}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="published"
                                label="Publish immediately"
                                checked={formData.published}
                                onChange={handleChange}
                            />
                            <Form.Text className="text-muted">
                                Uncheck to save as draft
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingPost ? 'Update' : 'Create'} Post
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default BlogManagement;
