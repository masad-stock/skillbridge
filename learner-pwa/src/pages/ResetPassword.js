import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { FaLock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { useUser } from '../context/UserContext';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login } = useUser();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
        return Math.min(strength, 100);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await authAPI.resetPassword(token, {
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            if (response.data.success) {
                setSuccess(true);

                // Auto-login user
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                    login(response.data.user);

                    // Redirect after 2 seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                }
            } else {
                setError(response.data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <div className="mb-3">
                                    <FaLock size={50} className="text-primary" />
                                </div>
                                <h2>Reset Password</h2>
                                <p className="text-muted">
                                    Enter your new password below
                                </p>
                            </div>

                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                    <FaTimesCircle className="me-2" />
                                    {error}
                                </Alert>
                            )}

                            {success ? (
                                <div>
                                    <Alert variant="success" className="text-center">
                                        <FaCheckCircle size={50} className="mb-3" />
                                        <h4>Password Reset Successful!</h4>
                                        <p className="mb-0">
                                            Your password has been reset. Redirecting to dashboard...
                                        </p>
                                    </Alert>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>New Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            placeholder="Enter new password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                        {formData.password && (
                                            <div className="mt-2">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <small className="text-muted">Password Strength:</small>
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
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                        {formData.confirmPassword && (
                                            <div className="mt-1">
                                                {formData.password === formData.confirmPassword ? (
                                                    <small className="text-success">
                                                        <FaCheckCircle className="me-1" />
                                                        Passwords match
                                                    </small>
                                                ) : (
                                                    <small className="text-danger">
                                                        <FaTimesCircle className="me-1" />
                                                        Passwords don't match
                                                    </small>
                                                )}
                                            </div>
                                        )}
                                    </Form.Group>

                                    <div className="mb-3 p-3 bg-light rounded">
                                        <p className="small mb-2"><strong>Password Requirements:</strong></p>
                                        <ul className="small mb-0">
                                            <li className={formData.password.length >= 6 ? 'text-success' : ''}>
                                                At least 6 characters
                                            </li>
                                            <li className={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'text-success' : ''}>
                                                Mix of uppercase and lowercase (recommended)
                                            </li>
                                            <li className={/\d/.test(formData.password) ? 'text-success' : ''}>
                                                At least one number (recommended)
                                            </li>
                                        </ul>
                                    </div>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100"
                                        disabled={loading || formData.password !== formData.confirmPassword}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Resetting...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </Button>
                                </Form>
                            )}

                            <div className="text-center mt-4">
                                <p className="text-muted small mb-0">
                                    Remember your password?{' '}
                                    <a href="/" className="text-decoration-none">
                                        Back to Login
                                    </a>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
}

export default ResetPassword;
