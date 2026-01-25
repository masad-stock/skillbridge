import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { ProfileSkeleton } from '../components/LoadingSkeleton';

function Profile() {
    const { user, isAuthenticated, loading, logout } = useUser();
    const { showSuccess, showError } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                phoneNumber: user.profile?.phoneNumber || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (!profileForm.firstName || !profileForm.email) {
            showError('First name and email are required');
            return;
        }

        setUpdating(true);

        try {
            await authAPI.updateProfile({
                profile: {
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName,
                    phoneNumber: profileForm.phoneNumber
                }
            });

            showSuccess('Profile updated successfully!');
            setIsEditing(false);
            // Refresh page to get updated user data
            window.location.reload();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('Image size must be less than 5MB');
            return;
        }

        setUploadingPhoto(true);

        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await authAPI.uploadProfilePhoto(formData);

            showSuccess('Profile photo updated successfully!');
            // Refresh page to show new photo
            window.location.reload();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to upload photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDeletePhoto = async () => {
        if (!window.confirm('Are you sure you want to delete your profile photo?')) {
            return;
        }

        setUploadingPhoto(true);

        try {
            await authAPI.deleteProfilePhoto();
            showSuccess('Profile photo deleted successfully!');
            window.location.reload();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5">
                <Breadcrumbs />
                <ProfileSkeleton />
            </Container>
        );
    }

    if (!isAuthenticated) {
        return (
            <Container className="py-5">
                <Breadcrumbs />
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5">
                                <div className="fs-1 mb-4">🔒</div>
                                <h3 className="fw-bold mb-3">Authentication Required</h3>
                                <p className="text-muted mb-4">
                                    Please login or register to view your profile.
                                </p>
                                <Button as={Link} to="/" variant="primary" size="lg">
                                    <span className="me-2">🚀</span>
                                    Go to Home
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Breadcrumbs />
            <Row>
                <Col lg={8} className="mx-auto">
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light border-0 py-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-1 fw-bold">
                                        <span className="me-2">👤</span>
                                        Your Profile
                                    </h4>
                                    <p className="text-muted mb-0">Manage your personal information</p>
                                </div>
                                <div>
                                    {!isEditing ? (
                                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                                            <span className="me-2">✏️</span>
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" onClick={() => {
                                            setIsEditing(false);
                                            // Reset form
                                            setProfileForm({
                                                firstName: user.profile?.firstName || '',
                                                lastName: user.profile?.lastName || '',
                                                phoneNumber: user.profile?.phoneNumber || '',
                                                email: user.email || ''
                                            });
                                        }}>
                                            <span className="me-2">❌</span>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-4">
                            {/* Profile Photo Section */}
                            <div className="text-center mb-4 pb-4 border-bottom">
                                <div className="position-relative d-inline-block">
                                    {user.profile?.profilePhoto ? (
                                        <img
                                            src={user.profile.profilePhoto}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                            style={{ width: '120px', height: '120px', fontSize: '48px' }}
                                        >
                                            {user.profile?.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div className="position-absolute bottom-0 end-0">
                                        <label
                                            htmlFor="photo-upload"
                                            className="btn btn-sm btn-primary rounded-circle"
                                            style={{ width: '36px', height: '36px', padding: '0' }}
                                        >
                                            {uploadingPhoto ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <span>📷</span>
                                            )}
                                        </label>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                            disabled={uploadingPhoto}
                                        />
                                    </div>
                                </div>
                                {user.profile?.profilePhoto && (
                                    <div className="mt-2">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-danger"
                                            onClick={handleDeletePhoto}
                                            disabled={uploadingPhoto}
                                        >
                                            Remove Photo
                                        </Button>
                                    </div>
                                )}
                                <div className="mt-2">
                                    <small className="text-muted">
                                        Click the camera icon to upload a photo (max 5MB)
                                    </small>
                                </div>
                            </div>

                            {!isEditing ? (
                                <div>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <strong>First Name:</strong>
                                            <div className="text-muted">
                                                {user.profile?.firstName || 'Not provided'}
                                            </div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Last Name:</strong>
                                            <div className="text-muted">
                                                {user.profile?.lastName || 'Not provided'}
                                            </div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Email:</strong>
                                            <div className="text-muted">
                                                {user.email || 'Not provided'}
                                            </div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Phone Number:</strong>
                                            <div className="text-muted">
                                                {user.profile?.phoneNumber || 'Not provided'}
                                            </div>
                                        </Col>
                                    </Row>

                                    <hr className="my-4" />

                                    <div className="mb-3">
                                        <strong>Account Status:</strong>
                                        <div className="mt-2">
                                            <Badge bg="success" className="me-2">Active</Badge>
                                            <Badge bg={user.role === 'admin' ? 'warning' : 'info'}>
                                                {user.role === 'admin' ? 'Administrator' : 'Regular User'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Form onSubmit={handleProfileUpdate}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={profileForm.firstName}
                                                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                                    placeholder="John"
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={profileForm.lastName}
                                                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                                    placeholder="Doe"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                            placeholder="your.email@example.com"
                                            required
                                            disabled
                                        />
                                        <Form.Text className="text-muted">
                                            Email cannot be changed. Contact support if needed.
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            value={profileForm.phoneNumber}
                                            onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                            placeholder="0712345678 or +254712345678"
                                        />
                                        <Form.Text className="text-muted">
                                            Format: 0712345678 or +254712345678
                                        </Form.Text>
                                    </Form.Group>

                                    <div className="d-flex gap-3">
                                        <Button type="submit" variant="success" disabled={updating}>
                                            {updating ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="me-2">💾</span>
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setProfileForm({
                                                    firstName: user.profile?.firstName || '',
                                                    lastName: user.profile?.lastName || '',
                                                    phoneNumber: user.profile?.phoneNumber || '',
                                                    email: user.email || ''
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>

                        <Card.Footer className="bg-light border-0 py-3">
                            <Row>
                                <Col md={6}>
                                    <Button
                                        as={Link}
                                        to="/change-password"
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                    >
                                        <span className="me-2">🔐</span>
                                        Change Password
                                    </Button>
                                </Col>
                                <Col md={6} className="text-end">
                                    <small className="text-muted me-3">
                                        Taarifa zako ni salama na hazitashirikiwa na mtu mwingine
                                    </small>
                                    <Button variant="outline-danger" size="sm" onClick={logout}>
                                        <span className="me-2">🚪</span>
                                        Logout
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Profile;