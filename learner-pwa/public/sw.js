// SkillBridge Offline-First Service Worker
// Version: 1.0.0
// This Service Worker enables full offline functionality for rural learners

const CACHE_VERSION = 'skillbridge-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Critical assets to cache during installation
const APP_SHELL_ASSETS = [
    '/',
    '/index.html',
    '/static/css/main.css',
    '/static/js/main.js',
    '/static/js/bundle.js',
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png'
];

// Network timeout for fetch requests (3 seconds)
const NETWORK_TIMEOUT = 3000;

// IndexedDB configuration
const DB_NAME = 'skillbridge-offline';
const DB_VERSION = 1;

// ============================================================================
// INSTALLATION PHASE
// ============================================================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker version:', CACHE_VERSION);

    event.waitUntil(
        (async () => {
            try {
                // Cache app shell assets
                const cache = await caches.open(APP_SHELL_CACHE);
                console.log('[SW] Caching app shell assets');
                await cache.addAll(APP_SHELL_ASSETS);

                // Initialize IndexedDB schemas
                await initializeIndexedDB();

                console.log('[SW] Installation complete');

                // Skip waiting to activate immediately
                await self.skipWaiting();
            } catch (error) {
                console.error('[SW] Installation failed:', error);
                // Retry installation on next page load
                throw error;
            }
        })()
    );
});

// ============================================================================
// ACTIVATION PHASE
// ============================================================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker version:', CACHE_VERSION);

    event.waitUntil(
        (async () => {
            try {
                // Clean up old caches
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('skillbridge-') && name !== APP_SHELL_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );

                // Claim all clients immediately
                await self.clients.claim();

                // Register background sync
                if ('sync' in self.registration) {
                    console.log('[SW] Background sync registered');
                }

                console.log('[SW] Activation complete');
            } catch (error) {
                console.error('[SW] Activation failed:', error);
            }
        })()
    );
});

// ============================================================================
// FETCH PHASE - REQUEST INTERCEPTION
// ============================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Route requests to appropriate caching strategy
    if (isAppShellRequest(url)) {
        event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
    } else if (isImageRequest(url)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
    } else if (isAPIRequest(url)) {
        event.respondWith(networkFirstWithTimeout(request, DYNAMIC_CACHE));
    } else {
        event.respondWith(networkFirstWithTimeout(request, DYNAMIC_CACHE));
    }
});

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

/**
 * Cache First Strategy
 * Serves from cache if available, falls back to network
 * Best for: Static assets, images, fonts
 */
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);

        if (cached) {
            console.log('[SW] Cache hit:', request.url);
            return cached;
        }

        console.log('[SW] Cache miss, fetching:', request.url);
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[SW] Cache first failed:', error);

        // Try to return cached version as last resort
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        // Return offline fallback
        return getOfflineFallback(request);
    }
}

/**
 * Network First with Timeout Strategy
 * Tries network first with timeout, falls back to cache
 * Best for: API calls, dynamic content
 */
async function networkFirstWithTimeout(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);

        // Try network with timeout
        const networkPromise = fetch(request);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
        );

        try {
            const response = await Promise.race([networkPromise, timeoutPromise]);

            // Cache successful responses
            if (response.ok) {
                cache.put(request, response.clone());
            }

            return response;
        } catch (networkError) {
            console.log('[SW] Network failed or timeout, trying cache:', request.url);

            // Fall back to cache
            const cached = await cache.match(request);

            if (cached) {
                console.log('[SW] Serving from cache:', request.url);
                return cached;
            }

            throw networkError;
        }
    } catch (error) {
        console.error('[SW] Network first failed:', error);
        return getOfflineFallback(request);
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if request is for app shell assets
 */
function isAppShellRequest(url) {
    return APP_SHELL_ASSETS.some(asset => url.pathname === asset || url.pathname.startsWith('/static/'));
}

/**
 * Check if request is for images
 */
function isImageRequest(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
}

/**
 * Check if request is for API endpoints
 */
function isAPIRequest(url) {
    return url.pathname.startsWith('/api/');
}

/**
 * Get offline fallback response
 */
function getOfflineFallback(request) {
    const url = new URL(request.url);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        return caches.match('/index.html');
    }

    // Return offline message for API requests
    if (isAPIRequest(url)) {
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'You are currently offline. This action will be synced when connectivity is restored.'
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    // Return generic offline response
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

/**
 * Initialize IndexedDB schemas
 */
async function initializeIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('[SW] IndexedDB initialization failed:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            console.log('[SW] IndexedDB initialized');
            request.result.close();
            resolve();
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains('courses')) {
                const coursesStore = db.createObjectStore('courses', { keyPath: 'id' });
                coursesStore.createIndex('title', 'title', { unique: false });
                coursesStore.createIndex('category', 'category', { unique: false });
                coursesStore.createIndex('downloadDate', 'downloadDate', { unique: false });
            }

            if (!db.objectStoreNames.contains('progress')) {
                const progressStore = db.createObjectStore('progress', { keyPath: 'userId' });
                progressStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                progressStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            }

            if (!db.objectStoreNames.contains('assessments')) {
                const assessmentsStore = db.createObjectStore('assessments', { keyPath: 'id' });
                assessmentsStore.createIndex('completedDate', 'completedDate', { unique: false });
                assessmentsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            }

            if (!db.objectStoreNames.contains('businessRecords')) {
                const businessStore = db.createObjectStore('businessRecords', { keyPath: 'id' });
                businessStore.createIndex('type', 'type', { unique: false });
                businessStore.createIndex('date', 'date', { unique: false });
                businessStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            }

            if (!db.objectStoreNames.contains('syncQueue')) {
                const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                syncStore.createIndex('priority', 'priority', { unique: false });
                syncStore.createIndex('retryCount', 'retryCount', { unique: false });
            }

            console.log('[SW] IndexedDB schemas created');
        };
    });
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);

    if (event.tag === 'sync-queue') {
        event.waitUntil(processSyncQueue());
    }
});

/**
 * Process sync queue when connectivity is restored
 */
async function processSyncQueue() {
    try {
        console.log('[SW] Processing sync queue');

        // This will be implemented in Phase 2 with SyncQueueManager
        // For now, just log that sync is ready

        // Notify all clients that sync is processing
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_STARTED'
            });
        });

    } catch (error) {
        console.error('[SW] Sync queue processing failed:', error);
    }
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

console.log('[SW] Service Worker script loaded');
