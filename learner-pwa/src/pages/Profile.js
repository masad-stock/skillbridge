import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Nav, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { ProfileSkeleton } from '../components/LoadingSkeleton';
import './Profile.css';

function Profile() {
    const { user, isAuthenticated, loading, logout } = useUser();
    const { showSuccess, showError } = useToast();
    const [activeTab, setActiveTab] = useState('personal');
    const [updating, setUpdating] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const fileInputRef = React.useRef(null);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        businessName: '',
        businessCategory: '',
        contactEmail: '',
        businessLocation: '',
        lowBandwidthMode: false,
        syncFrequency: 'every24hours'
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                phoneNumber: user.profile?.phoneNumber || '',
                email: user.email || '',
                businessName: user.profile?.businessName || '',
                businessCategory: user.profile?.businessCategory || '',
                contactEmail: user.profile?.contactEmail || user.email || '',
                businessLocation: user.profile?.businessLocation || '',
                lowBandwidthMode: user.profile?.lowBandwidthMode || false,
                syncFrequency: user.profile?.syncFrequency || 'every24hours'
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
                    phoneNumber: profileForm.phoneNumber,
                    businessName: profileForm.businessName,
                    businessCategory: profileForm.businessCategory,
                    contactEmail: profileForm.contactEmail,
                    businessLocation: profileForm.businessLocation,
                    lowBandwidthMode: profileForm.lowBandwidthMode,
                    syncFrequency: profileForm.syncFrequency
                }
            });

            showSuccess('Profile updated successfully!');
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

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError('Image size must be less than 5MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploadingPhoto(true);

        try {
            const formData = new FormData();
            formData.append('photo', file);

            await authAPI.uploadProfilePhoto(formData);
            showSuccess('Profile photo updated successfully!');
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            let errorMessage = 'Failed to upload photo. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            showError(errorMessage);
            if (fileInputRef.current) fileInputRef.current.value = '';
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
        <div className="profile-page">
            <Container fluid className="py-4">
                <Row>
                    {/* Left Sidebar */}
                    <Col lg={3} className="mb-4">
                        <Card className="profile-sidebar border-0 shadow-sm">
                            <Card.Body className="text-center p-4">
                                {/* Profile Photo */}
                                <div className="profile-photo-wrapper mb-3">
                                    <div className="position-relative d-inline-block">
                                        {user.profile?.profilePhoto ? (
                                            <img
                                                src={user.profile.profilePhoto.startsWith('http')
                                                    ? user.profile.profilePhoto
                                                    : `${process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:5001'}${user.profile.profilePhoto}`
                                                }
                                                alt="Profile"
                                                className="profile-photo"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : (
                                            <div className="profile-photo-placeholder">
                                                {user.profile?.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        {user.profile?.profilePhoto && (
                                            <div className="profile-photo-placeholder" style={{ display: 'none' }}>
                                                {user.profile?.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <label htmlFor="photo-upload" className="photo-upload-btn">
                                            {uploadingPhoto ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <i className="bi bi-camera-fill"></i>
                                            )}
                                        </label>
                                        <input
                                            id="photo-upload"
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                            disabled={uploadingPhoto}
                                        />
                                    </div>
                                </div>

                                {/* User Name */}
                                <h5 className="fw-bold mb-1">
                                    {user.profile?.firstName && user.profile?.lastName
                                        ? `${user.profile.firstName} ${user.profile.lastName}`
                                        : user.profile?.firstName || 'User'}
                                </h5>
                                <p className="text-primary mb-2">Kiharu Member</p>
                                <p className="text-muted small mb-3">
                                    Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </p>

                                {/* Profile Overview Button */}
                                <Button variant="primary" className="w-100 mb-3">
                                    <i className="bi bi-person me-2"></i>
                                    Profile Overview
                                </Button>

                                {/* Account Settings */}
                                <div className="sidebar-menu">
                                    <Button
                                        variant="link"
                                        className="sidebar-menu-item"
                                        as={Link}
                                        to="/change-password"
                                    >
                                        <i className="bi bi-gear me-2"></i>
                                        Account Settings
                                    </Button>
                                    <Button
                                        variant="link"
                                        className="sidebar-menu-item"
                                        as={Link}
                                        to="/dashboard"
                                    >
                                        <i className="bi bi-question-circle me-2"></i>
                                        Help Center
                                    </Button>
                                    <Button
                                        variant="link"
                                        className="sidebar-menu-item text-danger"
                                        onClick={logout}
                                    >
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        Logout
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Upgrade Card */}
                        <Card className="upgrade-card border-0 shadow-sm mt-3">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold text-white mb-2">Grow your Business</h6>
                                <p className="text-white small mb-3">
                                    Complete your business profile to unlock premium digital resources.
                                </p>
                                <Button variant="light" size="sm" className="w-100">
                                    Upgrade Profile
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Main Content */}
                    <Col lg={9}>
                        <Card className="profile-content border-0 shadow-sm">
                            <Card.Body className="p-4">
                                {/* Header */}
                                <div className="mb-4">
                                    <h4 className="fw-bold mb-1">User Profile & Business Settings</h4>
                                    <p className="text-muted mb-0">
                                        Manage your personal information and business preferences tailored for Kiharu Constituency.
                                    </p>
                                </div>

                                {/* Tabs */}
                                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                    <Nav variant="tabs" className="profile-tabs mb-4">
                                        <Nav.Item>
                                            <Nav.Link eventKey="personal">Personal Info</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="business">Business Profile</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="security">Security</Nav.Link>
                                        </Nav.Item>
                                    </Nav>

                                    <Tab.Content>
                                        {/* Personal Info Tab */}
                                        <Tab.Pane eventKey="personal">
                                            <Form onSubmit={handleProfileUpdate}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>First Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={profileForm.firstName}
                                                                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                                                placeholder="e.g. John"
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
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        value={profileForm.email}
                                                        disabled
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <Form.Label>Phone Number</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        value={profileForm.phoneNumber}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                                        placeholder="+254 7X X XXX XXX"
                                                    />
                                                </Form.Group>

                                                <div className="d-flex justify-content-between">
                                                    <Button variant="outline-secondary">
                                                        Discard Changes
                                                    </Button>
                                                    <Button variant="primary" type="submit" disabled={updating}>
                                                        {updating ? (
                                                            <>
                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-save me-2"></i>
                                                                Save Profile Changes
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </Form>
                                        </Tab.Pane>

                                        {/* Business Profile Tab */}
                                        <Tab.Pane eventKey="business">
                                            <h5 className="fw-bold mb-3">Business Profile Details</h5>
                                            <Form onSubmit={handleProfileUpdate}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Business Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={profileForm.businessName}
                                                                onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                                                                placeholder="e.g. Kiharu Green Grocers"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Business Category</Form.Label>
                                                            <Form.Select
                                                                value={profileForm.businessCategory}
                                                                onChange={(e) => setProfileForm({ ...profileForm, businessCategory: e.target.value })}
                                                            >
                                                                <option value="">Select category</option>
                                                                <option value="retail">Retail & Wholesale</option>
                                                                <option value="agriculture">Agriculture</option>
                                                                <option value="services">Services</option>
                                                                <option value="manufacturing">Manufacturing</option>
                                                                <option value="technology">Technology</option>
                                                                <option value="other">Other</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Contact Email</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                value={profileForm.contactEmail}
                                                                onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                                                                placeholder="contact@mybusiness.com"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Phone Number</Form.Label>
                                                            <Form.Control
                                                                type="tel"
                                                                value={profileForm.phoneNumber}
                                                                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                                                placeholder="+254 7X X XXX XXX"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-4">
                                                    <Form.Label>Business Location (Ward)</Form.Label>
                                                    <Form.Select
                                                        value={profileForm.businessLocation}
                                                        onChange={(e) => setProfileForm({ ...profileForm, businessLocation: e.target.value })}
                                                    >
                                                        <option value="">Select ward</option>
                                                        <option value="wangu">Wangu</option>
                                                        <option value="murungaru">Murungaru</option>
                                                        <option value="gaturi">Gaturi</option>
                                                        <option value="magutu">Magutu</option>
                                                        <option value="kangari">Kangari</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                {/* Sync Preferences */}
                                                <div className="sync-preferences p-3 mb-4">
                                                    <div className="d-flex align-items-start mb-3">
                                                        <Form.Check
                                                            type="checkbox"
                                                            id="sync-preferences"
                                                            checked={profileForm.lowBandwidthMode}
                                                            onChange={(e) => setProfileForm({ ...profileForm, lowBandwidthMode: e.target.checked })}
                                                            className="me-3"
                                                        />
                                                        <div>
                                                            <label htmlFor="sync-preferences" className="fw-bold mb-1 d-block">
                                                                Sync Preferences
                                                            </label>
                                                            <p className="text-muted small mb-0">
                                                                Optimize your data usage for low-bandwidth environments in Kiharu.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {profileForm.lowBandwidthMode && (
                                                        <div className="ms-4">
                                                            <div className="low-bandwidth-option p-2 mb-2">
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    id="low-bandwidth"
                                                                    checked={profileForm.lowBandwidthMode}
                                                                    onChange={(e) => setProfileForm({ ...profileForm, lowBandwidthMode: e.target.checked })}
                                                                    label={
                                                                        <div>
                                                                            <strong>Low Bandwidth Mode</strong>
                                                                            <p className="text-muted small mb-0">
                                                                                Reduce image quality and background sync to save data
                                                                            </p>
                                                                        </div>
                                                                    }
                                                                />
                                                            </div>

                                                            <Form.Group>
                                                                <Form.Label className="small">Sync Frequency</Form.Label>
                                                                <Form.Select
                                                                    size="sm"
                                                                    value={profileForm.syncFrequency}
                                                                    onChange={(e) => setProfileForm({ ...profileForm, syncFrequency: e.target.value })}
                                                                >
                                                                    <option value="every24hours">Every 24 hours (Recommended)</option>
                                                                    <option value="every12hours">Every 12 hours</option>
                                                                    <option value="every6hours">Every 6 hours</option>
                                                                    <option value="manual">Manual only</option>
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="d-flex justify-content-between">
                                                    <Button variant="outline-secondary">
                                                        Discard Changes
                                                    </Button>
                                                    <Button variant="primary" type="submit" disabled={updating}>
                                                        {updating ? (
                                                            <>
                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-save me-2"></i>
                                                                Save Profile Changes
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </Form>
                                        </Tab.Pane>

                                        {/* Security Tab */}
                                        <Tab.Pane eventKey="security">
                                            <h5 className="fw-bold mb-3">Security Settings</h5>
                                            <div className="security-options">
                                                <Card className="mb-3 border">
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="fw-bold mb-1">Password</h6>
                                                                <p className="text-muted small mb-0">
                                                                    Last changed 30 days ago
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                as={Link}
                                                                to="/change-password"
                                                            >
                                                                Change Password
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>

                                                <Card className="mb-3 border">
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="fw-bold mb-1">Two-Factor Authentication</h6>
                                                                <p className="text-muted small mb-0">
                                                                    Add an extra layer of security to your account
                                                                </p>
                                                            </div>
                                                            <Badge bg="secondary">Coming Soon</Badge>
                                                        </div>
                                                    </Card.Body>
                                                </Card>

                                                <Card className="border">
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="fw-bold mb-1">Active Sessions</h6>
                                                                <p className="text-muted small mb-0">
                                                                    Manage devices where you're logged in
                                                                </p>
                                                            </div>
                                                            <Button variant="outline-primary" size="sm">
                                                                View Sessions
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Tab.Container>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Profile;
