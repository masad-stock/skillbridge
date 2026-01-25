import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { authAPI } from '../services/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await authAPI.forgotPassword(email);

            if (response.data.success) {
                setSuccess(true);
            } else {
                setError(response.data.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
                                    <FaEnvelope size={50} className="text-primary" />
                                </div>
                                <h2>Forgot Password?</h2>
                                <p className="text-muted">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </p>
                            </div>

                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            )}

                            {success ? (
                                <div>
                                    <Alert variant="success">
                                        <strong>Email Sent!</strong>
                                        <p className="mb-0 mt-2">
                                            If an account exists with this email, you'll receive password reset instructions shortly.
                                            Please check your inbox and spam folder.
                                        </p>
                                    </Alert>

                                    <div className="text-center mt-4">
                                        <p className="text-muted small">Didn't receive the email?</p>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => setSuccess(false)}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </Button>
                                </Form>
                            )}

                            <div className="text-center mt-4">
                                <Link to="/" className="text-decoration-none">
                                    <FaArrowLeft className="me-2" />
                                    Back to Login
                                </Link>
                            </div>

                            <div className="mt-4 p-3 bg-light rounded">
                                <p className="small mb-0">
                                    <strong>Security Note:</strong> For your security, we don't reveal whether an account exists with the provided email.
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
}

export default ForgotPassword;
