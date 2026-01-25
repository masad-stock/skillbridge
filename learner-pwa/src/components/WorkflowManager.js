import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Alert, ProgressBar } from 'react-bootstrap';

function WorkflowManager() {
    const [workflows, setWorkflows] = useState([
        {
            id: 1,
            name: 'Order Processing',
            description: 'Automate order fulfillment from receipt to delivery',
            status: 'active',
            steps: [
                { id: 1, name: 'Order Received', completed: true },
                { id: 2, name: 'Payment Verified', completed: true },
                { id: 3, name: 'Inventory Check', completed: false },
                { id: 4, name: 'Packing', completed: false },
                { id: 5, name: 'Shipping', completed: false }
            ]
        },
        {
            id: 2,
            name: 'Customer Onboarding',
            description: 'Streamline new customer registration and setup',
            status: 'draft',
            steps: [
                { id: 1, name: 'Registration', completed: false },
                { id: 2, name: 'Verification', completed: false },
                { id: 3, name: 'Welcome Email', completed: false },
                { id: 4, name: 'Account Setup', completed: false }
            ]
        }
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkflow, setNewWorkflow] = useState({
        name: '',
        description: '',
        steps: [{ name: '' }]
    });

    const createWorkflow = () => {
        if (newWorkflow.name && newWorkflow.description) {
            const workflow = {
                id: Date.now(),
                ...newWorkflow,
                status: 'draft',
                steps: newWorkflow.steps.filter(step => step.name.trim() !== '').map((step, index) => ({
                    id: index + 1,
                    name: step.name,
                    completed: false
                }))
            };
            setWorkflows([...workflows, workflow]);
            setNewWorkflow({ name: '', description: '', steps: [{ name: '' }] });
            setShowCreateModal(false);
        }
    };

    const addStep = () => {
        setNewWorkflow({
            ...newWorkflow,
            steps: [...newWorkflow.steps, { name: '' }]
        });
    };

    const updateStep = (index, name) => {
        const updatedSteps = [...newWorkflow.steps];
        updatedSteps[index].name = name;
        setNewWorkflow({
            ...newWorkflow,
            steps: updatedSteps
        });
    };

    const removeStep = (index) => {
        if (newWorkflow.steps.length > 1) {
            setNewWorkflow({
                ...newWorkflow,
                steps: newWorkflow.steps.filter((_, i) => i !== index)
            });
        }
    };

    const toggleWorkflowStatus = (id) => {
        setWorkflows(workflows.map(wf =>
            wf.id === id
                ? { ...wf, status: wf.status === 'active' ? 'inactive' : 'active' }
                : wf
        ));
    };

    const deleteWorkflow = (id) => {
        if (window.confirm('Are you sure you want to delete this workflow?')) {
            setWorkflows(workflows.filter(wf => wf.id !== id));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge bg="success">Active</Badge>;
            case 'inactive':
                return <Badge bg="secondary">Inactive</Badge>;
            case 'draft':
                return <Badge bg="warning">Draft</Badge>;
            default:
                return <Badge bg="light">Unknown</Badge>;
        }
    };

    return (
        <Container className="py-5">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold mb-2">
                                <span className="me-2">🔄</span>
                                Workflow Automation
                            </h2>
                            <p className="text-muted">
                                Streamline your business processes with automated workflows
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <span className="me-2">➕</span>
                            Create Workflow
                        </Button>
                    </div>
                </Col>
            </Row>

            {workflows.length === 0 ? (
                <Row>
                    <Col>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center py-5">
                                <div className="fs-1 mb-3">🔄</div>
                                <h5 className="fw-bold mb-2">No Workflows Yet</h5>
                                <p className="text-muted mb-3">
                                    Create your first automated workflow to streamline business processes
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    Create Your First Workflow
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Row>
                    {workflows.map(workflow => {
                        const completedSteps = workflow.steps.filter(step => step.completed).length;
                        const progress = workflow.steps.length > 0 ? (completedSteps / workflow.steps.length) * 100 : 0;

                        return (
                            <Col lg={6} key={workflow.id} className="mb-4">
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white border-0 pt-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h5 className="fw-bold mb-1">{workflow.name}</h5>
                                                <p className="text-muted small mb-2">{workflow.description}</p>
                                            </div>
                                            {getStatusBadge(workflow.status)}
                                        </div>
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <small className="text-muted">Progress</small>
                                                <small className="fw-bold">{completedSteps}/{workflow.steps.length} steps</small>
                                            </div>
                                            <ProgressBar
                                                now={progress}
                                                style={{ height: '6px' }}
                                                variant={progress === 100 ? 'success' : 'primary'}
                                            />
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <h6 className="fw-bold mb-3">Workflow Steps</h6>
                                            {workflow.steps.map((step, index) => (
                                                <div key={step.id} className="d-flex align-items-center mb-2">
                                                    <div className={`me-3 fs-5 ${step.completed ? 'text-success' : 'text-muted'}`}>
                                                        {step.completed ? '✅' : '⏳'}
                                                    </div>
                                                    <div className={`flex-grow-1 ${step.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                                                        {step.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => toggleWorkflowStatus(workflow.id)}
                                            >
                                                {workflow.status === 'active' ? 'Pause' : 'Activate'}
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => deleteWorkflow(workflow.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Create Workflow Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className="me-2">🔄</span>
                        Create New Workflow
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Workflow Name *</Form.Label>
                            <Form.Control
                                type="text"
                                value={newWorkflow.name}
                                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                                placeholder="e.g., Order Processing Workflow"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={newWorkflow.description}
                                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                                placeholder="Describe what this workflow automates"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Form.Label>Workflow Steps</Form.Label>
                                <Button variant="outline-primary" size="sm" onClick={addStep}>
                                    <span className="me-1">➕</span>
                                    Add Step
                                </Button>
                            </div>
                            {newWorkflow.steps.map((step, index) => (
                                <div key={index} className="d-flex gap-2 mb-2">
                                    <Form.Control
                                        type="text"
                                        value={step.name}
                                        onChange={(e) => updateStep(index, e.target.value)}
                                        placeholder={`Step ${index + 1}`}
                                    />
                                    {newWorkflow.steps.length > 1 && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => removeStep(index)}
                                        >
                                            🗑️
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={createWorkflow}
                        disabled={!newWorkflow.name || !newWorkflow.description}
                    >
                        <span className="me-2">💾</span>
                        Create Workflow
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default WorkflowManager;
