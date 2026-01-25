import { useState } from 'react';
import {
    Modal,
    Form,
    Button,
    Alert,
    InputGroup,
    ProgressBar,
    Row,
    Col
} from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone, FaUserTag } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

function CreateUserModal({ show, onHide, onUserCreated }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'user'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    // Password strength calculation
    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 15;
        if (/[^a-zA-Z\d]/.test(password)) strength += 10;
        return Math.min(strength, 100);
    };

    const passwordStrength = calculatePasswordStrength(formData.password);

    const getStrengthColor = () => {
        if (passwordStrength < 40) return 'danger';
        if (passwordStrength < 70) return 'warning';
        return 'success';
    };

    const getStrengthLabel = () => {
        if (passwordStrength < 40) return 'Weak';
        if (passwordStrength < 70) return 'Medium';
        return 'Strong';
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number';
        } else if (!/[^a-zA-Z\d]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one special character';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Name validation
        if (!formData.firstName || formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        if (!formData.lastName || formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        // Phone validation (optional but if provided, must be valid)
        if (formData.phoneNumber) {
            const phoneRegex = /^\+?[\d\s-()]+$/;
            if (!phoneRegex.test(formData.phoneNumber)) {
                newErrors.phoneNumber = 'Invalid phone number format';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await adminAPI.createUser({
                email: formData.email,
                password: formData.password,
                profile: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber || undefined
                },
                role: formData.role
            });

            // Reset form
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                role: 'user'
            });

            // Call success callback
            if (onUserCreated) {
                onUserCreated(response.data.data);
            }

            // Close modal
            onHide();

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            role: 'user'
        });
        setErrors({});
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaUser className="me-2" />
                    Create New User
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name *</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FaUser />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        isInvalid={!!errors.firstName}
                                        placeholder="Enter first name"
                                        disabled={loading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.firstName}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name *</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FaUser />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        isInvalid={!!errors.lastName}
                                        placeholder="Enter last name"
                                        disabled={loading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.lastName}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Email Address *</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaEnvelope />
                            </InputGroup.Text>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={!!errors.email}
                                placeholder="user@example.com"
                                disabled={loading}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number (Optional)</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaPhone />
                            </InputGroup.Text>
                            <Form.Control
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                isInvalid={!!errors.phoneNumber}
                                placeholder="+254 700 000 000"
                                disabled={loading}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.phoneNumber}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password *</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaLock />
                            </InputGroup.Text>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                isInvalid={!!errors.password}
                                placeholder="Enter password"
                                disabled={loading}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                        </InputGroup>
                        {formData.password && (
                            <div className="mt-2">
                                <div className="d-flex justify-content-between mb-1">
                                    <small>Password Strength:</small>
                                    <small className={`text-${getStrengthColor()}`}>
                                        {getStrengthLabel()}
                                    </small>
                                </div>
                                <ProgressBar
                                    now={passwordStrength}
                                    variant={getStrengthColor()}
                                    style={{ height: '5px' }}
                                />
                            </div>
                        )}
                        <Form.Text className="text-muted">
                            Must be at least 8 characters with uppercase, lowercase, number, and special character
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirm Password *</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaLock />
                            </InputGroup.Text>
                            <Form.Control
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                isInvalid={!!errors.confirmPassword}
                                placeholder="Confirm password"
                                disabled={loading}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                            <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>User Role *</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaUserTag />
                            </InputGroup.Text>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="user">User - Regular learner access</option>
                                <option value="instructor">Instructor - Can manage content</option>
                                <option value="admin">Admin - Full system access</option>
                            </Form.Select>
                        </InputGroup>
                        <Form.Text className="text-muted">
                            Select the appropriate role for this user
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creating...
                            </>
                        ) : (
                            'Create User'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default CreateUserModal;
