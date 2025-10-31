import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useUser } from '../context/UserContext';

function Profile() {
    const { user, isAuthenticated, dispatch } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Form states
    const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
        name: '',
        phone: '',
        email: '',
        age: '',
        gender: '',
        education: '',
        location: '',
        businessType: '',
        password: '',
        confirmPassword: ''
    });
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        age: user?.age || '',
        gender: user?.gender || '',
        education: user?.education || '',
        location: user?.location || '',
        businessType: user?.businessType || ''
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                age: user.age || '',
                gender: user.gender || '',
                education: user.education || '',
                location: user.location || '',
                businessType: user.businessType || ''
            });
        }
    }, [user]);

    const showMessage = (text, type = 'info') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleLogin = (e) => {
        e.preventDefault();

        if (!loginForm.phone || !loginForm.password) {
            showMessage('Please fill in all fields', 'danger');
            return;
        }

        // Simulate login (in real app, this would call an API)
        const userData = {
            id: Date.now(),
            name: 'SkillBridge254 User',
            phone: loginForm.phone,
            email: '',
            joinedAt: new Date().toISOString()
        };

        dispatch({ type: 'SET_USER', payload: userData });
        setShowLoginModal(false);
        showMessage('Login successful!', 'success');
    };

    const handleRegister = (e) => {
        e.preventDefault();

        // Validation
        if (!registerForm.name || !registerForm.phone || !registerForm.password) {
            showMessage('Please fill in all required fields', 'danger');
            return;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            showMessage('Passwords do not match', 'danger');
            return;
        }

        if (registerForm.phone.length < 10) {
            showMessage('Invalid phone number', 'danger');
            return;
        }

        // Create user account
        const userData = {
            id: Date.now(),
            ...registerForm,
            joinedAt: new Date().toISOString()
        };

        delete userData.password;
        delete userData.confirmPassword;

        dispatch({ type: 'SET_USER', payload: userData });
        setShowLoginModal(false);
        showMessage('Account created successfully!', 'success');
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();

        if (!profileForm.name || !profileForm.phone) {
            showMessage('Name and phone number are required', 'danger');
            return;
        }

        const updatedUser = { ...user, ...profileForm };
        dispatch({ type: 'SET_USER', payload: updatedUser });
        setIsEditing(false);
        showMessage('Profile updated successfully!', 'success');
    };

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        setShowLoginModal(true);
        showMessage('Logged out successfully', 'info');
    };

    const educationLevels = [
        'No formal education',
        'Primary school',
        'Secondary school',
        'Technical college',
        'University',
        'Masters degree',
        'Other'
    ];

    const businessTypes = [
        'Agriculture',
        'Small Business',
        'Services',
        'Management',
        'Technology',
        'Education',
        'Healthcare',
        'Transportation',
        'Other'
    ];

    if (!isAuthenticated) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={6}>
                        <Card className="border-0 shadow-lg">
                            <Card.Header className="bg-primary text-white text-center py-4">
                                <h3 className="mb-0">
                                    <span className="me-2">🎓</span>
                                    SkillBridge254
                                </h3>
                            </Card.Header>
                            <Card.Body className="p-5">
                                {message && (
                                    <Alert variant={messageType} className="mb-4">
                                        {message}
                                    </Alert>
                                )}

                                <div className="text-center mb-4">
                                    <Button
                                        variant={isLogin ? 'primary' : 'outline-primary'}
                                        className="me-2"
                                        onClick={() => setIsLogin(true)}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant={!isLogin ? 'primary' : 'outline-primary'}
                                        onClick={() => setIsLogin(false)}
                                    >
                                        Register
                                    </Button>
                                </div>

                                {isLogin ? (
                                    <Form onSubmit={handleLogin}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone Number</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                value={loginForm.phone}
                                                onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                                                placeholder="0700000000"
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                                placeholder="Enter your password"
                                                required
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" className="w-100" size="lg">
                                            <span className="me-2">🚀</span>
                                            Login
                                        </Button>
                                    </Form>
                                ) : (
                                    <Form onSubmit={handleRegister}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Full Name *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={registerForm.name}
                                                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                                                        placeholder="Your full name"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Phone Number *</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        value={registerForm.phone}
                                                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                                                        placeholder="0700000000"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={registerForm.email}
                                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                                placeholder="email@example.com"
                                            />
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Age</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={registerForm.age}
                                                        onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                                                        placeholder="25"
                                                        min="18"
                                                        max="65"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Gender</Form.Label>
                                                    <Form.Select
                                                        value={registerForm.gender}
                                                        onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                                                    >
                                                        <option value="">Select gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Education Level</Form.Label>
                                                    <Form.Select
                                                        value={registerForm.education}
                                                        onChange={(e) => setRegisterForm({ ...registerForm, education: e.target.value })}
                                                    >
                                                        <option value="">Select level</option>
                                                        {educationLevels.map(level => (
                                                            <option key={level} value={level}>{level}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Location</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={registerForm.location}
                                                        onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                                                        placeholder="Kiharu, Murang'a"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Business/Work Type</Form.Label>
                                            <Form.Select
                                                value={registerForm.businessType}
                                                onChange={(e) => setRegisterForm({ ...registerForm, businessType: e.target.value })}
                                            >
                                                <option value="">Select type</option>
                                                {businessTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Password *</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={registerForm.password}
                                                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                                        placeholder="Create password"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Confirm Password *</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={registerForm.confirmPassword}
                                                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                                        placeholder="Repeat password"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Button type="submit" variant="success" className="w-100" size="lg">
                                            <span className="me-2">✨</span>
                                            Create Account
                                        </Button>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col lg={8} className="mx-auto">
                    {message && (
                        <Alert variant={messageType} className="mb-4">
                            {message}
                        </Alert>
                    )}

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
                                            Edit
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                            <span className="me-2">❌</span>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-4">
                            {!isEditing ? (
                                <div>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <strong>Name:</strong>
                                            <div className="text-muted">{user.name || 'Not provided'}</div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Phone:</strong>
                                            <div className="text-muted">{user.phone || 'Not provided'}</div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Email:</strong>
                                            <div className="text-muted">{user.email || 'Not provided'}</div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Age:</strong>
                                            <div className="text-muted">{user.age || 'Not provided'}</div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Gender:</strong>
                                            <div className="text-muted">{user.gender || 'Not provided'}</div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Education:</strong>
                                            <div className="text-muted">{user.education || 'Not provided'}</div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Location:</strong>
                                            <div className="text-muted">{user.location || 'Not provided'}</div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong>Business/Work:</strong>
                                            <div className="text-muted">{user.businessType || 'Not provided'}</div>
                                        </Col>
                                    </Row>

                                    <hr className="my-4" />

                                    <div className="mb-3">
                                        <strong>Date Joined:</strong>
                                        <div className="text-muted">
                                            {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Unknown'}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <strong>Account Status:</strong>
                                        <div>
                                            <Badge bg="success" className="me-2">Active</Badge>
                                            <Badge bg="info">Regular User</Badge>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Form onSubmit={handleProfileUpdate}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Full Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Phone Number *</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Age</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={profileForm.age}
                                                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                                                    min="18"
                                                    max="65"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Gender</Form.Label>
                                                <Form.Select
                                                    value={profileForm.gender}
                                                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Education Level</Form.Label>
                                                <Form.Select
                                                    value={profileForm.education}
                                                    onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                                                >
                                                    <option value="">Select level</option>
                                                    {educationLevels.map(level => (
                                                        <option key={level} value={level}>{level}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Location</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={profileForm.location}
                                                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Business/Work Type</Form.Label>
                                        <Form.Select
                                            value={profileForm.businessType}
                                            onChange={(e) => setProfileForm({ ...profileForm, businessType: e.target.value })}
                                        >
                                            <option value="">Select type</option>
                                            {businessTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <div className="d-flex gap-3">
                                        <Button type="submit" variant="success">
                                            <span className="me-2">💾</span>
                                            Save Changes
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>

                        <Card.Footer className="bg-light border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    Taarifa zako ni salama na hazitashirikiwa na mtu mwingine
                                </small>
                                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                                    <span className="me-2">🚪</span>
                                    Logout
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Profile;