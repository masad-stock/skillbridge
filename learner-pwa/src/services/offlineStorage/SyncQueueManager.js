/**
 * Sync Queue Manager
 * Manages background synchronization of offline actions with priority queue and retry logic
 * 
 * Requirements: 1.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import api from '../api';

const DB_NAME = 'skillbridge-offline';
const DB_VERSION = 1;

// Priority levels
const PRIORITY = {
    ASSESSMENT: 10,
    CERTIFICATE: 9,
    PROGRESS: 5,
    BUSINESS: 3
};

// Retry configuration
const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 1000; // 1 second

class SyncQueueManager {
    constructor() {
        this.db = null;
        this.isSyncing = false;
        this.listeners = [];
    }

    /**
     * Initialize IndexedDB connection
     */
    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('[SyncQueue] Failed to open database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[SyncQueue] Database opened successfully');
                resolve(this.db);
            };
        });
    }

    // ============================================================================
    // QUEUE OPERATIONS
    // ============================================================================

    /**
     * Add action to sync queue
     * @param {Object} action - Sync action to queue
     */
    async enqueue(action) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');

            const queueItem = {
                type: action.type,
                data: action.data,
                timestamp: Date.now(),
                priority: this.getPriority(action.type),
                retryCount: 0,
                maxRetries: MAX_RETRIES,
                status: 'pending'
            };

            const request = store.add(queueItem);

            request.onsuccess = () => {
                console.log('[SyncQueue] Action queued:', action.type, 'ID:', request.result);
                this.notifyListeners({ type: 'ITEM_QUEUED', item: queueItem });
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('[SyncQueue] Failed to queue action:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get next action from queue (highest priority)
     * @returns {Object|null} Next sync action or null if queue is empty
     */
    async dequeue() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const index = store.index('priority');

            // Get highest priority pending item
            const request = index.openCursor(null, 'prev');

            request.onsuccess = () => {
                const cursor = request.result;

                if (cursor && cursor.value.status === 'pending') {
                    const item = cursor.value;

                    // Remove from queue
                    cursor.delete();

                    console.log('[SyncQueue] Dequeued action:', item.type);
                    resolve(item);
                } else if (cursor) {
                    // Skip non-pending items
                    cursor.continue();
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error('[SyncQueue] Failed to dequeue:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Peek at queue without removing items
     * @returns {Array} Array of pending sync actions
     */
    async peek() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readonly');
            const store = transaction.objectStore('syncQueue');
            const request = store.getAll();

            request.onsuccess = () => {
                const items = request.result
                    .filter(item => item.status === 'pending')
                    .sort((a, b) => b.priority - a.priority);
                resolve(items);
            };

            request.onerror = () => {
                console.error('[SyncQueue] Failed to peek queue:', request.error);
                reject(request.error);
            };
        });
    }

    // ============================================================================
    // SYNC EXECUTION
    // ============================================================================

    /**
     * Process all items in sync queue
     * @returns {Object} Sync results
     */
    async processSyncQueue() {
        if (this.isSyncing) {
            console.log('[SyncQueue] Sync already in progress');
            return { success: false, message: 'Sync already in progress' };
        }

        if (!navigator.onLine) {
            console.log('[SyncQueue] Cannot sync while offline');
            return { success: false, message: 'Device is offline' };
        }

        this.isSyncing = true;
        this.notifyListeners({ type: 'SYNC_STARTED' });

        const results = {
            total: 0,
            successful: 0,
            failed: 0,
            errors: []
        };

        try {
            const queue = await this.peek();
            results.total = queue.length;

            console.log('[SyncQueue] Processing', results.total, 'items');

            // Process in batches of 10
            const BATCH_SIZE = 10;
            for (let i = 0; i < queue.length; i += BATCH_SIZE) {
                const batch = queue.slice(i, i + BATCH_SIZE);

                await Promise.all(
                    batch.map(async (item) => {
                        try {
                            await this.syncItem(item);
                            results.successful++;
                        } catch (error) {
                            console.error('[SyncQueue] Failed to sync item:', error);
                            results.failed++;
                            results.errors.push({
                                item: item.type,
                                error: error.message
                            });

                            // Re-queue with retry logic
                            await this.handleSyncFailure(item, error);
                        }
                    })
                );
            }

            console.log('[SyncQueue] Sync complete:', results);
            this.notifyListeners({ type: 'SYNC_COMPLETED', results });

            return {
                success: true,
                results
            };
        } catch (error) {
            console.error('[SyncQueue] Sync queue processing failed:', error);
            this.notifyListeners({ type: 'SYNC_FAILED', error });

            return {
                success: false,
                message: error.message,
                results
            };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sync individual item
     * @param {Object} item - Queue item to sync
     */
    async syncItem(item) {
        console.log('[SyncQueue] Syncing item:', item.type);

        switch (item.type) {
            case 'progress':
                await api.post('/api/learning/progress', item.data);
                break;

            case 'assessment':
                await api.post('/api/assessments/results', item.data);
                break;

            case 'certificate':
                await api.post('/api/certificates/sync', item.data);
                break;

            case 'business':
                await api.post('/api/business/records', item.data);
                break;

            default:
                throw new Error(`Unknown sync type: ${item.type}`);
        }

        // Remove from queue after successful sync
        await this.removeFromQueue(item.id);
    }

    /**
     * Handle sync failure with retry logic
     * @param {Object} item - Failed queue item
     * @param {Error} error - Error that occurred
     */
    async handleSyncFailure(item, error) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');

            item.retryCount++;

            if (item.retryCount >= item.maxRetries) {
                // Max retries reached, mark as failed
                item.status = 'failed';
                item.error = error.message;
                console.error('[SyncQueue] Max retries reached for item:', item.type);
            } else {
                // Re-queue with exponential backoff
                const backoffDelay = INITIAL_BACKOFF * Math.pow(2, item.retryCount - 1);
                item.nextRetry = Date.now() + backoffDelay;
                console.log('[SyncQueue] Will retry in', backoffDelay, 'ms');
            }

            const request = store.put(item);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retry failed sync items
     */
    async retryFailed() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const request = store.getAll();

            request.onsuccess = () => {
                const failedItems = request.result.filter(item => item.status === 'failed');

                console.log('[SyncQueue] Retrying', failedItems.length, 'failed items');

                failedItems.forEach(item => {
                    item.status = 'pending';
                    item.retryCount = 0;
                    delete item.error;
                    delete item.nextRetry;
                    store.put(item);
                });

                resolve(failedItems.length);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // ============================================================================
    // STATUS AND MANAGEMENT
    // ============================================================================

    /**
     * Get sync queue status
     * @returns {Object} Queue status information
     */
    async getSyncStatus() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readonly');
            const store = transaction.objectStore('syncQueue');
            const request = store.getAll();

            request.onsuccess = () => {
                const items = request.result;

                const status = {
                    total: items.length,
                    pending: items.filter(i => i.status === 'pending').length,
                    failed: items.filter(i => i.status === 'failed').length,
                    isSyncing: this.isSyncing,
                    lastSync: this.getLastSyncTime(),
                    breakdown: {
                        assessment: items.filter(i => i.type === 'assessment').length,
                        certificate: items.filter(i => i.type === 'certificate').length,
                        progress: items.filter(i => i.type === 'progress').length,
                        business: items.filter(i => i.type === 'business').length
                    }
                };

                resolve(status);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear completed items from queue
     */
    async clearCompleted() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const request = store.getAll();

            request.onsuccess = () => {
                const items = request.result;
                let cleared = 0;

                items.forEach(item => {
                    if (item.status === 'completed') {
                        store.delete(item.id);
                        cleared++;
                    }
                });

                console.log('[SyncQueue] Cleared', cleared, 'completed items');
                resolve(cleared);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove specific item from queue
     * @param {number} itemId - Item ID to remove
     */
    async removeFromQueue(itemId) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const request = store.delete(itemId);

            request.onsuccess = () => {
                console.log('[SyncQueue] Removed item:', itemId);
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    /**
     * Get priority for action type
     * @param {string} type - Action type
     * @returns {number} Priority level
     */
    getPriority(type) {
        return PRIORITY[type.toUpperCase()] || 1;
    }

    /**
     * Get last sync timestamp from localStorage
     * @returns {string|null} Last sync time
     */
    getLastSyncTime() {
        return localStorage.getItem('lastSyncTime');
    }

    /**
     * Set last sync timestamp
     */
    setLastSyncTime() {
        const now = new Date().toISOString();
        localStorage.setItem('lastSyncTime', now);
    }

    /**
     * Add listener for sync events
     * @param {Function} callback - Event callback
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove listener
     * @param {Function} callback - Event callback to remove
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    /**
     * Notify all listeners of event
     * @param {Object} event - Event data
     */
    notifyListeners(event) {
        this.listeners.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('[SyncQueue] Listener error:', error);
            }
        });
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('[SyncQueue] Database connection closed');
        }
    }
}

// Export singleton instance
const syncQueueManager = new SyncQueueManager();

// Auto-sync when connectivity is restored
window.addEventListener('online', () => {
    console.log('[SyncQueue] Connectivity restored, starting auto-sync');
    syncQueueManager.processSyncQueue();
});

export default syncQueueManager;
