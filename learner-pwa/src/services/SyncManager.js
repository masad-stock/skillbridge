import Dexie from 'dexie';

/**
 * Advanced Sync Manager for offline-first functionality
 * Handles intelligent synchronization with conflict resolution
 */
class SyncManager {
    constructor() {
        this.db = new Dexie('SkillBridgeSync');
        this.db.version(1).stores({
            syncQueue: '++id, action, priority, timestamp, retryCount, synced',
            conflictLog: '++id, entityType, entityId, timestamp',
            cacheMetadata: 'key, cachedAt, priority, size'
        });

        this.syncInProgress = false;
        this.syncListeners = [];
        this.maxRetries = 5;
        this.retryDelays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff
    }

/**
 