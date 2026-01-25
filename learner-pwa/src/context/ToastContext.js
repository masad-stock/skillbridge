import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, variant = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            variant,
            duration,
            show: true
        };

        setToasts(prev => [...prev, toast]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Convenience methods
    const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);
    const showError = useCallback((message) => showToast(message, 'danger', 7000), [showToast]);
    const showWarning = useCallback((message) => showToast(message, 'warning'), [showToast]);
    const showInfo = useCallback((message) => showToast(message, 'info'), [showToast]);

    const value = {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer
                position="top-end"
                className="p-3"
                style={{ zIndex: 9999 }}
            >
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        show={toast.show}
                        onClose={() => removeToast(toast.id)}
                        bg={toast.variant}
                        delay={toast.duration}
                        autohide
                    >
                        <Toast.Header>
                            <strong className="me-auto">
                                {toast.variant === 'success' && '✅ '}
                                {toast.variant === 'danger' && '❌ '}
                                {toast.variant === 'warning' && '⚠️ '}
                                {toast.variant === 'info' && 'ℹ️ '}
                                {toast.variant === 'success' && 'Success'}
                                {toast.variant === 'danger' && 'Error'}
                                {toast.variant === 'warning' && 'Warning'}
                                {toast.variant === 'info' && 'Info'}
                            </strong>
                        </Toast.Header>
                        <Toast.Body className={toast.variant === 'danger' || toast.variant === 'warning' ? 'text-white' : ''}>
                            {toast.message}
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
