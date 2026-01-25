import { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button,
    Form,
    Modal,
    Alert,
    Spinner,
    Badge,
    ProgressBar,
    ListGroup,
    Tabs,
    Tab
} from 'react-bootstrap';
import { adminAPI, uploadAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

function EnhancedModuleManagement() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showSuccess, showError } = useToast();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const [moduleForm, setModuleForm] = useState({
        title: '',
        description: '',
        category: 'basic_digital',
        difficulty: 1,
        priority: 5,
        estimatedTime: 60,
        youtubeUrl: '',
        instructor: '',
        isActive: true,
        content: {
            materials: [],
            textContent: '',
            videoUrl: '',
            youtubeUrl: ''
        }
    });

    const categories = [
        { value: 'basic_digital', label: 'Basic Digital Skills' },
        { value: 'business_automation', label: 'Business Automation' },
        { value: 'e_commerce', label: 'E-Commerce' },
        { value: 'digital_marketing', label: 'Digital Marketing' },
        { value: 'financial_management', label: 'Financial Management' },
        { value: 'communication', label: 'Communication' }
    ];

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Loading modules...');

            const response = await adminAPI.getModules();
            console.log('API Response:', response);

            if (response.data && response.data.success) {
                const moduleData = response.data.data || [];
                console.log('Module data:', moduleData);
                setModules(Array.isArray(moduleData) ? moduleData : []);
                showSuccess(`Loaded ${moduleData.length} modules successfully`);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Load modules error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load modules';
            setError(errorMessage);
            showError(errorMessage);
            setModules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            console.log('Creating module:', moduleForm);

            const response = await adminAPI.createModule(moduleForm);
            console.log('Create response:', response);

            if (response.data && response.data.success) {
                showSuccess('Module created successfully');
                setShowAddModal(false);
                resetForm();
                await loadModules();
            } else {
                throw new Error('Failed to create module');
            }
        } catch (err) {
            console.error('Create module error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create module';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleEditModule = (module) => {
        console.log('Editing module:', module);
        setSelectedModule(module);
        setModuleForm({
            title: module.title || '',
            description: module.description || '',
            category: module.category || 'basic_digital',
            difficulty: module.difficulty || 1,
            priority: module.priority || 5,
            estimatedTime: module.estimatedTime || module.baseTime || 60,
            youtubeUrl: module.content?.youtubeUrl || module.youtubeUrl || '',
            instructor: module.content?.instructor || module.instructor || '',
            isActive: module.isActive !== false,
            content: {
                materials: module.content?.materials || [],
                textContent: module.content?.textContent || '',
                videoUrl: module.content?.videoUrl || '',
                youtubeUrl: module.content?.youtubeUrl || module.youtubeUrl || ''
            }
        });
        setShowEditModal(true);
    };

    const handleUpdateModule = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            console.log('Updating module:', selectedModule._id, moduleForm);

            const response = await adminAPI.updateModule(selectedModule._id, moduleForm);
            console.log('Update response:', response);

            if (response.data && response.data.success) {
                showSuccess('Module updated successfully');
                setShowEditModal(false);
                resetForm();
                await loadModules();
            } else {
                throw new Error('Failed to update module');
            }
        } catch (err) {
            console.error('Update module error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update module';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteModule = async () => {
        try {
            setUploading(true);
            console.log('Deleting module:', selectedModule._id);

            const response = await adminAPI.deleteModule(selectedModule._id);
            console.log('Delete response:', response);

            if (response.data && response.data.success) {
                showSuccess('Module deleted successfully');
                setShowDeleteModal(false);
                setSelectedModule(null);
                await loadModules();
            } else {
                throw new Error('Failed to delete module');
            }
        } catch (err) {
            console.error('Delete module error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete module';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setModuleForm({
            title: '',
            description: '',
            category: 'basic_digital',
            difficulty: 1,
            priority: 5,
            estimatedTime: 60,
            youtubeUrl: '',
            instructor: '',
            isActive: true,
            content: {
                materials: [],
                textContent: '',
                videoUrl: '',
                youtubeUrl: ''
            }
        });
        setSelectedModule(null);
        setError('');
        setUploadProgress(0);
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            // Upload files to server
            const response = await uploadAPI.uploadModuleFiles(files);

            if (response.data && response.data.success) {
                const uploadedFiles = response.data.data;

                // Add uploaded files to module form
                const newMaterials = uploadedFiles.map(file => ({
                    title: file.originalName.replace(/\.[^/.]+$/, ""),
                    type: file.type,
                    url: `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${file.url}`,
                    size: file.size,
                    filename: file.filename
                }));

                setModuleForm(prev => ({
                    ...prev,
                    content: {
                        ...prev.content,
                        materials: [...(prev.content.materials || []), ...newMaterials]
                    }
                }));

                showSuccess(`${uploadedFiles.length} file(s) uploaded successfully`);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError(error.response?.data?.message || 'Failed to upload files');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const getFileType = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'pdf',
            'doc': 'document',
            'docx': 'document',
            'ppt': 'presentation',
            'pptx': 'presentation',
            'xls': 'spreadsheet',
            'xlsx': 'spreadsheet',
            'mp4': 'video',
            'avi': 'video',
            'mov': 'video',
            'mp3': 'audio',
            'wav': 'audio',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'zip': 'archive',
            'rar': 'archive'
        };
        return typeMap[extension] || 'document';
    };

    const removeMaterial = (index) => {
        setModuleForm(prev => ({
            ...prev,
            content: {
                ...prev.content,
                materials: prev.content.materials.filter((_, i) => i !== index)
            }
        }));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDifficultyBadge = (difficulty) => {
        const variants = { 1: 'success', 2: 'warning', 3: 'info', 4: 'danger' };
        const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert' };
        return <Badge bg={variants[difficulty]}>{labels[difficulty]}</Badge>;
    };

    const getCategoryLabel = (category) => {
        const cat = categories.find(c => c.value === category);
        return cat ? cat.label : category;
    };

    const getFileTypeIcon = (type) => {
        const icons = {
            'pdf': '📄',
            'document': '📝',
            'presentation': '📊',
            'spreadsheet': '📈',
            'video': '🎥',
            'audio': '🎵',
            'image': '🖼️',
            'archive': '📦'
        };
        return icons[type] || '📄';
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold">
                                <span className="me-2">📚</span>
                                Enhanced Module Management
                            </h2>
                            <p className="text-muted">Manage learning modules with rich content support</p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => {
                                resetForm();
                                setShowAddModal(true);
                            }}
                            disabled={uploading}
                        >
                            <span className="me-2">➕</span>
                            Add Module
                        </Button>
                    </div>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">Loading modules...</p>
                        </div>
                    ) : modules.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="fs-1 mb-3">📚</div>
                            <p className="text-muted">No modules found</p>
                            <Button variant="primary" onClick={() => setShowAddModal(true)}>
                                Add First Module
                            </Button>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Difficulty</th>
                                    <th>Priority</th>
                                    <th>Duration</th>
                                    <th>Materials</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map((module) => (
                                    <tr key={module._id}>
                                        <td>
                                            <div className="fw-bold">{module.title}</div>
                                            <small className="text-muted">{module.description}</small>
                                        </td>
                                        <td>{getCategoryLabel(module.category)}</td>
                                        <td>{getDifficultyBadge(module.difficulty)}</td>
                                        <td>
                                            <Badge bg="info">{module.priority}</Badge>
                                        </td>
                                        <td>{module.estimatedTime || module.baseTime || 0} min</td>
                                        <td>
                                            <Badge bg="secondary">
                                                {module.content?.materials?.length || 0} files
                                            </Badge>
                                        </td>
                                        <td>
                                            {module.isActive !== false ? (
                                                <Badge bg="success">Active</Badge>
                                            ) : (
                                                <Badge bg="secondary">Inactive</Badge>
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => {
                                                    setSelectedModule(module);
                                                    setShowContentModal(true);
                                                }}
                                            >
                                                Content
                                            </Button>
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditModule(module)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedModule(module);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Add Module Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add New Module</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddModule}>
                    <Modal.Body>
                        <Tabs defaultActiveKey="basic" className="mb-3">
                            <Tab eventKey="basic" title="Basic Info">
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Title *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={moduleForm.title}
                                                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Description *</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={moduleForm.description}
                                                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Category *</Form.Label>
                                            <Form.Select
                                                value={moduleForm.category}
                                                onChange={(e) => setModuleForm({ ...moduleForm, category: e.target.value })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Difficulty *</Form.Label>
                                            <Form.Select
                                                value={moduleForm.difficulty}
                                                onChange={(e) => setModuleForm({ ...moduleForm, difficulty: parseInt(e.target.value) })}
                                            >
                                                <option value="1">Easy</option>
                                                <option value="2">Medium</option>
                                                <option value="3">Hard</option>
                                                <option value="4">Expert</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Priority (1-10) *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={moduleForm.priority}
                                                onChange={(e) => setModuleForm({ ...moduleForm, priority: parseInt(e.target.value) })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Duration (minutes) *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={moduleForm.estimatedTime}
                                                onChange={(e) => setModuleForm({ ...moduleForm, estimatedTime: parseInt(e.target.value) })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>YouTube URL</Form.Label>
                                            <Form.Control
                                                type="url"
                                                value={moduleForm.youtubeUrl}
                                                onChange={(e) => setModuleForm({ ...moduleForm, youtubeUrl: e.target.value })}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Instructor</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={moduleForm.instructor}
                                                onChange={(e) => setModuleForm({ ...moduleForm, instructor: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Check
                                                type="checkbox"
                                                label="Active"
                                                checked={moduleForm.isActive}
                                                onChange={(e) => setModuleForm({ ...moduleForm, isActive: e.target.checked })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Tab>

                            <Tab eventKey="content" title="Content & Materials">
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Text Content</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={6}
                                                value={moduleForm.content.textContent}
                                                onChange={(e) => setModuleForm({
                                                    ...moduleForm,
                                                    content: { ...moduleForm.content, textContent: e.target.value }
                                                })}
                                                placeholder="Enter module content, instructions, or notes..."
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Upload Materials</Form.Label>
                                            <Form.Control
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.avi,.mov,.mp3,.wav,.jpg,.jpeg,.png,.gif,.zip,.rar"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                            <Form.Text className="text-muted">
                                                Supported formats: PDF, DOC, PPT, XLS, MP4, MP3, Images, Archives
                                            </Form.Text>
                                            {uploading && (
                                                <ProgressBar
                                                    now={uploadProgress}
                                                    label={`${uploadProgress}%`}
                                                    className="mt-2"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>

                                    {moduleForm.content.materials && moduleForm.content.materials.length > 0 && (
                                        <Col md={12}>
                                            <Form.Label>Uploaded Materials</Form.Label>
                                            <ListGroup>
                                                {moduleForm.content.materials.map((material, index) => (
                                                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="me-2">{getFileTypeIcon(material.type)}</span>
                                                            <strong>{material.title}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {material.type} • {formatFileSize(material.size)}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => removeMaterial(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Col>
                                    )}
                                </Row>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={uploading}>
                            {uploading ? 'Creating...' : 'Create Module'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Module Modal - Similar structure to Add Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Module</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateModule}>
                    <Modal.Body>
                        <Tabs defaultActiveKey="basic" className="mb-3">
                            <Tab eventKey="basic" title="Basic Info">
                                {/* Same form fields as Add Modal */}
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Title *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={moduleForm.title}
                                                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Description *</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={moduleForm.description}
                                                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Category *</Form.Label>
                                            <Form.Select
                                                value={moduleForm.category}
                                                onChange={(e) => setModuleForm({ ...moduleForm, category: e.target.value })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Difficulty *</Form.Label>
                                            <Form.Select
                                                value={moduleForm.difficulty}
                                                onChange={(e) => setModuleForm({ ...moduleForm, difficulty: parseInt(e.target.value) })}
                                            >
                                                <option value="1">Easy</option>
                                                <option value="2">Medium</option>
                                                <option value="3">Hard</option>
                                                <option value="4">Expert</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Priority (1-10) *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={moduleForm.priority}
                                                onChange={(e) => setModuleForm({ ...moduleForm, priority: parseInt(e.target.value) })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Duration (minutes) *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={moduleForm.estimatedTime}
                                                onChange={(e) => setModuleForm({ ...moduleForm, estimatedTime: parseInt(e.target.value) })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>YouTube URL</Form.Label>
                                            <Form.Control
                                                type="url"
                                                value={moduleForm.youtubeUrl}
                                                onChange={(e) => setModuleForm({ ...moduleForm, youtubeUrl: e.target.value })}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Instructor</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={moduleForm.instructor}
                                                onChange={(e) => setModuleForm({ ...moduleForm, instructor: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Check
                                                type="checkbox"
                                                label="Active"
                                                checked={moduleForm.isActive}
                                                onChange={(e) => setModuleForm({ ...moduleForm, isActive: e.target.checked })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Tab>

                            <Tab eventKey="content" title="Content & Materials">
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Text Content</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={6}
                                                value={moduleForm.content.textContent}
                                                onChange={(e) => setModuleForm({
                                                    ...moduleForm,
                                                    content: { ...moduleForm.content, textContent: e.target.value }
                                                })}
                                                placeholder="Enter module content, instructions, or notes..."
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Upload Materials</Form.Label>
                                            <Form.Control
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.avi,.mov,.mp3,.wav,.jpg,.jpeg,.png,.gif,.zip,.rar"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                            <Form.Text className="text-muted">
                                                Supported formats: PDF, DOC, PPT, XLS, MP4, MP3, Images, Archives
                                            </Form.Text>
                                            {uploading && (
                                                <ProgressBar
                                                    now={uploadProgress}
                                                    label={`${uploadProgress}%`}
                                                    className="mt-2"
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>

                                    {moduleForm.content.materials && moduleForm.content.materials.length > 0 && (
                                        <Col md={12}>
                                            <Form.Label>Uploaded Materials</Form.Label>
                                            <ListGroup>
                                                {moduleForm.content.materials.map((material, index) => (
                                                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="me-2">{getFileTypeIcon(material.type)}</span>
                                                            <strong>{material.title}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {material.type} • {formatFileSize(material.size)}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => removeMaterial(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Col>
                                    )}
                                </Row>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={uploading}>
                            {uploading ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Content View Modal */}
            <Modal show={showContentModal} onHide={() => setShowContentModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Module Content: {selectedModule?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedModule && (
                        <div>
                            <h6>Description</h6>
                            <p>{selectedModule.description}</p>

                            {selectedModule.content?.textContent && (
                                <>
                                    <h6>Text Content</h6>
                                    <div className="bg-light p-3 rounded mb-3">
                                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedModule.content.textContent}
                                        </pre>
                                    </div>
                                </>
                            )}

                            {selectedModule.content?.youtubeUrl && (
                                <>
                                    <h6>Video Content</h6>
                                    <p><a href={selectedModule.content.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                        {selectedModule.content.youtubeUrl}
                                    </a></p>
                                </>
                            )}

                            {selectedModule.content?.materials && selectedModule.content.materials.length > 0 && (
                                <>
                                    <h6>Materials ({selectedModule.content.materials.length})</h6>
                                    <ListGroup>
                                        {selectedModule.content.materials.map((material, index) => (
                                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="me-2">{getFileTypeIcon(material.type)}</span>
                                                    <strong>{material.title}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {material.type} • {formatFileSize(material.size)}
                                                    </small>
                                                </div>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => window.open(material.url, '_blank')}
                                                >
                                                    View
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowContentModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <Alert.Heading>⚠️ Warning</Alert.Heading>
                        <p>
                            Are you sure you want to delete module{' '}
                            <strong>{selectedModule?.title}</strong>?
                        </p>
                        <p className="mb-0">
                            This action cannot be undone. All user progress for this module will be affected.
                        </p>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteModule} disabled={uploading}>
                        {uploading ? 'Deleting...' : 'Delete Module'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default EnhancedModuleManagement;