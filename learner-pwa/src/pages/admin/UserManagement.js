import { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button,
    Form,
    InputGroup,
    Badge,
    Modal,
    Alert,
    Spinner,
    Pagination
} from 'react-bootstrap';
import { adminAPI } from '../../services/api';
import CreateUserModal from '../../components/admin/CreateUserModal';
import './AdminDashboard.css';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modals
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Edit form
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        role: '',
        isActive: true
    });

    useEffect(() => {
        loadUsers();
    }, [currentPage, search, roleFilter, statusFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                search,
                role: roleFilter,
                isActive: statusFilter
            };

            const response = await adminAPI.getUsers(params);

            // Handle response structure safely
            const userData = response.data?.data || [];
            const pagination = response.data?.pagination || { pages: 1, total: 0 };

            setUsers(Array.isArray(userData) ? userData : []);
            setTotalPages(pagination.pages || 1);
            setTotal(pagination.total || 0);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users');
            setUsers([]);
            setTotalPages(1);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadUsers();
    };

    const handleViewUser = async (userId) => {
        try {
            const response = await adminAPI.getUser(userId);
            setSelectedUser(response.data.data);
            setShowViewModal(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load user details');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditForm({
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            role: user.role || 'user',
            isActive: user.isActive
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateUser(selectedUser._id, {
                profile: {
                    firstName: editForm.firstName,
                    lastName: editForm.lastName
                },
                role: editForm.role,
                isActive: editForm.isActive
            });

            setSuccess('User updated successfully');
            setShowEditModal(false);
            loadUsers();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async () => {
        try {
            setDeleteLoading(true);
            await adminAPI.deleteUser(selectedUser._id);
            setSuccess('User deleted successfully! All associated data has been removed.');
            setShowDeleteModal(false);
            setSelectedUser(null);
            loadUsers();

            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete user';
            setError(errorMessage);
            // Keep modal open on error so user can see what happened
            if (errorMessage.includes('last admin')) {
                // Don't close modal for last admin error
            } else {
                setShowDeleteModal(false);
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleUserCreated = (newUser) => {
        setSuccess(`User ${newUser.profile.firstName} ${newUser.profile.lastName} created successfully!`);
        loadUsers();
        setTimeout(() => setSuccess(''), 3000);
    };

    const getRoleBadge = (role) => {
        const config = {
            admin: { bg: 'danger', icon: '👑' },
            instructor: { bg: 'warning', icon: '📚' },
            user: { bg: 'primary', icon: '👤' }
        };
        const { bg, icon } = config[role] || { bg: 'secondary', icon: '❓' };
        return (
            <Badge className={`admin-badge admin-badge-${bg === 'danger' ? 'danger' : bg === 'warning' ? 'warning' : 'primary'}`}>
                <span className="me-1">{icon}</span>
                {role}
            </Badge>
        );
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <Badge className="admin-badge admin-badge-success">
                <span className="me-1">✓</span>Active
            </Badge>
        ) : (
            <Badge className="admin-badge" style={{ background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
                <span className="me-1">○</span>Inactive
            </Badge>
        );
    };

    return (
        <div className="admin-dashboard">
            <Container fluid>
                {/* Page Header */}
                <div className="welcome-banner mb-4">
                    <h2 className="mb-2">
                        <span className="me-2">👥</span>
                        User Management
                    </h2>
                    <p className="mb-0 opacity-90">
                        Manage platform users, roles, and permissions
                    </p>
                </div>

                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')} className="border-0 shadow-sm">
                        <span className="me-2">⚠️</span>{error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" dismissible onClose={() => setSuccess('')} className="border-0 shadow-sm">
                        <span className="me-2">✅</span>{success}
                    </Alert>
                )}

                {/* Filters */}
                <Card className="admin-card mb-4">
                    <Card.Body>
                        <Form onSubmit={handleSearch}>
                            <Row className="g-3">
                                <Col lg={4} md={6}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            🔍
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Col>
                                <Col lg={3} md={6}>
                                    <Form.Select
                                        value={roleFilter}
                                        onChange={(e) => {
                                            setRoleFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="">All Roles</option>
                                        <option value="user">👤 User</option>
                                        <option value="instructor">📚 Instructor</option>
                                        <option value="admin">👑 Admin</option>
                                    </Form.Select>
                                </Col>
                                <Col lg={3} md={6}>
                                    <Form.Select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">✓ Active</option>
                                        <option value="false">○ Inactive</option>
                                    </Form.Select>
                                </Col>
                                <Col lg={2} md={6}>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100"
                                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                                    >
                                        Search
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Users Table */}
                <Card className="admin-card">
                    <Card.Header>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <span className="me-2">📋</span>
                                Users <Badge bg="secondary" className="ms-2">{total}</Badge>
                            </h5>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                            >
                                <span className="me-2">➕</span>
                                Add User
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" style={{ color: '#667eea' }} />
                                <p className="mt-3 text-muted">Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="fs-1 mb-3 opacity-50">👥</div>
                                <p className="text-muted mb-0">No users found</p>
                                <small className="text-muted">Try adjusting your search filters</small>
                            </div>
                        ) : (
                            <Table className="data-table mb-0" hover responsive>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {(user.profile?.firstName?.[0] || '?').toUpperCase()}
                                                        {(user.profile?.lastName?.[0] || '').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">
                                                            {user.profile?.firstName} {user.profile?.lastName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-muted">{user.email}</td>
                                            <td>{getRoleBadge(user.role)}</td>
                                            <td>{getStatusBadge(user.isActive)}</td>
                                            <td>
                                                <small className="text-muted">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        className="btn-action btn-action-view"
                                                        size="sm"
                                                        onClick={() => handleViewUser(user._id)}
                                                    >
                                                        👁️ View
                                                    </Button>
                                                    <Button
                                                        className="btn-action btn-action-edit"
                                                        size="sm"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        ✏️ Edit
                                                    </Button>
                                                    <Button
                                                        className="btn-action btn-action-delete"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    >
                                                        🗑️ Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Card.Footer className="bg-white border-top">
                            <Pagination className="admin-pagination mb-0 justify-content-center">
                                <Pagination.First
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                />
                                <Pagination.Prev
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                />

                                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = index + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = index + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + index;
                                    } else {
                                        pageNum = currentPage - 2 + index;
                                    }
                                    return (
                                        <Pagination.Item
                                            key={pageNum}
                                            active={pageNum === currentPage}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Pagination.Item>
                                    );
                                })}

                                <Pagination.Next
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                />
                                <Pagination.Last
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                />
                            </Pagination>
                        </Card.Footer>
                    )}
                </Card>


                {/* View User Modal */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold">
                            <span className="me-2">👤</span>
                            User Details
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedUser && (
                            <div>
                                <div className="text-center mb-4">
                                    <div
                                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        {(selectedUser.user?.profile?.firstName?.[0] || '?').toUpperCase()}
                                        {(selectedUser.user?.profile?.lastName?.[0] || '').toUpperCase()}
                                    </div>
                                    <h4 className="fw-bold mb-1">
                                        {selectedUser.user?.profile?.firstName} {selectedUser.user?.profile?.lastName}
                                    </h4>
                                    <p className="text-muted mb-2">{selectedUser.user?.email}</p>
                                    <div className="d-flex justify-content-center gap-2">
                                        {getRoleBadge(selectedUser.user?.role)}
                                        {getStatusBadge(selectedUser.user?.isActive)}
                                    </div>
                                </div>

                                <Row className="g-3">
                                    <Col md={6}>
                                        <Card className="border-0 bg-light">
                                            <Card.Body className="py-3">
                                                <small className="text-muted d-block mb-1">Joined</small>
                                                <span className="fw-medium">
                                                    {new Date(selectedUser.user?.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="border-0 bg-light">
                                            <Card.Body className="py-3">
                                                <small className="text-muted d-block mb-1">Last Login</small>
                                                <span className="fw-medium">
                                                    {selectedUser.user?.lastLogin
                                                        ? new Date(selectedUser.user.lastLogin).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                        : 'Never'}
                                                </span>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {selectedUser.assessments && selectedUser.assessments.length > 0 && (
                                    <div className="mt-4">
                                        <h6 className="fw-bold mb-3">
                                            <span className="me-2">📝</span>
                                            Recent Assessments
                                        </h6>
                                        <Table size="sm" hover className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Score</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUser.assessments.map((assessment) => (
                                                    <tr key={assessment._id}>
                                                        <td>{new Date(assessment.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <span className="fw-bold" style={{ color: '#667eea' }}>
                                                                {assessment.aiAnalysis?.overallScore || 'N/A'}%
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <Badge className={`admin-badge admin-badge-${assessment.status === 'completed' ? 'success' : 'warning'}`}>
                                                                {assessment.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Edit User Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold">
                            <span className="me-2">✏️</span>
                            Edit User
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleUpdateUser}>
                        <Modal.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-medium">First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-medium">Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mt-3">
                                <Form.Label className="fw-medium">Role</Form.Label>
                                <Form.Select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                >
                                    <option value="user">👤 User</option>
                                    <option value="instructor">📚 Instructor</option>
                                    <option value="admin">👑 Admin</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mt-3">
                                <Form.Check
                                    type="switch"
                                    id="active-switch"
                                    label={editForm.isActive ? '✓ Active' : '○ Inactive'}
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer className="border-0">
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                            >
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => !deleteLoading && setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold text-danger">
                            <span className="me-2">⚠️</span>
                            Confirm Delete
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="danger" className="border-0">
                            <div className="d-flex align-items-start">
                                <div className="fs-3 me-3">🗑️</div>
                                <div>
                                    <h6 className="fw-bold mb-2">Delete User Account</h6>
                                    <p className="mb-2">
                                        Are you sure you want to delete{' '}
                                        <strong>
                                            {selectedUser?.profile?.firstName} {selectedUser?.profile?.lastName}
                                        </strong>
                                        ?
                                    </p>
                                    <p className="mb-0 small">
                                        This action <strong>cannot be undone</strong>. All user data including:
                                    </p>
                                    <ul className="small mb-0 mt-1">
                                        <li>Profile information</li>
                                        <li>Assessment history</li>
                                        <li>Learning progress</li>
                                        <li>Certificates</li>
                                    </ul>
                                    <p className="small mb-0 mt-2">
                                        will be <strong>permanently deleted</strong>.
                                    </p>
                                </div>
                            </div>
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteUser}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Deleting...
                                </>
                            ) : (
                                <>🗑️ Delete User</>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Create User Modal */}
                <CreateUserModal
                    show={showCreateModal}
                    onHide={() => setShowCreateModal(false)}
                    onUserCreated={handleUserCreated}
                />
            </Container>
        </div>
    );
}

export default UserManagement;
