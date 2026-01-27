import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, ProgressBar, Modal, Form } from 'react-bootstrap';
import businessApi from '../services/businessApi';

function ComplianceManager() {
    const [complianceData, setComplianceData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [useLocalData, setUseLocalData] = useState(false);
    const [businessSettings, setBusinessSettings] = useState({
        businessName: '',
        taxId: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Kenya'
        }
    });

    useEffect(() => {
        loadComplianceData();
        loadSettings();
    }, []);

    const loadComplianceData = async () => {
        try {
            setError(null);
            setUseLocalData(false);

            const response = await businessApi.getCompliance();
            setComplianceData(response.data || response);
        } catch (err) {
            console.error('Compliance API error:', err);
            // Fallback to local compliance check
            loadLocalComplianceData();
        }
    };

    const loadLocalComplianceData = () => {
        try {
            // Generate basic compliance status from local settings
            const savedSettings = localStorage.getItem('businessSettings');
            const localSettings = savedSettings ? JSON.parse(savedSettings) : {};

            const complianceStatus = {
                taxRegistration: {
                    status: localSettings.taxId ? 'compliant' : 'non_compliant',
                    message: localSettings.taxId ? 'Tax ID registered' : 'Tax ID required for KRA compliance',
                    actionRequired: !localSettings.taxId
                },
                vatRegistration: {
                    status: 'pending',
                    message: 'VAT registration status - verify with KRA',
                    actionRequired: false
                },
                recordKeeping: {
                    status: 'compliant',
                    message: 'Financial records maintained in local storage',
                    actionRequired: false
                },
                filingStatus: {
                    status: 'pending',
                    message: 'Monthly VAT returns due - check KRA portal',
                    actionRequired: true,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }
            };

            setComplianceData({
                complianceStatus,
                overallCompliance: Object.values(complianceStatus).every(status => !status.actionRequired),
                nextActions: Object.entries(complianceStatus)
                    .filter(([_, status]) => status.actionRequired)
                    .map(([key, status]) => ({
                        requirement: key,
                        action: status.message,
                        dueDate: status.dueDate
                    }))
            });
            setUseLocalData(true);
        } catch (err) {
            setError('Failed to load compliance data');
            console.error('Local compliance error:', err);
        }
    };

    const loadSettings = async () => {
        try {
            const response = await businessApi.getSettings();
            const data = response.data || response;
            setSettings(data);
            setBusinessSettings({
                businessName: data.businessName || '',
                taxId: data.taxId || '',
                address: data.address || {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'Kenya'
                }
            });
        } catch (err) {
            console.error('Settings API error:', err);
            // Load from localStorage
            const savedSettings = localStorage.getItem('businessSettings');
            if (savedSettings) {
                const localSettings = JSON.parse(savedSettings);
                setSettings(localSettings);
                setBusinessSettings(localSettings);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async () => {
        try {
            await businessApi.updateSettings(businessSettings);
            setSettings(businessSettings);
            // Also save to localStorage for offline access
            localStorage.setItem('businessSettings', JSON.stringify(businessSettings));
            setShowSettingsModal(false);
            await loadComplianceData(); // Refresh compliance status
            alert('Business settings updated successfully!');
        } catch (err) {
            console.error('Update settings error:', err);
            // Save to localStorage even if API fails
            localStorage.setItem('businessSettings', JSON.stringify(businessSettings));
            setSettings(businessSettings);
            setShowSettingsModal(false);
            alert('Settings saved locally. Will sync when online.');
        }
    };

    const getComplianceColor = (status) => {
        switch (status) {
            case 'compliant': return 'success';
            case 'non_compliant': return 'danger';
            case 'pending': return 'warning';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading compliance data...</span>
                </div>
                <p className="mt-2">Loading compliance information...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-2">Compliance & Regulations</h4>
                    <p className="text-muted">KRA tax compliance and business regulation management</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={() => setShowSettingsModal(true)}>
                        ⚙️ Business Settings
                    </Button>
                    <Button variant="outline-info" onClick={loadComplianceData}>
                        🔄 Check Compliance
                    </Button>
                </div>
            </div>

            {useLocalData && (
                <Alert variant="info" className="mb-4">
                    <small>📱 Using offline compliance check. Connect to server for complete KRA verification.</small>
                </Alert>
            )}

            {/* Overall Compliance Status */}
            {complianceData && (
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className={`text-white ${complianceData.overallCompliance ? 'bg-success' : 'bg-warning'}`}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">
                                {complianceData.overallCompliance ? '✅' : '⚠️'} Compliance Status
                            </h6>
                            <Badge bg={complianceData.overallCompliance ? 'success' : 'warning'}>
                                {complianceData.overallCompliance ? 'Compliant' : 'Action Required'}
                            </Badge>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>Overall Compliance Score</span>
                                <span className="fw-bold">
                                    {complianceData.overallCompliance ? '100%' : '75%'}
                                </span>
                            </div>
                            <ProgressBar
                                now={complianceData.overallCompliance ? 100 : 75}
                                variant={complianceData.overallCompliance ? 'success' : 'warning'}
                            />
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Compliance Requirements */}
            {complianceData?.complianceStatus && (
                <Row className="mb-4">
                    {Object.entries(complianceData.complianceStatus).map(([key, status]) => (
                        <Col lg={6} key={key} className="mb-3">
                            <Card className={`border-0 shadow-sm h-100 ${status.actionRequired ? 'border-warning' : ''}`}>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </h6>
                                            <p className="text-muted small mb-0">{status.message}</p>
                                        </div>
                                        <Badge bg={getComplianceColor(status.status)}>
                                            {status.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>

                                    {status.actionRequired && (
                                        <Alert variant="warning" className="py-2">
                                            <small>
                                                <strong>Action Required:</strong> {status.message}
                                                {status.dueDate && (
                                                    <div className="mt-1">
                                                        <strong>Due:</strong> {new Date(status.dueDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </small>
                                        </Alert>
                                    )}

                                    <div className="mt-3">
                                        {key === 'taxRegistration' && !status.actionRequired && (
                                            <Button variant="outline-primary" size="sm">
                                                Update Tax ID
                                            </Button>
                                        )}
                                        {key === 'filingStatus' && status.actionRequired && (
                                            <Button variant="outline-warning" size="sm">
                                                File VAT Return
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Next Actions */}
            {complianceData?.nextActions && complianceData.nextActions.length > 0 && (
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-info text-white">
                        <h6 className="mb-0 fw-bold">📋 Next Actions Required</h6>
                    </Card.Header>
                    <Card.Body>
                        {complianceData.nextActions.map((action, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                <div>
                                    <strong>{action.requirement.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
                                    <br />
                                    <small className="text-muted">{action.action}</small>
                                </div>
                                <div className="text-end">
                                    {action.dueDate && (
                                        <small className="text-danger fw-bold">
                                            Due: {new Date(action.dueDate).toLocaleDateString()}
                                        </small>
                                    )}
                                    <br />
                                    <Button variant="outline-primary" size="sm" className="mt-1">
                                        Take Action
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </Card.Body>
                </Card>
            )}

            {/* Tax Information */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 pt-3">
                    <h6 className="fw-bold mb-0">🇰🇪 KRA Tax Information</h6>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <h6 className="fw-bold mb-3">Current Tax Rates</h6>
                            <div className="mb-2 d-flex justify-content-between">
                                <span>VAT Rate:</span>
                                <strong>16%</strong>
                            </div>
                            <div className="mb-2 d-flex justify-content-between">
                                <span>Corporate Tax Rate:</span>
                                <strong>30%</strong>
                            </div>
                            <div className="mb-2 d-flex justify-content-between">
                                <span>Withholding Tax:</span>
                                <strong>5-10%</strong>
                            </div>
                        </Col>
                        <Col md={6}>
                            <h6 className="fw-bold mb-3">Filing Deadlines</h6>
                            <div className="mb-2">
                                <Badge bg="info" className="me-2">Monthly</Badge>
                                VAT Returns: 20th of following month
                            </div>
                            <div className="mb-2">
                                <Badge bg="info" className="me-2">Quarterly</Badge>
                                PAYE Returns: End of quarter + 20 days
                            </div>
                            <div className="mb-2">
                                <Badge bg="info" className="me-2">Annually</Badge>
                                Corporate Tax: April 30th
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Business Settings Modal */}
            <Modal show={showSettingsModal} onHide={() => setShowSettingsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Business Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Business Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={businessSettings.businessName}
                                        onChange={(e) => setBusinessSettings({
                                            ...businessSettings,
                                            businessName: e.target.value
                                        })}
                                        placeholder="Enter business name"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tax ID (KRA PIN)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={businessSettings.taxId}
                                        onChange={(e) => setBusinessSettings({
                                            ...businessSettings,
                                            taxId: e.target.value
                                        })}
                                        placeholder="A123456789X"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <h6 className="fw-bold mb-3">Business Address</h6>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Street Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={businessSettings.address.street}
                                        onChange={(e) => setBusinessSettings({
                                            ...businessSettings,
                                            address: { ...businessSettings.address, street: e.target.value }
                                        })}
                                        placeholder="Street address"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={businessSettings.address.city}
                                        onChange={(e) => setBusinessSettings({
                                            ...businessSettings,
                                            address: { ...businessSettings.address, city: e.target.value }
                                        })}
                                        placeholder="City"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>State/County</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={businessSettings.address.state}
                                        onChange={(e) => setBusinessSettings({
                                            ...businessSettings,
                                            address: { ...businessSettings.address, state: e.target.value }
                                        })}
                                        placeholder="State/County"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>ZIP Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={businessSettings.address.zipCode}
                                        onChange={(e) => setBusinessSettings({
                                            ...businessSettings,
                                            address: { ...businessSettings.address, zipCode: e.target.value }
                                        })}
                                        placeholder="ZIP Code"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={updateSettings}>
                        Save Settings
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ComplianceManager;
