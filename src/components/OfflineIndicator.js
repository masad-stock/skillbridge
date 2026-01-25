import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

function OfflineIndicator({ isOnline }) {
    const [showAlert, setShowAlert] = useState(false);
    const [justWentOffline, setJustWentOffline] = useState(false);

    useEffect(() => {
        if (!isOnline && !justWentOffline) {
            setJustWentOffline(true);
            setShowAlert(true);
        } else if (isOnline && justWentOffline) {
            setJustWentOffline(false);
            // Show reconnected message briefly
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        }
    }, [isOnline, justWentOffline]);

    if (!showAlert) return null;

    return (
        <Alert
            variant={isOnline ? 'success' : 'warning'}
            className="mb-0 text-center rounded-0"
            dismissible
            onClose={() => setShowAlert(false)}
        >
            {isOnline ? (
                <>
                    <span className="me-2">🌐</span>
                    You're back online! New content will be downloaded.
                </>
            ) : (
                <>
                    <span className="me-2">📱</span>
                    You're offline. You can continue learning with cached content.
                </>
            )}
        </Alert>
    );
}

export default OfflineIndicator;