import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert, Pagination } from 'react-bootstrap';
import { FaReceipt, FaDownload, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';
import { paymentAPI } from '../services/api';

function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadPayments();
    }, [page]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const response = await paymentAPI.getMyPayments({ page, limit: 10 });
            setPayments(response.data.data);
            setPagination(response.data.pagination);
        } catch (err) {
            setError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            completed: 'success',
            pending: 'warning',
            failed: 'danger',
            refunded: 'info',
            cancelled: 'secondary'
        };

        const icons = {
            completed: <FaCheckCircle />,
            pending: <FaClock />,
            failed: <FaTimes />,
            refunded: <FaReceipt />,
            cancelled: <FaTimes />
        };

        return (
            <Badge bg={variants[status] || 'secondary'}>
                {icons[status]} {status}
            </Badge>
        );
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(amount);
    };

    if (loading && payments.length === 0) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading payment history...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Card>
                <Card.Header>
                    <h4 className="mb-0">
                        <FaReceipt className="me-2" />
                        Payment History
                    </h4>
                </Card.Header>
                <Card.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {payments.length === 0 ? (
                        <div className="text-center py-5">
                            <FaReceipt size={50} className="text-muted mb-3" />
                            <h5>No Payment History</h5>
                            <p className="text-muted">You haven't made any payments yet</p>
                        </div>
                    ) : (
                        <>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Transaction ID</th>
                                        <th>Item</th>
                                        <th>Amount</th>
                                        <th>Provider</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment._id}>
                                            <td>
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <code className="small">{payment.transactionId}</code>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong>{payment.item.name}</strong>
                                                    <br />
                                                    <small className="text-muted">{payment.item.type}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
                                            </td>
                                            <td>
                                                <Badge bg="secondary">{payment.provider}</Badge>
                                            </td>
                                            <td>{getStatusBadge(payment.status)}</td>
                                            <td>
                                                {payment.receipt?.url && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        href={payment.receipt.url}
                                                        target="_blank"
                                                    >
                                                        <FaDownload /> Receipt
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {pagination && pagination.pages > 1 && (
                                <div className="d-flex justify-content-center mt-3">
                                    <Pagination>
                                        <Pagination.Prev
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                        />
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <Pagination.Item
                                                key={i + 1}
                                                active={i + 1 === page}
                                                onClick={() => setPage(i + 1)}
                                            >
                                                {i + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === pagination.pages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default PaymentHistory;
