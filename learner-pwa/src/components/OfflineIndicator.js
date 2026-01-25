import React, { useState, useEffect } from 'react';
import { Alert, Badge, Button } from 'react-bootstrap';
import syncQueueManager from '../services/offlineStorage/SyncQueueManager';

function OfflineIndicator({ isOnline }) {
    const [showAlert, setShowAlert] = useState(false);
    const [justWentOffline, setJustWentOffline] = useState(false);
    const [syncStatus, setSyncStatus] = useState({
        pending: 0,
        isSyncing: false,
        lastSync: null
    });

    // Update sync status
    useEffect(() => {
        const updateSyncStatus = async () => {
            try {
                const status = await syncQueueManager.getSyncStatus();
                setSyncStatus({
                    pending: status.pending,
                    isSyncing: status.isSyncing,
                    lastSync: status.lastSync
                });
            } catch (error) {
                console.error('Failed to get sync status:', error);
            }
        };

        updateSyncStatus();
        const interval = setInterval(updateSyncStatus, 5000); // Update every 5 seconds

        // Listen for sync events
        const handleSyncEvent = (event) => {
            if (event.type === 'SYNC_STARTED') {
                setSyncStatus(prev => ({ ...prev, isSyncing: true }));
            } else if (event.type === 'SYNC_COMPLETED') {
                setSyncStatus(prev => ({ ...prev, isSyncing: false, pending: 0 }));
                updateSyncStatus();
            } else if (event.type === 'ITEM_QUEUED') {
                updateSyncStatus();
            }
        };

        syncQueueManager.addListener(handleSyncEvent);

        return () => {
            clearInterval(interval);
            syncQueueManager.removeListener(handleSyncEvent);
        };
    }, []);

    // Handle online/offline transitions
    useEffect(() => {
        if (!isOnline && !justWentOffline) {
            setJustWentOffline(true);
            setShowAlert(true);
        } else if (isOnline && justWentOffline) {
            setJustWentOffline(false);
            // Show reconnected message briefly
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
        }
    }, [isOnline, justWentOffline]);

    // Manual sync trigger
    const handleManualSync = async () => {
        if (!isOnline) {
            alert('Cannot sync while offline. Please connect to the internet.');
            return;
        }

        try {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }));
            await syncQueueManager.processSyncQueue();
        } catch (error) {
            console.error('Manual sync failed:', error);
            alert('Sync failed. Please try again.');
        }
    };

    // Format last sync time
    const formatLastSync = (timestamp) => {
        if (!timestamp) return 'Never';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return date.toLocaleDateString();
    };

    if (!showAlert) {
        // Show compact status badge when alert is dismissed
        if (!isOnline || syncStatus.pending > 0) {
            return (
                <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 1050 }}>
                    <Badge
                        bg={isOnline ? 'primary' : 'warning'}
                        className="p-2 cursor-pointer"
                        onClick={() => setShowAlert(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        {!isOnline && '📱 Offline'}
                        {isOnline && syncStatus.pending > 0 && `🔄 ${syncStatus.pending} pending`}
                    </Badge>
                </div>
            );
        }
        return null;
    }

    return (
        <Alert
            variant={isOnline ? 'success' : 'warning'}
            className="mb-0 text-center rounded-0"
            dismissible
            onClose={() => setShowAlert(false)}
        >
            <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                <div>
                    {isOnline ? (
                        <>
                            <span className="me-2">🌐</span>
                            <strong>You're back online!</strong>
                        </>
                    ) : (
                        <>
                            <span className="me-2">📱</span>
                            <strong>You're offline.</strong> Continue learning with cached content.
                        </>
                    )}
                </div>

                {syncStatus.pending > 0 && (
                    <div>
                        <Badge bg="info" className="me-2">
                            {syncStatus.pending} items pending sync
                        </Badge>
                        {isOnline && !syncStatus.isSyncing && (
                            <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={handleManualSync}
                            >
                                Sync Now
                            </Button>
                        )}
                        {syncStatus.isSyncing && (
                            <Badge bg="primary">
                                <span className="spinner-border spinner-border-sm me-1" />
                                Syncing...
                            </Badge>
                        )}
                    </div>
                )}

                {syncStatus.lastSync && (
                    <small className="text-muted">
                        Last sync: {formatLastSync(syncStatus.lastSync)}
                    </small>
                )}
            </div>
        </Alert>
    );
}

export default OfflineIndicator;