/**
 * Offline Event Queue Service
 * Uses Dexie.js (IndexedDB) for persistent offline event storage
 * Implements queue management with retry logic and sync capabilities
 */

import Dexie from 'dexie';
import api from './api';

// Initialize IndexedDB database
const db = new Dexie('SkillBridgeOffline');

db.version(1).stores({
    pendingEvents: '++id, timestamp, eventType, synced, retryCount',
    syncMetadata: 'key'
});

class OfflineEventQueue {
    constructor() {
        this.maxQueueSize = 1000;
        this.maxRetries = 5;
        this.syncInProgress = false;
        this.isOnline = navigator.onLine;

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Initialize the queue and attempt sync if online
     */
    async initialize() {
        console.log('[OfflineQueue] Initializing...');

        // Clean up old synced events
        await this.cleanupSyncedEvents();

        // Attempt sync if online
        if (this.isOnline) {
            await this.syncPendingEvents();
        }

        const count = await this.getQueueSize();
        console.log('[OfflineQueue] Initialized with', count, 'pending events');
    }

    /**
     * Add event to the offline queue
     * @param {Object} event - Event to queue
     */
    async queueEvent(event) {
        try {
            // Check queue size limit
            const currentSize = await this.getQueueSize();
            if (currentSize >= this.maxQueueSize) {
                await this.evictOldestEvents(Math.ceil(this.maxQueueSize * 0.1));
            }

            const queuedEvent = {
                ...event,
                queuedAt: new Date().toISOString(),
                synced: false,
                retryCount: 0
            };

            await db.pendingEvents.add(queuedEvent);
            console.log('[OfflineQueue] Event queued:', event.eventType);

            return { success: true, queued: true };
        } catch (error) {
            console.error('[OfflineQueue] Failed to queue event:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Queue multiple events at once
     * @param {Array} events - Events to queue
     */
    async queueEvents(events) {
        try {
            const currentSize = await this.getQueueSize();
            const availableSpace = this.maxQueueSize - currentSize;

            if (events.length > availableSpace) {
                await this.evictOldestEvents(events.length - availableSpace);
            }

            const queuedEvents = events.map(event => ({
                ...event,
                queuedAt: new Date().toISOString(),
                synced: false,
                retryCount: 0
            }));

            await db.pendingEvents.bulkAdd(queuedEvents);
            console.log('[OfflineQueue] Queued', events.length, 'events');

            return { success: true, queued: events.length };
        } catch (error) {
            console.error('[OfflineQueue] Failed to queue events:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all pending (unsynced) events
     */
    async getPendingEvents() {
        return await db.pendingEvents
            .where('synced')
            .equals(false)
            .and(event => event.retryCount < this.maxRetries)
            .toArray();
    }

    /**
     * Get queue size
     */
    async getQueueSize() {
        return await db.pendingEvents.where('synced').equals(false).count();
    }

    /**
     * Evict oldest events when queue is full
     * @param {number} count - Number of events to evict
     */
    async evictOldestEvents(count) {
        const oldestEvents = await db.pendingEvents
            .orderBy('timestamp')
            .limit(count)
            .toArray();

        const idsToDelete = oldestEvents.map(e => e.id);
        await db.pendingEvents.bulkDelete(idsToDelete);

        console.log('[OfflineQueue] Evicted', count, 'oldest events');
    }

    /**
     * Mark events as synced
     * @param {Array} ids - Event IDs to mark as synced
     */
    async markAsSynced(ids) {
        await db.pendingEvents
            .where('id')
            .anyOf(ids)
            .modify({ synced: true, syncedAt: new Date().toISOString() });
    }

    /**
     * Increment retry count for failed events
     * @param {Array} ids - Event IDs to update
     */
    async incrementRetryCount(ids) {
        await db.pendingEvents
            .where('id')
            .anyOf(ids)
            .modify(event => {
                event.retryCount = (event.retryCount || 0) + 1;
            });
    }

    /**
     * Clean up old synced events (older than 24 hours)
     */
    async cleanupSyncedEvents() {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        await db.pendingEvents
            .where('synced')
            .equals(true)
            .and(event => event.syncedAt < cutoff)
            .delete();
    }

    /**
     * Sync pending events to server
     */
    async syncPendingEvents() {
        if (this.syncInProgress || !this.isOnline) {
            return { synced: 0, pending: await this.getQueueSize() };
        }

        this.syncInProgress = true;
        let syncedCount = 0;

        try {
            const pendingEvents = await this.getPendingEvents();

            if (pendingEvents.length === 0) {
                this.syncInProgress = false;
                return { synced: 0, pending: 0 };
            }

            console.log('[OfflineQueue] Syncing', pendingEvents.length, 'events...');

            // Batch events for submission (max 50 per batch)
            const batchSize = 50;
            for (let i = 0; i < pendingEvents.length; i += batchSize) {
                const batch = pendingEvents.slice(i, i + batchSize);
                const eventIds = batch.map(e => e.id);

                // Prepare events for API (remove queue metadata)
                const eventsToSubmit = batch.map(({ id, queuedAt, synced, retryCount, syncedAt, ...event }) => ({
                    ...event,
                    syncStatus: {
                        queuedAt,
                        retryCount,
                        source: 'offline_sync'
                    }
                }));

                try {
                    await api.post('/research/events/batch', { events: eventsToSubmit });
                    await this.markAsSynced(eventIds);
                    syncedCount += batch.length;
                } catch (error) {
                    console.error('[OfflineQueue] Batch sync failed:', error.message);
                    await this.incrementRetryCount(eventIds);
                }
            }

            // Update sync metadata
            await db.syncMetadata.put({
                key: 'lastSync',
                timestamp: new Date().toISOString(),
                syncedCount
            });

            console.log('[OfflineQueue] Synced', syncedCount, 'events');
        } catch (error) {
            console.error('[OfflineQueue] Sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }

        return { synced: syncedCount, pending: await this.getQueueSize() };
    }

    /**
     * Handle coming online
     */
    async handleOnline() {
        this.isOnline = true;
        console.log('[OfflineQueue] Online - starting sync');
        await this.syncPendingEvents();
    }

    /**
     * Handle going offline
     */
    handleOffline() {
        this.isOnline = false;
        console.log('[OfflineQueue] Offline - events will be queued');
    }

    /**
     * Get sync status
     */
    async getSyncStatus() {
        const pending = await this.getQueueSize();
        const lastSync = await db.syncMetadata.get('lastSync');

        return {
            pending,
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            lastSync: lastSync?.timestamp || null
        };
    }

    /**
     * Clear all queued events (for testing/reset)
     */
    async clearQueue() {
        await db.pendingEvents.clear();
        console.log('[OfflineQueue] Queue cleared');
    }

    /**
     * Export queue for debugging
     */
    async exportQueue() {
        return await db.pendingEvents.toArray();
    }
}

// Singleton instance
const offlineEventQueue = new OfflineEventQueue();

export default offlineEventQueue;
export { db };
