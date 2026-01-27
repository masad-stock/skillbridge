import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Button, Badge, Alert, ProgressBar, Table, Form } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import businessApi from '../services/businessApi';

function InventoryForecast() {
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('30');
    const [useLocalData, setUseLocalData] = useState(false);

    useEffect(() => {
        loadForecastData();
    }, [period]);

    const loadForecastData = async () => {
        try {
            setLoading(true);
            setError(null);
            setUseLocalData(false);

            const response = await businessApi.getInventoryForecast(period);
            setForecastData(response.data);
        } catch (err) {
            console.error('Forecast API error:', err);
            // Fallback to localStorage data
            loadLocalStorageData();
        } finally {
            setLoading(false);
        }
    };

    const loadLocalStorageData = () => {
        try {
            const savedInventory = localStorage.getItem('businessInventory');
            const savedSales = localStorage.getItem('businessSales');

            if (savedInventory) {
                const inventory = JSON.parse(savedInventory);
                const sales = savedSales ? JSON.parse(savedSales) : [];

                // Calculate forecast from local data
                const daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - parseInt(period));

                const recentSales = sales.filter(s => new Date(s.saleDate) >= daysAgo);

                const inventoryForecast = inventory.map(item => {
                    // Find sales for this item
                    const itemSales = recentSales.filter(sale =>
                        sale.items?.some(si => si.itemId === item.id?.toString() || si.itemName === item.name)
                    );

                    const totalSold = itemSales.reduce((sum, sale) => {
                        const saleItem = sale.items?.find(si => si.itemId === item.id?.toString() || si.itemName === item.name);
                        return sum + (saleItem?.quantity || 0);
                    }, 0);

                    const avgDailySales = totalSold / Math.max(1, parseInt(period));
                    const daysToStockout = avgDailySales > 0 ? Math.round(item.quantity / avgDailySales) : 999;
                    const reorderPoint = avgDailySales * 7; // 7-day safety stock

                    return {
                        itemId: item.id,
                        itemName: item.name,
                        currentStock: item.quantity,
                        avgDailySales: Math.round(avgDailySales * 100) / 100,
                        daysToStockout,
                        recommendedReorder: Math.max(Math.round(reorderPoint - item.quantity), 0),
                        forecastAccuracy: itemSales.length > 10 ? 'High' : itemSales.length > 5 ? 'Medium' : 'Low',
                        reorderLevel: item.reorderLevel || 5,
                        category: item.category
                    };
                });

                // Calculate cash flow projection
                const monthlyRevenue = {};
                recentSales.forEach(sale => {
                    const month = new Date(sale.saleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (sale.total || 0);
                });

                const cashFlowProjection = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
                    month,
                    revenue,
                    expenses: 0,
                    netCashFlow: revenue
                }));

                setForecastData({
                    inventoryForecast,
                    cashFlowProjection,
                    recommendations: {
                        lowStockAlerts: inventoryForecast.filter(item => item.currentStock <= item.reorderLevel),
                        overstockedItems: inventoryForecast.filter(item => item.currentStock > 100)
                    }
                });
                setUseLocalData(true);
            } else {
                setError('No inventory data available. Add products to see forecasting.');
            }
        } catch (err) {
            setError('Failed to load forecast data');
            console.error('LocalStorage error:', err);
        }
    };

    const getStockStatusBadge = (item) => {
        if (item.currentStock === 0) {
            return <Badge bg="danger">Out of Stock</Badge>;
        } else if (item.daysToStockout <= 7) {
            return <Badge bg="danger">Critical</Badge>;
        } else if (item.daysToStockout <= 14) {
            return <Badge bg="warning">Low</Badge>;
        } else if (item.daysToStockout <= 30) {
            return <Badge bg="info">Moderate</Badge>;
        }
        return <Badge bg="success">Healthy</Badge>;
    };

    const getAccuracyBadge = (accuracy) => {
        switch (accuracy) {
            case 'High': return <Badge bg="success">High</Badge>;
            case 'Medium': return <Badge bg="warning">Medium</Badge>;
            default: return <Badge bg="secondary">Low</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading forecast data...</span>
                </div>
                <p className="mt-2">Analyzing inventory patterns...</p>
            </div>
        );
    }

    if (error && !forecastData) {
        return (
            <Alert variant="warning">
                <Alert.Heading>No Forecast Data Available</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-warning" onClick={loadForecastData}>
                    Retry
                </Button>
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-2">Inventory Forecasting</h4>
                    <p className="text-muted">AI-powered demand prediction and stock optimization</p>
                </div>
                <div className="d-flex gap-2">
                    <Form.Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </Form.Select>
                    <Button variant="outline-primary" onClick={loadForecastData}>
                        🔄 Refresh
                    </Button>
                </div>
            </div>

            {useLocalData && (
                <Alert variant="info" className="mb-4">
                    <small>📱 Using offline data for forecasting. Connect to server for more accurate predictions.</small>
                </Alert>
            )}

            {/* Summary Cards */}
            {forecastData && (
                <>
                    <Row className="mb-4">
                        <Col lg={3} md={6} className="mb-3">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted small mb-1">Total Products</p>
                                            <h3 className="fw-bold mb-0">
                                                {forecastData.inventoryForecast?.length || 0}
                                            </h3>
                                        </div>
                                        <div className="fs-2">📦</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6} className="mb-3">
                            <Card className="border-0 shadow-sm h-100 border-danger">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted small mb-1">Low Stock Alerts</p>
                                            <h3 className="fw-bold text-danger mb-0">
                                                {forecastData.recommendations?.lowStockAlerts?.length || 0}
                                            </h3>
                                        </div>
                                        <div className="fs-2">⚠️</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6} className="mb-3">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted small mb-1">Need Reorder</p>
                                            <h3 className="fw-bold text-warning mb-0">
                                                {forecastData.inventoryForecast?.filter(i => i.recommendedReorder > 0).length || 0}
                                            </h3>
                                        </div>
                                        <div className="fs-2">🔄</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6} className="mb-3">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted small mb-1">Healthy Stock</p>
                                            <h3 className="fw-bold text-success mb-0">
                                                {forecastData.inventoryForecast?.filter(i => i.daysToStockout > 30).length || 0}
                                            </h3>
                                        </div>
                                        <div className="fs-2">✅</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Low Stock Alerts */}
                    {forecastData.recommendations?.lowStockAlerts?.length > 0 && (
                        <Alert variant="danger" className="mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>🚨 Low Stock Alert:</strong> {forecastData.recommendations.lowStockAlerts.length} items need restocking
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Forecast Table */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-0 pt-3">
                            <h6 className="fw-bold mb-0">📊 Inventory Forecast Analysis</h6>
                        </Card.Header>
                        <Card.Body>
                            {forecastData.inventoryForecast?.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="fs-1 mb-3">📦</div>
                                    <h5 className="fw-bold mb-2">No Inventory Data</h5>
                                    <p className="text-muted mb-3">Add products to your inventory to see forecasting data</p>
                                </div>
                            ) : (
                                <Table responsive hover>
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Product</th>
                                            <th>Current Stock</th>
                                            <th>Avg Daily Sales</th>
                                            <th>Days to Stockout</th>
                                            <th>Reorder Qty</th>
                                            <th>Status</th>
                                            <th>Accuracy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forecastData.inventoryForecast?.map((item, index) => (
                                            <tr key={item.itemId || index}>
                                                <td>
                                                    <div className="fw-bold">{item.itemName}</div>
                                                    {item.category && (
                                                        <small className="text-muted">{item.category}</small>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={item.currentStock <= item.reorderLevel ? 'text-danger fw-bold' : ''}>
                                                        {item.currentStock}
                                                    </span>
                                                </td>
                                                <td>{item.avgDailySales}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={item.daysToStockout <= 7 ? 'text-danger fw-bold' : ''}>
                                                            {item.daysToStockout > 365 ? '365+' : item.daysToStockout} days
                                                        </span>
                                                        {item.daysToStockout <= 7 && <span>🔥</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    {item.recommendedReorder > 0 ? (
                                                        <Badge bg="warning">{item.recommendedReorder} units</Badge>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>{getStockStatusBadge(item)}</td>
                                                <td>{getAccuracyBadge(item.forecastAccuracy)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Cash Flow Projection */}
                    {forecastData.cashFlowProjection?.length > 0 && (
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 pt-3">
                                <h6 className="fw-bold mb-0">💰 Revenue Trend</h6>
                            </Card.Header>
                            <Card.Body>
                                <Bar
                                    data={{
                                        labels: forecastData.cashFlowProjection.map(p => p.month),
                                        datasets: [{
                                            label: 'Revenue (KSh)',
                                            data: forecastData.cashFlowProjection.map(p => p.revenue),
                                            backgroundColor: 'rgba(75, 192, 192, 0.8)',
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false }
                                        }
                                    }}
                                />
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

export default InventoryForecast;
