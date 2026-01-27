import axios from 'axios';
import { getCSRFToken, isTokenExpired } from '../utils/security';
import { sanitizeObject } from '../utils/validation';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

// Request timeout
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
    (config) => {
        // Add auth token - check both 'token' and 'authToken' for compatibility
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
            // Check if token is expired
            if (isTokenExpired(token)) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('token');
                localStorage.removeItem('cachedUser');
                window.location.href = '/';
                return Promise.reject(new Error('Token expired'));
            }
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing requests
        if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
            config.headers['X-CSRF-Token'] = getCSRFToken();
        }

        // Sanitize request data (but not FormData)
        if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            config.data = sanitizeObject(config.data);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors (no response from server)
        if (!error.response) {
            console.error('Network error:', error.message);
            const errorMessage = error.message && error.message.includes('timeout')
                ? 'Request timed out. Please check your connection and try again.'
                : 'Unable to connect to server. Please ensure the backend is running and check your connection.';

            return Promise.reject({
                response: {
                    data: {
                        message: errorMessage,
                        isNetworkError: true
                    }
                },
                message: errorMessage,
                isNetworkError: true
            });
        }

        const status = error.response?.status;
        const errorData = error.response?.data || {};

        // Handle specific status codes
        switch (status) {
            case 400:
                // Bad request - validation errors
                const message = errorData.message || 'Invalid request. Please check your input.';
                return Promise.reject({
                    ...error,
                    response: {
                        ...error.response,
                        data: {
                            ...errorData,
                            message: message
                        }
                    }
                });

            case 401:
                // Unauthorized - token expired or invalid
                localStorage.removeItem('authToken');
                localStorage.removeItem('cachedUser');
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
                break;

            case 403:
                // Forbidden - insufficient permissions
                return Promise.reject({
                    ...error,
                    response: {
                        ...error.response,
                        data: {
                            ...errorData,
                            message: errorData.message || 'Access denied. You do not have permission to perform this action.'
                        }
                    }
                });

            case 429:
                // Too many requests - rate limited
                return Promise.reject({
                    ...error,
                    response: {
                        ...error.response,
                        data: {
                            ...errorData,
                            message: errorData.message || 'Too many requests. Please try again later.'
                        }
                    }
                });

            case 500:
            case 502:
            case 503:
            case 504:
                // Server errors
                return Promise.reject({
                    ...error,
                    response: {
                        ...error.response,
                        data: {
                            ...errorData,
                            message: errorData.message || 'Server error. Please try again later.'
                        }
                    }
                });

            default:
                // Other errors - preserve the error message from server
                console.error('API error:', error.response?.data?.message || error.message);
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    updateProfile: (profileData) => api.put('/auth/update-profile', profileData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
    changePassword: (data) => api.post('/auth/change-password', data),
    uploadProfilePhoto: (formData) => {
        return api.post('/users/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            transformRequest: [(data) => data] // Prevent axios from transforming FormData
        });
    },
    deleteProfilePhoto: () => api.delete('/users/profile/photo')
};

// Assessment API
export const assessmentAPI = {
    startAssessment: (data) => api.post('/assessments/start', data),
    submitAssessment: (id, responses) => api.post(`/assessments/${id}/submit`, { responses }),
    getHistory: () => api.get('/assessments/history')
};

// Learning API
export const learningAPI = {
    getModules: (params) => api.get('/learning/modules', { params }),
    getPersonalizedPath: () => api.get('/learning/personalized-path'),
    enrollModule: (moduleId) => api.post(`/learning/enroll/${moduleId}`),
    updateProgress: (moduleId, data) => api.put(`/learning/progress/${moduleId}`, data),
    getMyProgress: () => api.get('/learning/my-progress')
};

// Business Tools API
export const businessAPI = {
    // Inventory
    getInventory: () => api.get('/business/inventory'),
    addInventoryItem: (data) => api.post('/business/inventory', data),
    updateInventoryItem: (id, data) => api.put(`/business/inventory/${id}`, data),
    deleteInventoryItem: (id) => api.delete(`/business/inventory/${id}`),

    // Customers
    getCustomers: () => api.get('/business/customers'),
    addCustomer: (data) => api.post('/business/customers', data),
    updateCustomer: (id, data) => api.put(`/business/customers/${id}`, data),

    // Sales
    getSales: (params) => api.get('/business/sales', { params }),
    recordSale: (data) => api.post('/business/sales', data),

    // Expenses
    getExpenses: (params) => api.get('/business/expenses', { params }),
    addExpense: (data) => api.post('/business/expenses', data),

    // Analytics
    getAnalytics: (period) => api.get('/business/analytics', { params: { period } })
};

// Analytics API
export const analyticsAPI = {
    getMyStats: () => api.get('/analytics/my-stats'),
    getPlatformStats: () => api.get('/analytics/platform-stats')
};

// User API
export const userAPI = {
    getUser: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data)
};

// Admin API
export const adminAPI = {
    // Dashboard
    getDashboard: () => api.get('/admin/dashboard'),

    // User Management
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    createUser: (data) => api.post('/admin/users', data),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Module Management
    getModules: () => api.get('/admin/modules'),
    createModule: (data) => api.post('/admin/modules', data),
    updateModule: (id, data) => api.put(`/admin/modules/${id}`, data),
    deleteModule: (id) => api.delete(`/admin/modules/${id}`),

    // Analytics
    getAnalytics: (params) => api.get('/admin/analytics', { params }),

    // Reports
    generateReport: (type, params) => api.get(`/admin/reports/${type}`, { params })
};

// Certificate API
export const certificateAPI = {
    generate: (moduleId) => api.post('/certificates/generate', { moduleId }),
    getMyCertificates: () => api.get('/certificates/my-certificates'),
    getCertificate: (id) => api.get(`/certificates/${id}`),
    verify: (code) => api.get(`/certificates/verify/${code}`),
    download: (id) => api.get(`/certificates/${id}/download`, { responseType: 'blob' })
};

// Search API
export const searchAPI = {
    searchModules: (query, filters) => api.get('/search/modules', { params: { q: query, ...filters } }),
    searchUsers: (query, filters) => api.get('/search/users', { params: { q: query, ...filters } }),
    searchCertificates: (query, filters) => api.get('/search/certificates', { params: { q: query, ...filters } }),
    globalSearch: (query, limit) => api.get('/search/global', { params: { q: query, limit } }),
    getSuggestions: (query, type, limit) => api.get('/search/suggestions', { params: { q: query, type, limit } }),
    getPopular: (limit) => api.get('/search/popular', { params: { limit } }),
    getFilters: () => api.get('/search/filters')
};

// Payment API
export const paymentAPI = {
    createPayment: (data) => api.post('/payments', data),
    getMyPayments: (params) => api.get('/payments/my-payments', { params }),
    getPayment: (transactionId) => api.get(`/payments/${transactionId}`),
    confirmPayment: (transactionId, data) => api.post(`/payments/${transactionId}/confirm`, data),
    cancelPayment: (transactionId) => api.post(`/payments/${transactionId}/cancel`),
    // Admin
    getAllPayments: (params) => api.get('/payments', { params }),
    getPaymentStats: (params) => api.get('/payments/stats', { params }),
    refundPayment: (transactionId, data) => api.post(`/payments/${transactionId}/refund`, data)
};

// Upload API
export const uploadAPI = {
    uploadModuleFiles: (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        return api.post('/upload/module-files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    deleteModuleFile: (filename) => api.delete(`/upload/module-files/${filename}`),
    getFileInfo: (filename) => api.get(`/upload/module-files/${filename}`)
};

export default api;
