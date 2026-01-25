import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Tabs, Tab, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { validateLogin, validateRegistration, loginRateLimiter, registrationRateLimiter, isValidEmail } from '../utils/validation';

function AuthModal({ show, onHide }) {
    const { login, register } = useUser();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Password visibility toggles
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Register form state
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });

    // Reset forms when modal is hidden or tab changes
    useEffect(() => {
        if (!show) {
            setError('');
            setValidationErrors({});
            setLoginData({ email: '', password: '' });
            setRegisterData({
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                phoneNumber: ''
            });
            setShowLoginPassword(false);
            setShowRegisterPassword(false);
            setShowConfirmPassword(false);
        }
    }, [show]);

    // Real-time validation for registration form
    useEffect(() => {
        if (activeTab === 'register' && (registerData.email || registerData.password || registerData.confirmPassword)) {
            const validation = validateRegistration(registerData);
            setValidationErrors(validation.errors || {});
        }
    }, [registerData, activeTab]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        // Validate input
        const validation = validateLogin(loginData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }

        // Check rate limiting
        if (!loginRateLimiter.isAllowed(loginData.email)) {
            const remaining = loginRateLimiter.getRemainingAttempts(loginData.email);
            const message = `Too many login attempts. Please try again later. (${remaining} attempts remaining)`;
            setError(message);
            showError(message);
            return;
        }

        setLoading(true);

        try {
            const result = await login(loginData.email, loginData.password);

            if (result.success) {
                loginRateLimiter.reset(loginData.email);
                showSuccess('Login successful! Welcome back!');
                onHide();
                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 300);
            } else {
                const errorMsg = result.message || 'Login failed. Please check your credentials.';
                setError(errorMsg);
                showError(errorMsg);
            }
        } catch (err) {
            const errorMsg = 'An error occurred. Please try again.';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        // Validate input
        const validation = validateRegistration(registerData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }

        // Check rate limiting
        if (!registrationRateLimiter.isAllowed(registerData.email)) {
            const errorMsg = 'Too many registration attempts. Please try again later.';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        setLoading(true);

        try {
            // Prepare registration data
            const registrationData = {
                email: registerData.email.trim(),
                password: registerData.password,
                profile: {
                    firstName: registerData.firstName.trim(),
                    lastName: registerData.lastName.trim(),
                    ...(registerData.phoneNumber && registerData.phoneNumber.trim() && {
                        phoneNumber: registerData.phoneNumber.trim()
                    })
                }
            };

            console.log('Attempting registration with:', {
                email: registrationData.email,
                hasPassword: !!registrationData.password,
                profile: registrationData.profile
            });

            const result = await register(registrationData);

            if (result.success) {
                registrationRateLimiter.reset(registerData.email);
                showSuccess('Registration successful! Welcome to SkillBridge254!');

                // Reset form
                setRegisterData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: '',
                    phoneNumber: ''
                });

                setTimeout(() => {
                    onHide();
                }, 1000);
            } else {
                const errorMsg = result.message || 'Registration failed. Please try again.';
                setError(errorMsg);
                showError(errorMsg);
            }
        } catch (err) {
            // Error should be handled by register function, but add fallback
            const errorMsg = err.message || 'An error occurred during registration. Please check your connection and try again.';
            setError(errorMsg);
            showError(errorMsg);
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <span className="me-2">🎓</span>
                    Welcome to SkillBridge254
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                        <Alert.Heading className="h6">Error</Alert.Heading>
                        {error}
                    </Alert>
                )}

                <Tabs activeKey={activeTab} onSelect={(k) => {
                    setActiveTab(k);
                    setError('');
                    setValidationErrors({});
                }} className="mb-3">
                    <Tab eventKey="login" title={<><span className="me-1">🔐</span>Login</>}>
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={loginData.email}
                                    onChange={(e) => {
                                        setLoginData({ ...loginData, email: e.target.value });
                                        if (validationErrors.email) {
                                            setValidationErrors({ ...validationErrors, email: null });
                                        }
                                    }}
                                    isInvalid={!!validationErrors.email}
                                    isValid={loginData.email && isValidEmail(loginData.email) && !validationErrors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.email}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showLoginPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={loginData.password}
                                        onChange={(e) => {
                                            setLoginData({ ...loginData, password: e.target.value });
                                            if (validationErrors.password) {
                                                setValidationErrors({ ...validationErrors, password: null });
                                            }
                                        }}
                                        isInvalid={!!validationErrors.password}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        type="button"
                                    >
                                        {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.password}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <span className="me-2">🚀</span>
                                        Login
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <a
                                    href="/forgot-password"
                                    className="text-decoration-none small"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onHide();
                                        window.location.href = '/forgot-password';
                                    }}
                                >
                                    Forgot Password?
                                </a>
                            </div>
                        </Form>
                    </Tab>

                    <Tab eventKey="register" title={<><span className="me-1">📝</span>Register</>}>
                        <Form onSubmit={handleRegister}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="John"
                                            value={registerData.firstName}
                                            onChange={(e) => {
                                                setRegisterData({ ...registerData, firstName: e.target.value });
                                                if (validationErrors.firstName) {
                                                    setValidationErrors({ ...validationErrors, firstName: null });
                                                }
                                            }}
                                            isInvalid={!!validationErrors.firstName}
                                            isValid={registerData.firstName && registerData.firstName.length >= 2 && !validationErrors.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.firstName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Doe"
                                            value={registerData.lastName}
                                            onChange={(e) => {
                                                setRegisterData({ ...registerData, lastName: e.target.value });
                                                if (validationErrors.lastName) {
                                                    setValidationErrors({ ...validationErrors, lastName: null });
                                                }
                                            }}
                                            isInvalid={!!validationErrors.lastName}
                                            isValid={registerData.lastName && registerData.lastName.length >= 2 && !validationErrors.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.lastName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number (Optional)</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="0712345678 or +254712345678"
                                    value={registerData.phoneNumber}
                                    onChange={(e) => {
                                        setRegisterData({ ...registerData, phoneNumber: e.target.value });
                                        if (validationErrors.phoneNumber) {
                                            setValidationErrors({ ...validationErrors, phoneNumber: null });
                                        }
                                    }}
                                    isInvalid={!!validationErrors.phoneNumber}
                                    isValid={registerData.phoneNumber && !validationErrors.phoneNumber}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.phoneNumber}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Format: 0712345678 or +254712345678
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={registerData.email}
                                    onChange={(e) => {
                                        setRegisterData({ ...registerData, email: e.target.value });
                                        if (validationErrors.email) {
                                            setValidationErrors({ ...validationErrors, email: null });
                                        }
                                    }}
                                    isInvalid={!!validationErrors.email}
                                    isValid={registerData.email && isValidEmail(registerData.email) && !validationErrors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.email}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showRegisterPassword ? 'text' : 'password'}
                                        placeholder="At least 6 characters (8+ recommended)"
                                        value={registerData.password}
                                        onChange={(e) => {
                                            setRegisterData({ ...registerData, password: e.target.value });
                                            if (validationErrors.password) {
                                                setValidationErrors({ ...validationErrors, password: null });
                                            }
                                        }}
                                        isInvalid={!!validationErrors.password}
                                        isValid={registerData.password && !validationErrors.password && registerData.password.length >= 6}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                        type="button"
                                    >
                                        {showRegisterPassword ? '👁️' : '👁️‍🗨️'}
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.password}
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="valid">
                                        {registerData.password.length >= 8 ? 'Strong password!' : 'Password looks good!'}
                                    </Form.Control.Feedback>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Minimum 6 characters (8+ characters recommended for better security)
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Re-enter your password"
                                        value={registerData.confirmPassword}
                                        onChange={(e) => {
                                            setRegisterData({ ...registerData, confirmPassword: e.target.value });
                                            if (validationErrors.confirmPassword) {
                                                setValidationErrors({ ...validationErrors, confirmPassword: null });
                                            }
                                        }}
                                        isInvalid={!!validationErrors.confirmPassword}
                                        isValid={registerData.confirmPassword && registerData.password === registerData.confirmPassword && !validationErrors.confirmPassword}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        type="button"
                                    >
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.confirmPassword}
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="valid">
                                        Passwords match!
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>

                            <Alert variant="info" className="small mb-3">
                                <strong>📝 Note:</strong> By registering, you agree to use this platform for learning purposes.
                                All your data is secure and private.
                            </Alert>

                            <Button variant="success" type="submit" className="w-100" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <span className="me-2">✨</span>
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </Form>
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
}

export default AuthModal;
