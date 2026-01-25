import React, { createContext, useContext, useReducer, useEffect } from 'react';
import businessApi from '../services/businessApi';
import { useUser } from './UserContext';

// Initial state
const initialState = {
    // Data states
    inventory: { data: [], loading: false, error: null, lowStockCount: 0 },
    customers: { data: [], loading: false, error: null, stats: {} },
    sales: { data: [], loading: false, error: null, totalRevenue: 0, outstanding: 0 },
    expenses: { data: [], loading: false, error: null, totalExpenses: 0 },
    suppliers: { data: [], loading: false, error: null },
    returns: { data: [], loading: false, error: null },
    payments: { data: [], loading: false, error: null },
    analytics: { data: null, loading: false, error: null },

    // UI states
    loading: false,
    error: null,
    offlineQueue: [],
    currentTab: 'dashboard',

    // Settings
    settings: null
};

// Action types
const ACTIONS = {
    // Loading states
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',

    // Data loading
    SET_INVENTORY: 'SET_INVENTORY',
    SET_CUSTOMERS: 'SET_CUSTOMERS',
    SET_SALES: 'SET_SALES',
    SET_EXPENSES: 'SET_EXPENSES',
    SET_SUPPLIERS: 'SET_SUPPLIERS',
    SET_RETURNS: 'SET_RETURNS',
    SET_PAYMENTS: 'SET_PAYMENTS',
    SET_ANALYTICS: 'SET_ANALYTICS',
    SET_SETTINGS: 'SET_SETTINGS',

    // CRUD operations
    ADD_INVENTORY_ITEM: 'ADD_INVENTORY_ITEM',
    UPDATE_INVENTORY_ITEM: 'UPDATE_INVENTORY_ITEM',
    DELETE_INVENTORY_ITEM: 'DELETE_INVENTORY_ITEM',

    ADD_CUSTOMER: 'ADD_CUSTOMER',
    UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',

    ADD_SALE: 'ADD_SALE',
    ADD_EXPENSE: 'ADD_EXPENSE',
    ADD_SUPPLIER: 'ADD_SUPPLIER',
    ADD_RETURN: 'ADD_RETURN',
    ADD_PAYMENT: 'ADD_PAYMENT',

    // Offline queue
    ADD_TO_OFFLINE_QUEUE: 'ADD_TO_OFFLINE_QUEUE',
    CLEAR_OFFLINE_QUEUE: 'CLEAR_OFFLINE_QUEUE',
    PROCESS_OFFLINE_QUEUE: 'PROCESS_OFFLINE_QUEUE',

    // UI
    SET_CURRENT_TAB: 'SET_CURRENT_TAB'
};

// Reducer
function businessReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload };

        case ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };

        case ACTIONS.SET_INVENTORY:
            return {
                ...state,
                inventory: {
                    ...state.inventory,
                    data: action.payload.data,
                    lowStockCount: action.payload.lowStockCount || 0,
                    loading: false,
                    error: null
                }
            };

        case ACTIONS.SET_CUSTOMERS:
            return {
                ...state,
                customers: {
                    ...state.customers,
                    data: action.payload.data,
                    stats: action.payload.stats || {},
                    loading: false,
                    error: null
                }
            };

        case ACTIONS.SET_SALES:
            return {
                ...state,
                sales: {
                    ...state.sales,
                    data: action.payload.data,
                    totalRevenue: action.payload.totalRevenue || 0,
                    outstanding: action.payload.outstanding || 0,
                    loading: false,
                    error: null
                }
            };

        case ACTIONS.SET_EXPENSES:
            return {
                ...state,
                expenses: {
                    ...state.expenses,
                    data: action.payload.data,
                    totalExpenses: action.payload.totalExpenses || 0,
                    loading: false,
                    error: null
                }
            };

        case ACTIONS.SET_SUPPLIERS:
            return {
                ...state,
                suppliers: {
                    ...state.suppliers,
                    data: action.payload.data,
                    loading: false,
                    error: null
                }
            };

        case ACTIONS.SET_RETURNS:
            return {
                ...state,
                returns: {
                    ...state.returns,
                    data: action.payload.data,
                    loading: false,
                    error: null
                }
            };

        case ACTIONS.SET_PAYMENTS:
            return {
                ...state,
                payments: {
                    ...state.payments,
                    data: action.payload.data,
                    loading: false,
                    error: null
                }
            };

        case ACTIONS.SET_ANALYTICS:
            return {
                ...state,
                analytics: {
                    ...state.analytics,
                    data: action.payload,
                    loading: false,
                    error: null
                }
            };

        case ACTIONS.SET_SETTINGS:
            return { ...state, settings: action.payload };

        case ACTIONS.ADD_INVENTORY_ITEM:
            return {
                ...state,
                inventory: {
                    ...state.inventory,
                    data: [action.payload, ...state.inventory.data]
                }
            };

        case ACTIONS.UPDATE_INVENTORY_ITEM:
            return {
                ...state,
                inventory: {
                    ...state.inventory,
                    data: state.inventory.data.map(item =>
                        item._id === action.payload._id ? action.payload : item
                    )
                }
            };

        case ACTIONS.DELETE_INVENTORY_ITEM:
            return {
                ...state,
                inventory: {
                    ...state.inventory,
                    data: state.inventory.data.filter(item => item._id !== action.payload)
                }
            };

        case ACTIONS.ADD_CUSTOMER:
            return {
                ...state,
                customers: {
                    ...state.customers,
                    data: [action.payload, ...state.customers.data]
                }
            };

        case ACTIONS.UPDATE_CUSTOMER:
            return {
                ...state,
                customers: {
                    ...state.customers,
                    data: state.customers.data.map(customer =>
                        customer._id === action.payload._id ? action.payload : customer
                    )
                }
            };

        case ACTIONS.ADD_SALE:
            return {
                ...state,
                sales: {
                    ...state.sales,
                    data: [action.payload, ...state.sales.data]
                }
            };

        case ACTIONS.ADD_EXPENSE:
            return {
                ...state,
                expenses: {
                    ...state.expenses,
                    data: [action.payload, ...state.expenses.data]
                }
            };

        case ACTIONS.ADD_SUPPLIER:
            return {
                ...state,
                suppliers: {
                    ...state.suppliers,
                    data: [action.payload, ...state.suppliers.data]
                }
            };

        case ACTIONS.ADD_RETURN:
            return {
                ...state,
                returns: {
                    ...state.returns,
                    data: [action.payload, ...state.returns.data]
                }
            };

        case ACTIONS.ADD_PAYMENT:
            return {
                ...state,
                payments: {
                    ...state.payments,
                    data: [action.payload, ...state.payments.data]
                }
            };

        case ACTIONS.ADD_TO_OFFLINE_QUEUE:
            return {
                ...state,
                offlineQueue: [...state.offlineQueue, action.payload]
            };

        case ACTIONS.CLEAR_OFFLINE_QUEUE:
            return { ...state, offlineQueue: [] };

        case ACTIONS.SET_CURRENT_TAB:
            return { ...state, currentTab: action.payload };

        default:
            return state;
    }
}

// Context
const BusinessContext = createContext();

// Provider component
export function BusinessProvider({ children }) {
    const [state, dispatch] = useReducer(businessReducer, initialState);
    const { user, isOnline } = useUser();

    // Actions
    const actions = {
        // Error handling
        setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
        clearError: () => dispatch({ type: ACTIONS.CLEAR_ERROR }),

        // Data loading
        loadInventory: async (params = {}) => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const response = await businessApi.getInventory(params);
                dispatch({ type: ACTIONS.SET_INVENTORY, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'loadInventory', params } });
                }
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        },

        loadCustomers: async (params = {}) => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const response = await businessApi.getCustomers(params);
                dispatch({ type: ACTIONS.SET_CUSTOMERS, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'loadCustomers', params } });
                }
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        },

        loadSales: async (params = {}) => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const response = await businessApi.getSales(params);
                dispatch({ type: ACTIONS.SET_SALES, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'loadSales', params } });
                }
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        },

        loadExpenses: async (params = {}) => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const response = await businessApi.getExpenses(params);
                dispatch({ type: ACTIONS.SET_EXPENSES, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'loadExpenses', params } });
                }
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        },

        loadSuppliers: async () => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const response = await businessApi.getSuppliers();
                dispatch({ type: ACTIONS.SET_SUPPLIERS, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'loadSuppliers' } });
                }
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        },

        loadReturns: async () => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const response = await businessApi.getReturns();
                dispatch({ type: ACTIONS.SET_RETURNS, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'loadReturns' } });
                }
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        },

        loadPayments: async () => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const response = await businessApi.getPayments();
                dispatch({ type: ACTIONS.SET_PAYMENTS, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'loadPayments' } });
                }
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        },

        loadAnalytics: async (period = 30) => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const response = await businessApi.getAnalytics(period);
                dispatch({ type: ACTIONS.SET_ANALYTICS, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'loadAnalytics', period } });
                }
            } finally {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        },

        loadSettings: async () => {
            try {
                const response = await businessApi.getSettings();
                dispatch({ type: ACTIONS.SET_SETTINGS, payload: response.data });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            }
        },

        // CRUD operations
        createInventoryItem: async (item) => {
            try {
                const response = await businessApi.createInventoryItem(item);
                dispatch({ type: ACTIONS.ADD_INVENTORY_ITEM, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'createInventoryItem', data: item } });
                }
                throw error;
            }
        },

        updateInventoryItem: async (id, item) => {
            try {
                const response = await businessApi.updateInventoryItem(id, item);
                dispatch({ type: ACTIONS.UPDATE_INVENTORY_ITEM, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'updateInventoryItem', id, data: item } });
                }
                throw error;
            }
        },

        deleteInventoryItem: async (id) => {
            try {
                await businessApi.deleteInventoryItem(id);
                dispatch({ type: ACTIONS.DELETE_INVENTORY_ITEM, payload: id });
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'deleteInventoryItem', id } });
                }
                throw error;
            }
        },

        createCustomer: async (customer) => {
            try {
                const response = await businessApi.createCustomer(customer);
                dispatch({ type: ACTIONS.ADD_CUSTOMER, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'createCustomer', data: customer } });
                }
                throw error;
            }
        },

        updateCustomer: async (id, customer) => {
            try {
                const response = await businessApi.updateCustomer(id, customer);
                dispatch({ type: ACTIONS.UPDATE_CUSTOMER, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'updateCustomer', id, data: customer } });
                }
                throw error;
            }
        },

        createSale: async (sale) => {
            try {
                const response = await businessApi.createSale(sale);
                dispatch({ type: ACTIONS.ADD_SALE, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'createSale', data: sale } });
                }
                throw error;
            }
        },

        createExpense: async (expense) => {
            try {
                const response = await businessApi.createExpense(expense);
                dispatch({ type: ACTIONS.ADD_EXPENSE, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'createExpense', data: expense } });
                }
                throw error;
            }
        },

        createSupplier: async (supplier) => {
            try {
                const response = await businessApi.createSupplier(supplier);
                dispatch({ type: ACTIONS.ADD_SUPPLIER, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'createSupplier', data: supplier } });
                }
                throw error;
            }
        },

        createReturn: async (returnData) => {
            try {
                const response = await businessApi.createReturn(returnData);
                dispatch({ type: ACTIONS.ADD_RETURN, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'createReturn', data: returnData } });
                }
                throw error;
            }
        },

        createPayment: async (payment) => {
            try {
                const response = await businessApi.createPayment(payment);
                dispatch({ type: ACTIONS.ADD_PAYMENT, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                if (!isOnline) {
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: { type: 'createPayment', data: payment } });
                }
                throw error;
            }
        },

        // Offline queue management
        processOfflineQueue: async () => {
            if (!isOnline || state.offlineQueue.length === 0) return;

            const queue = [...state.offlineQueue];
            dispatch({ type: ACTIONS.CLEAR_OFFLINE_QUEUE });

            for (const item of queue) {
                try {
                    switch (item.type) {
                        case 'createInventoryItem':
                            await actions.createInventoryItem(item.data);
                            break;
                        case 'updateInventoryItem':
                            await actions.updateInventoryItem(item.id, item.data);
                            break;
                        case 'deleteInventoryItem':
                            await actions.deleteInventoryItem(item.id);
                            break;
                        case 'createCustomer':
                            await actions.createCustomer(item.data);
                            break;
                        case 'updateCustomer':
                            await actions.updateCustomer(item.id, item.data);
                            break;
                        case 'createSale':
                            await actions.createSale(item.data);
                            break;
                        case 'createExpense':
                            await actions.createExpense(item.data);
                            break;
                        case 'createSupplier':
                            await actions.createSupplier(item.data);
                            break;
                        case 'createReturn':
                            await actions.createReturn(item.data);
                            break;
                        case 'createPayment':
                            await actions.createPayment(item.data);
                            break;
                        default:
                            console.warn('Unknown offline queue item type:', item.type);
                    }
                } catch (error) {
                    console.error('Failed to process offline queue item:', error);
                    // Re-add failed items to queue
                    dispatch({ type: ACTIONS.ADD_TO_OFFLINE_QUEUE, payload: item });
                }
            }
        },

        // UI actions
        setCurrentTab: (tab) => dispatch({ type: ACTIONS.SET_CURRENT_TAB, payload: tab }),

        // Bulk operations
        bulkImportInventory: async (items) => {
            try {
                const response = await businessApi.bulkImportInventory(items);
                // Reload inventory after bulk import
                await actions.loadInventory();
                return response.data;
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        },

        // Export operations
        exportData: async (type) => {
            try {
                const blob = await businessApi.exportData(type);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}-export.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        },

        // Invoice download
        downloadInvoice: async (saleId) => {
            try {
                const blob = await businessApi.downloadInvoice(saleId);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice-${saleId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        }
    };

    // Load initial data when user is available
    useEffect(() => {
        if (user) {
            actions.loadSettings();
            actions.loadInventory();
            actions.loadCustomers();
            actions.loadSales();
            actions.loadExpenses();
            actions.loadSuppliers();
            actions.loadAnalytics();
        }
    }, [user]);

    // Process offline queue when coming back online
    useEffect(() => {
        if (isOnline && state.offlineQueue.length > 0) {
            actions.processOfflineQueue();
        }
    }, [isOnline, state.offlineQueue.length]);

    return (
        <BusinessContext.Provider value={{ state, actions }}>
            {children}
        </BusinessContext.Provider>
    );
}

// Hook to use business context
export function useBusiness() {
    const context = useContext(BusinessContext);
    if (!context) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
}
