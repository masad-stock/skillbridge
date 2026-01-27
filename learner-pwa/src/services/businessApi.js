import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

class BusinessApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to include auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/profile';
                }
                return Promise.reject(error);
            }
        );
    }

    // ============ BUSINESS SETTINGS ============
    async getSettings() {
        const response = await this.client.get('/business/settings');
        return response.data;
    }

    async updateSettings(settings) {
        const response = await this.client.put('/business/settings', settings);
        return response.data;
    }

    // ============ SUPPLIER MANAGEMENT ============
    async getSuppliers() {
        const response = await this.client.get('/business/suppliers');
        return response.data;
    }

    async createSupplier(supplier) {
        const response = await this.client.post('/business/suppliers', supplier);
        return response.data;
    }

    async updateSupplier(id, supplier) {
        const response = await this.client.put(`/business/suppliers/${id}`, supplier);
        return response.data;
    }

    // ============ INVENTORY MANAGEMENT ============
    async getInventory(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await this.client.get(`/business/inventory?${queryString}`);
        return response.data;
    }

    async createInventoryItem(item) {
        const response = await this.client.post('/business/inventory', item);
        return response.data;
    }

    async updateInventoryItem(id, item) {
        const response = await this.client.put(`/business/inventory/${id}`, item);
        return response.data;
    }

    async deleteInventoryItem(id) {
        const response = await this.client.delete(`/business/inventory/${id}`);
        return response.data;
    }

    async bulkImportInventory(items) {
        const response = await this.client.post('/business/inventory/bulk', { items });
        return response.data;
    }

    // ============ CUSTOMER MANAGEMENT ============
    async getCustomers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await this.client.get(`/business/customers?${queryString}`);
        return response.data;
    }

    async createCustomer(customer) {
        const response = await this.client.post('/business/customers', customer);
        return response.data;
    }

    async updateCustomer(id, customer) {
        const response = await this.client.put(`/business/customers/${id}`, customer);
        return response.data;
    }

    // ============ SALES MANAGEMENT ============
    async getSales(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await this.client.get(`/business/sales?${queryString}`);
        return response.data;
    }

    async createSale(sale) {
        const response = await this.client.post('/business/sales', sale);
        return response.data;
    }

    async downloadInvoice(saleId) {
        const response = await this.client.get(`/business/sales/${saleId}/invoice`, {
            responseType: 'blob',
        });
        return response.data;
    }

    // ============ RETURNS MANAGEMENT ============
    async getReturns() {
        const response = await this.client.get('/business/returns');
        return response.data;
    }

    async createReturn(returnData) {
        const response = await this.client.post('/business/returns', returnData);
        return response.data;
    }

    // ============ EXPENSE TRACKING ============
    async getExpenses(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await this.client.get(`/business/expenses?${queryString}`);
        return response.data;
    }

    async createExpense(expense) {
        const response = await this.client.post('/business/expenses', expense);
        return response.data;
    }

    // ============ PAYMENT MANAGEMENT ============
    async getPayments() {
        const response = await this.client.get('/business/payments');
        return response.data;
    }

    async createPayment(payment) {
        const response = await this.client.post('/business/payments', payment);
        return response.data;
    }

    // ============ ANALYTICS ============
    async getAnalytics(period = 30) {
        const response = await this.client.get(`/business/analytics?period=${period}`);
        return response.data;
    }

    // ============ DATA EXPORT ============
    async exportData(type) {
        const response = await this.client.get(`/business/export/${type}`, {
            responseType: 'blob',
        });
        return response.data;
    }

    // ============ ACTIVITY LOG ============
    async getActivityLog(limit = 50) {
        const response = await this.client.get(`/business/activity?limit=${limit}`);
        return response.data;
    }

    async logActivity(activity) {
        const response = await this.client.post('/business/activity', activity);
        return response.data;
    }

    // ============ FINANCIAL REPORTS ============
    async getFinancialReports(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await this.client.get(`/business/reports/financial?${queryString}`);
        return response.data;
    }

    // ============ BUSINESS INTELLIGENCE ============
    async getBusinessIntelligence(period = 30) {
        const response = await this.client.get(`/business/analytics?period=${period}&type=overview`);
        return response.data;
    }

    // ============ COMPLIANCE ============
    async getCompliance() {
        const response = await this.client.get('/business/compliance');
        return response.data;
    }

    // ============ INVENTORY FORECASTING ============
    async getInventoryForecast(period = 30) {
        const response = await this.client.get(`/business/analytics?period=${period}&type=forecasting`);
        return response.data;
    }
}

// Create and export singleton instance
const businessApi = new BusinessApiService();
export default businessApi;
