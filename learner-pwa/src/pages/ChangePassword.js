import { useState } from 'react';
import { Container, Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { FaLock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { authAPI } from '../services/api';

function ChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
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

        if (name === 'newPassword') {
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
        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('New password must be different from current password');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await authAPI.changePassword(formData);

            if (response.data.success) {
                setSuccess(true);
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setPasswordStrength(0);

                // Clear success message after 5 seconds
                setTimeout(() => setSuccess(false), 5000);
            } else {
                setError(response.data.message || 'Failed to change password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">
                                <FaLock className="me-2" />
                                Change Password
                            </h4>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                    <FaTimesCircle className="me-2" />
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
                                    <FaCheckCircle className="me-2" />
                                    Password changed successfully!
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="currentPassword"
                                        placeholder="Enter current password"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <hr className="my-4" />

                                <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        placeholder="Enter new password"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    {formData.newPassword && (
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
                                    <Form.Label>Confirm New Password</Form.Label>
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
                                            {formData.newPassword === formData.confirmPassword ? (
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

                                <div className="mb-4 p-3 bg-light rounded">
                                    <p className="small mb-2"><strong>Password Requirements:</strong></p>
                                    <ul className="small mb-0">
                                        <li className={formData.newPassword.length >= 6 ? 'text-success' : ''}>
                                            At least 6 characters
                                        </li>
                                        <li className={/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? 'text-success' : ''}>
                                            Mix of uppercase and lowercase (recommended)
                                        </li>
                                        <li className={/\d/.test(formData.newPassword) ? 'text-success' : ''}>
                                            At least one number (recommended)
                                        </li>
                                        <li className={formData.currentPassword !== formData.newPassword && formData.newPassword ? 'text-success' : ''}>
                                            Different from current password
                                        </li>
                                    </ul>
                                </div>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading || formData.newPassword !== formData.confirmPassword}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Changing Password...
                                            </>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => window.history.back()}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Form>

                            <div className="mt-4 p-3 bg-info bg-opacity-10 rounded">
                                <p className="small mb-0">
                                    <strong>💡 Security Tip:</strong> Use a strong, unique password that you don't use on other websites. Consider using a password manager to keep track of your passwords securely.
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
}

export default ChangePassword;
