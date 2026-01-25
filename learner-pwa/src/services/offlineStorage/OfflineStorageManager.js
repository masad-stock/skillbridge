/**
 * Offline Storage Manager
 * Manages all local data storage using IndexedDB for offline-first functionality
 * 
 * Requirements: 2.1, 2.2, 2.4, 2.6, 5.2, 11.1, 11.2, 11.3
 */

const DB_NAME = 'skillbridge-offline';
const DB_VERSION = 1;

class OfflineStorageManager {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize IndexedDB connection
     */
    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to open database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[OfflineStorage] Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('courses')) {
                    const coursesStore = db.createObjectStore('courses', { keyPath: 'id' });
                    coursesStore.createIndex('title', 'title', { unique: false });
                    coursesStore.createIndex('category', 'category', { unique: false });
                    coursesStore.createIndex('downloadDate', 'downloadDate', { unique: false });
                    console.log('[OfflineStorage] Created courses object store');
                }

                if (!db.objectStoreNames.contains('progress')) {
                    const progressStore = db.createObjectStore('progress', { keyPath: 'userId' });
                    progressStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                    progressStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    console.log('[OfflineStorage] Created progress object store');
                }

                if (!db.objectStoreNames.contains('assessments')) {
                    const assessmentsStore = db.createObjectStore('assessments', { keyPath: 'id' });
                    assessmentsStore.createIndex('completedDate', 'completedDate', { unique: false });
                    assessmentsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    console.log('[OfflineStorage] Created assessments object store');
                }

                if (!db.objectStoreNames.contains('businessRecords')) {
                    const businessStore = db.createObjectStore('businessRecords', { keyPath: 'id' });
                    businessStore.createIndex('type', 'type', { unique: false });
                    businessStore.createIndex('date', 'date', { unique: false });
                    businessStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    console.log('[OfflineStorage] Created businessRecords object store');
                }

                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                    syncStore.createIndex('priority', 'priority', { unique: false });
                    syncStore.createIndex('retryCount', 'retryCount', { unique: false });
                    console.log('[OfflineStorage] Created syncQueue object store');
                }

                if (!db.objectStoreNames.contains('certificates')) {
                    const certificatesStore = db.createObjectStore('certificates', { keyPath: 'id' });
                    certificatesStore.createIndex('userId', 'userId', { unique: false });
                    certificatesStore.createIndex('courseId', 'courseId', { unique: false });
                    certificatesStore.createIndex('generatedAt', 'generatedAt', { unique: false });
                    certificatesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    certificatesStore.createIndex('verificationCode', 'verificationCode', { unique: true });
                    console.log('[OfflineStorage] Created certificates object store');
                }
            };
        });
    }

    // ============================================================================
    // COURSE STORAGE METHODS
    // ============================================================================

    /**
     * Save course content to local storage
     * @param {string} courseId - Course identifier
     * @param {Object} content - Course content object
     */
    async saveCourse(courseId, content) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['courses'], 'readwrite');
            const store = transaction.objectStore('courses');

            const courseData = {
                id: courseId,
                ...content,
                downloadDate: new Date().toISOString(),
                syncStatus: 'synced'
            };

            const request = store.put(courseData);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Course saved:', courseId);
                resolve();
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to save course:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Retrieve course content from local storage
     * @param {string} courseId - Course identifier
     * @returns {Object|null} Course content or null if not found
     */
    async getCourse(courseId) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['courses'], 'readonly');
            const store = transaction.objectStore('courses');
            const request = store.get(courseId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to get course:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Delete course from local storage
     * @param {string} courseId - Course identifier
     */
    async deleteCourse(courseId) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['courses'], 'readwrite');
            const store = transaction.objectStore('courses');
            const request = store.delete(courseId);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Course deleted:', courseId);
                resolve();
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to delete course:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * List all cached courses
     * @returns {Array} Array of course metadata
     */
    async listCachedCourses() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['courses'], 'readonly');
            const store = transaction.objectStore('courses');
            const request = store.getAll();

            request.onsuccess = () => {
                const courses = request.result.map(course => ({
                    id: course.id,
                    title: course.title,
                    category: course.category,
                    downloadDate: course.downloadDate,
                    size: course.size || 0
                }));
                resolve(courses);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to list courses:', request.error);
                reject(request.error);
            };
        });
    }

    // ============================================================================
    // PROGRESS STORAGE METHODS
    // ============================================================================

    /**
     * Save user progress to local storage
     * @param {string} userId - User identifier
     * @param {Object} progress - Progress data
     */
    async saveProgress(userId, progress) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['progress'], 'readwrite');
            const store = transaction.objectStore('progress');

            const progressData = {
                userId,
                ...progress,
                lastUpdated: new Date().toISOString(),
                syncStatus: 'pending'
            };

            const request = store.put(progressData);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Progress saved for user:', userId);
                resolve();
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to save progress:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Retrieve user progress from local storage
     * @param {string} userId - User identifier
     * @returns {Object|null} Progress data or null if not found
     */
    async getProgress(userId) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['progress'], 'readonly');
            const store = transaction.objectStore('progress');
            const request = store.get(userId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to get progress:', request.error);
                reject(request.error);
            };
        });
    }

    // ============================================================================
    // ASSESSMENT STORAGE METHODS
    // ============================================================================

    /**
     * Save assessment data to local storage
     * @param {Object} assessment - Assessment data
     */
    async saveAssessment(assessment) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['assessments'], 'readwrite');
            const store = transaction.objectStore('assessments');

            const assessmentData = {
                ...assessment,
                completedDate: assessment.completedDate || new Date().toISOString(),
                syncStatus: 'pending'
            };

            const request = store.put(assessmentData);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Assessment saved:', assessment.id);
                resolve();
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to save assessment:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Retrieve assessment data from local storage
     * @param {string} assessmentId - Assessment identifier (optional, gets latest if not provided)
     * @returns {Object|null} Assessment data or null if not found
     */
    async getAssessment(assessmentId = null) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['assessments'], 'readonly');
            const store = transaction.objectStore('assessments');

            if (assessmentId) {
                const request = store.get(assessmentId);
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            } else {
                // Get most recent assessment
                const index = store.index('completedDate');
                const request = index.openCursor(null, 'prev');

                request.onsuccess = () => {
                    const cursor = request.result;
                    resolve(cursor ? cursor.value : null);
                };

                request.onerror = () => reject(request.error);
            }
        });
    }

    // ============================================================================
    // BUSINESS RECORDS STORAGE METHODS
    // ============================================================================

    /**
     * Save business record to local storage
     * @param {Object} record - Business record data
     */
    async saveBusinessRecord(record) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['businessRecords'], 'readwrite');
            const store = transaction.objectStore('businessRecords');

            const recordData = {
                ...record,
                id: record.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: record.date || new Date().toISOString(),
                syncStatus: 'pending'
            };

            const request = store.put(recordData);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Business record saved:', recordData.id);
                resolve(recordData.id);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to save business record:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Retrieve business records from local storage
     * @param {Object} filter - Optional filter criteria
     * @returns {Array} Array of business records
     */
    async getBusinessRecords(filter = {}) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['businessRecords'], 'readonly');
            const store = transaction.objectStore('businessRecords');

            let request;
            if (filter.type) {
                const index = store.index('type');
                request = index.getAll(filter.type);
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => {
                let records = request.result;

                // Apply additional filters
                if (filter.startDate) {
                    records = records.filter(r => new Date(r.date) >= new Date(filter.startDate));
                }
                if (filter.endDate) {
                    records = records.filter(r => new Date(r.date) <= new Date(filter.endDate));
                }

                resolve(records);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to get business records:', request.error);
                reject(request.error);
            };
        });
    }

    // ============================================================================
    // STORAGE MANAGEMENT METHODS
    // ============================================================================

    /**
     * Get storage usage information
     * @returns {Object} Storage usage details
     */
    async getStorageUsage() {
        await this.init();

        try {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

            // Get breakdown by content type
            const courses = await this.listCachedCourses();
            const coursesSize = courses.reduce((sum, c) => sum + (c.size || 0), 0);

            return {
                usage,
                quota,
                percentUsed: Math.round(percentUsed * 100) / 100,
                available: quota - usage,
                breakdown: {
                    courses: coursesSize,
                    // Other breakdowns can be calculated similarly
                }
            };
        } catch (error) {
            console.error('[OfflineStorage] Failed to get storage usage:', error);
            return {
                usage: 0,
                quota: 0,
                percentUsed: 0,
                available: 0,
                breakdown: {}
            };
        }
    }

    /**
     * Clear storage with selective deletion
     * @param {Object} options - Deletion options
     */
    async clearStorage(options = {}) {
        await this.init();

        const stores = [];
        if (options.courses !== false) stores.push('courses');
        if (options.assessments) stores.push('assessments');
        if (options.businessRecords) stores.push('businessRecords');
        // Never clear progress unless explicitly requested
        if (options.progress === true) stores.push('progress');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(stores, 'readwrite');

            stores.forEach(storeName => {
                const store = transaction.objectStore(storeName);
                store.clear();
                console.log('[OfflineStorage] Cleared store:', storeName);
            });

            transaction.oncomplete = () => {
                console.log('[OfflineStorage] Storage cleared successfully');
                resolve();
            };

            transaction.onerror = () => {
                console.error('[OfflineStorage] Failed to clear storage:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('[OfflineStorage] Database connection closed');
        }
    }

    // ============================================================================
    // CERTIFICATE STORAGE METHODS
    // ============================================================================

    /**
     * Save certificate to local storage
     * @param {Object} certificate - Certificate record
     */
    async saveCertificate(certificate) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['certificates'], 'readwrite');
            const store = transaction.objectStore('certificates');

            const request = store.put(certificate);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Certificate saved:', certificate.id);
                resolve();
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to save certificate:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all certificates for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of certificates
     */
    async getCertificates(userId) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['certificates'], 'readonly');
            const store = transaction.objectStore('certificates');
            const index = store.index('userId');

            const request = index.getAll(userId);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Retrieved certificates:', request.result.length);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to get certificates:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get a specific certificate by ID
     * @param {string} certificateId - Certificate ID
     * @returns {Promise<Object|null>} Certificate or null
     */
    async getCertificate(certificateId) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['certificates'], 'readonly');
            const store = transaction.objectStore('certificates');

            const request = store.get(certificateId);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Retrieved certificate:', certificateId);
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to get certificate:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get certificate by verification code
     * @param {string} verificationCode - Verification code
     * @returns {Promise<Object|null>} Certificate or null
     */
    async getCertificateByCode(verificationCode) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['certificates'], 'readonly');
            const store = transaction.objectStore('certificates');
            const index = store.index('verificationCode');

            const request = index.get(verificationCode);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Retrieved certificate by code');
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to get certificate by code:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Update certificate sync status
     * @param {string} certificateId - Certificate ID
     * @param {string} syncStatus - New sync status
     */
    async updateCertificateSyncStatus(certificateId, syncStatus) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['certificates'], 'readwrite');
            const store = transaction.objectStore('certificates');

            const getRequest = store.get(certificateId);

            getRequest.onsuccess = () => {
                const certificate = getRequest.result;
                if (certificate) {
                    certificate.syncStatus = syncStatus;
                    if (syncStatus === 'synced') {
                        certificate.verified = true;
                        certificate.syncedAt = new Date().toISOString();
                    }

                    const putRequest = store.put(certificate);

                    putRequest.onsuccess = () => {
                        console.log('[OfflineStorage] Certificate sync status updated:', certificateId);
                        resolve();
                    };

                    putRequest.onerror = () => {
                        console.error('[OfflineStorage] Failed to update certificate:', putRequest.error);
                        reject(putRequest.error);
                    };
                } else {
                    reject(new Error('Certificate not found'));
                }
            };

            getRequest.onerror = () => {
                console.error('[OfflineStorage] Failed to get certificate:', getRequest.error);
                reject(getRequest.error);
            };
        });
    }

    /**
     * Delete a certificate
     * @param {string} certificateId - Certificate ID
     */
    async deleteCertificate(certificateId) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['certificates'], 'readwrite');
            const store = transaction.objectStore('certificates');

            const request = store.delete(certificateId);

            request.onsuccess = () => {
                console.log('[OfflineStorage] Certificate deleted:', certificateId);
                resolve();
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to delete certificate:', request.error);
                reject(request.error);
            };
        });
    }
}

// Export singleton instance
const offlineStorageManager = new OfflineStorageManager();
export default offlineStorageManager;
