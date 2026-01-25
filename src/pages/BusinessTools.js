import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Alert, Badge } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useOffline } from '../context/OfflineContext';

function BusinessTools() {
    // eslint-disable-next-line no-unused-vars
    const { user } = useUser();
    const isOnline = useOffline();
    const [activeTab, setActiveTab] = useState('inventory');
    const [showAddModal, setShowAddModal] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0, category: '' });
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', location: '' });

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedInventory = localStorage.getItem('businessInventory');
        const savedCustomers = localStorage.getItem('businessCustomers');
        const savedTransactions = localStorage.getItem('businessTransactions');

        if (savedInventory) setInventory(JSON.parse(savedInventory));
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    }, []);

    // Save data to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('businessInventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('businessCustomers', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('businessTransactions', JSON.stringify(transactions));
    }, [transactions]);

    const addInventoryItem = () => {
        if (newItem.name && newItem.quantity >= 0 && newItem.price >= 0) {
            const item = {
                id: Date.now(),
                ...newItem,
                dateAdded: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            setInventory([...inventory, item]);
            setNewItem({ name: '', quantity: 0, price: 0, category: '' });
            setShowAddModal(false);
        }
    };

    const addCustomer = () => {
        if (newCustomer.name && newCustomer.phone) {
            const customer = {
                id: Date.now(),
                ...newCustomer,
                dateAdded: new Date().toISOString(),
                totalPurchases: 0,
                lastPurchase: null
            };
            setCustomers([...customers, customer]);
            setNewCustomer({ name: '', phone: '', email: '', location: '' });
            setShowAddModal(false);
        }
    };

    const updateInventoryQuantity = (id, newQuantity) => {
        setInventory(inventory.map(item =>
            item.id === id
                ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() }
                : item
        ));
    };

    const deleteInventoryItem = (id) => {
        setInventory(inventory.filter(item => item.id !== id));
    };

    const deleteCustomer = (id) => {
        setCustomers(customers.filter(customer => customer.id !== id));
    };

    const calculateTotalValue = () => {
        return inventory.reduce((total, item) => total + (item.quantity * item.price), 0);
    };

    const getLowStockItems = () => {
        return inventory.filter(item => item.quantity < 5);
    };

    const getTopCategories = () => {
        const categories = {};
        inventory.forEach(item => {
            if (item.category) {
                categories[item.category] = (categories[item.category] || 0) + item.quantity;
            }
        });
        return Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5);
    };

    const tools = [
        {
            id: 'inventory',
            title: 'Inventory Management',
            icon: '📦',
            description: 'Track your products, prices, and quantities',
            color: 'primary'
        },
        {
            id: 'customers',
            title: 'Customer Management',
            icon: '👥',
            description: 'Store and manage customer information',
            color: 'success'
        },
        {
            id: 'payments',
            title: 'Payment System',
            icon: '💳',
            description: 'Record payments and business transactions',
            color: 'info'
        },
        {
            id: 'reports',
            title: 'Business Reports',
            icon: '📊',
            description: 'View your business statistics and insights',
            color: 'warning'
        }
    ];

    const renderInventoryTab = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-2">Inventory Management</h4>
                    <p className="text-muted">Track your products and their prices</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        setActiveTab('inventory');
                        setShowAddModal(true);
                    }}
                >
                    <span className="me-2">➕</span>
                    Add Product
                </Button>
            </div>

            {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 bg-primary text-white">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">📦</div>
                            <h5 className="mb-1">{inventory.length}</h5>
                            <small>Total Products</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-success text-white">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">💰</div>
                            <h5 className="mb-1">KSh {calculateTotalValue().toLocaleString()}</h5>
                            <small>Total Value</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-warning text-white">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">⚠️</div>
                            <h5 className="mb-1">{getLowStockItems().length}</h5>
                            <small>Low Stock Items</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 bg-info text-white">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">📈</div>
                            <h5 className="mb-1">{getTopCategories().length}</h5>
                            <small>Product Categories</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Low Stock Alert */}
            {getLowStockItems().length > 0 && (
                <Alert variant="warning" className="mb-4">
                    <Alert.Heading className="h6">
                        <span className="me-2">⚠️</span>
                        Low Stock Alert
                    </Alert.Heading>
                    <p className="mb-0">
                        You have {getLowStockItems().length} products with low stock (below 5 units).
                        Consider restocking soon.
                    </p>
                </Alert>
            )}

            {/* Inventory Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    {inventory.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="fs-1 mb-3">📦</div>
                            <h5 className="fw-bold mb-2">No Products Yet</h5>
                            <p className="text-muted mb-3">Start by adding your first product</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setActiveTab('inventory');
                                    setShowAddModal(true);
                                }}
                            >
                                Add First Product
                            </Button>
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Price (KSh)</th>
                                    <th>Value (KSh)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map(item => (
                                    <tr key={item.id}>
                                        <td className="fw-bold">{item.name}</td>
                                        <td>
                                            {item.category && (
                                                <Badge bg="secondary">{item.category}</Badge>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    style={{ width: '80px' }}
                                                    value={item.quantity}
                                                    onChange={(e) => updateInventoryQuantity(item.id, parseInt(e.target.value) || 0)}
                                                    className="me-2"
                                                />
                                                {item.quantity < 5 && (
                                                    <Badge bg="warning" className="ms-1">Low</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td>{item.price.toLocaleString()}</td>
                                        <td className="fw-bold">{(item.quantity * item.price).toLocaleString()}</td>
                                        <td>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => deleteInventoryItem(item.id)}
                                            >
                                                🗑️
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderCustomersTab = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-2">Customer Management</h4>
                    <p className="text-muted">Store and manage your customer information</p>
                </div>
                <Button
                    variant="success"
                    onClick={() => {
                        setActiveTab('customers');
                        setShowAddModal(true);
                    }}
                >
                    <span className="me-2">➕</span>
                    Add Customer
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    {customers.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="fs-1 mb-3">👥</div>
                            <h5 className="fw-bold mb-2">No Customers Yet</h5>
                            <p className="text-muted mb-3">Start by adding your first customer</p>
                            <Button
                                variant="success"
                                onClick={() => {
                                    setActiveTab('customers');
                                    setShowAddModal(true);
                                }}
                            >
                                Add First Customer
                            </Button>
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Date Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer.id}>
                                        <td className="fw-bold">{customer.name}</td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.email || '-'}</td>
                                        <td>{customer.location || '-'}</td>
                                        <td>{new Date(customer.dateAdded).toLocaleDateString()}</td>
                                        <td>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => deleteCustomer(customer.id)}
                                            >
                                                🗑️
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderPaymentsTab = () => (
        <div>
            <div className="text-center py-5">
                <div className="fs-1 mb-3">💳</div>
                <h4 className="fw-bold mb-2">Payment System</h4>
                <p className="text-muted mb-3">
                    This feature is coming soon. You'll be able to record M-Pesa and other digital payments.
                </p>
                <Badge bg="info" className="px-3 py-2">
                    Coming Soon
                </Badge>
            </div>
        </div>
    );

    const renderReportsTab = () => (
        <div>
            <h4 className="fw-bold mb-4">Business Reports</h4>

            <Row>
                <Col md={6} className="mb-4">
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0 fw-bold">
                                <span className="me-2">📊</span>
                                Product Statistics
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            {getTopCategories().length > 0 ? (
                                <div>
                                    <h6 className="mb-3">Top Product Categories:</h6>
                                    {getTopCategories().map(([category, count], index) => (
                                        <div key={category} className="d-flex justify-content-between align-items-center mb-2">
                                            <span>{category}</span>
                                            <Badge bg="primary">{count} items</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No statistics to display</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} className="mb-4">
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0 fw-bold">
                                <span className="me-2">💰</span>
                                Financial Summary
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Total Inventory Value:</span>
                                    <span className="fw-bold text-success">
                                        KSh {calculateTotalValue().toLocaleString()}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Total Customers:</span>
                                    <span className="fw-bold">{customers.length}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Low Stock Items:</span>
                                    <span className="fw-bold text-warning">{getLowStockItems().length}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    return (
        <Container className="py-5">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold mb-2">
                                <span className="me-2">💼</span>
                                Business Tools
                            </h2>
                            <p className="text-muted">
                                Modern tools to manage your business operations
                            </p>
                        </div>
                        {!isOnline && (
                            <Alert variant="info" className="mb-0">
                                <small>📱 Working offline</small>
                            </Alert>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Tool Navigation */}
            <Row className="mb-4">
                {tools.map(tool => (
                    <Col lg={3} md={6} key={tool.id} className="mb-3">
                        <Card
                            className={`border-0 shadow-sm cursor-pointer hover-lift ${activeTab === tool.id ? 'border-primary' : ''}`}
                            onClick={() => setActiveTab(tool.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card.Body className="text-center p-4">
                                <div className="fs-2 mb-2">{tool.icon}</div>
                                <h6 className="fw-bold mb-2">{tool.title}</h6>
                                <p className="text-muted small mb-0">{tool.description}</p>
                                {activeTab === tool.id && (
                                    <Badge bg={tool.color} className="mt-2">Active</Badge>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Tool Content */}
            <div>
                {activeTab === 'inventory' && renderInventoryTab()}
                {activeTab === 'customers' && renderCustomersTab()}
                {activeTab === 'payments' && renderPaymentsTab()}
                {activeTab === 'reports' && renderReportsTab()}
            </div>

            {/* Add Item/Customer Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {activeTab === 'inventory' ? (
                            <>
                                <span className="me-2">📦</span>
                                Add New Product
                            </>
                        ) : (
                            <>
                                <span className="me-2">👤</span>
                                Add New Customer
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {activeTab === 'inventory' ? (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Product Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="e.g., Maize"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Product Category</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    placeholder="e.g., Food"
                                />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Quantity *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={newItem.quantity}
                                            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Price (KSh) *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    ) : (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    placeholder="Full customer name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    placeholder="0700000000"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    placeholder="customer@example.com"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCustomer.location}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                                    placeholder="e.g., Kiharu, Murang'a"
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={activeTab === 'inventory' ? addInventoryItem : addCustomer}
                    >
                        <span className="me-2">💾</span>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default BusinessTools;