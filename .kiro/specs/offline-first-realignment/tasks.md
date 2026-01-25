# Implementation Plan: Offline-First Realignment

## Overview

This implementation plan transforms SkillBridge into a truly offline-first progressive web application optimized for rural learners with intermittent connectivity. The tasks are organized by priority, starting with foundational Service Worker infrastructure, then offline storage, content delivery, and finally progressive enhancements.

## Tasks

### Phase 1: Service Worker Foundation

- [ ] 1. Implement core Service Worker infrastructure
  - [ ] 1.1 Create custom Service Worker file (public/sw.js)
    - Implement install event handler for caching app shell
    - Cache critical assets: HTML, CSS, JavaScript, fonts, icons
    - Initialize IndexedDB schemas during installation
    - Add version management for cache updates
    - _Requirements: 1.1, 1.5_

  - [ ] 1.2 Implement Service Worker activation
    - Clean up old caches on activation
    - Claim all clients immediately
    - Register background sync capabilities
    - _Requirements: 1.4_

  - [ ] 1.3 Create caching strategies
    - Implement Cache First strategy for static assets
    - Implement Network First with fallback for API calls
    - Add timeout handling (3 seconds) for network requests
    - Create offline fallback pages
    - _Requirements: 1.2, 1.3_

  - [ ] 1.4 Add Service Worker registration and lifecycle management
    - Update src/serviceWorkerRegistration.js with custom SW
    - Implement update notification system
    - Add skipWaiting and clients.claim logic
    - Handle SW update events gracefully
    - _Requirements: 1.4_

  - [ ]* 1.5 Write property test for asset caching completeness
    - **Property 1: Service Worker Asset Caching Completeness**
    - **Validates: Requirements 1.1**

  - [ ]* 1.6 Write property test for offline asset serving
    - **Property 2: Offline Asset Serving**
    - **Validates: Requirements 1.2, 1.3**

- [ ] 2. Implement offline indicator and connectivity detection
  - [ ] 2.1 Enhance OfflineIndicator component
    - Add real-time connectivity status display
    - Show sync queue status (pending items count)
    - Display last successful sync timestamp
    - Add manual sync trigger button
    - _Requirements: 1.6_

  - [ ] 2.2 Create connectivity monitoring service
    - Listen to online/offline events
    - Implement connection quality detection
    - Trigger sync when connectivity restored
    - Notify components of connectivity changes
    - _Requirements: 1.6, 5.1_

- [ ] 3. Checkpoint - Verify Service Worker functionality
  - Test app loads offline after first visit
  - Verify cached assets are served when offline
  - Test Service Worker updates without disruption
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 2: Offline Storage Infrastructure

- [ ] 4. Create IndexedDB storage manager
  - [ ] 4.1 Build OfflineStorageManager service
    - Create src/services/offlineStorage/OfflineStorageManager.js
    - Implement IndexedDB initialization with schema
    - Create object stores: courses, progress, assessments, businessRecords, syncQueue
    - Add indexes for efficient querying
    - _Requirements: 2.1, 2.2_

  - [ ] 4.2 Implement course storage methods
    - Add saveCourse() method for storing course content
    - Add getCourse() method for retrieving cached courses
    - Add deleteCourse() method for storage management
    - Add listCachedCourses() method for inventory
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ] 4.3 Implement progress storage methods
    - Add saveProgress() method with offline support
    - Add getProgress() method for local retrieval
    - Include sync status tracking (synced/pending/conflict)
    - _Requirements: 2.6, 5.2_

  - [ ] 4.4 Implement assessment and business data storage
    - Add saveAssessment() and getAssessment() methods
    - Add saveBusinessRecord() and getBusinessRecords() methods
    - Include filtering and querying capabilities
    - _Requirements: 4.1, 9.1, 9.2_

  - [ ] 4.5 Add storage management utilities
    - Implement getStorageUsage() for quota tracking
    - Add clearStorage() with selective deletion
    - Implement storage quota monitoring
    - Add low storage warnings
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 4.6 Write property test for content download completeness
    - **Property 4: Content Download Completeness**
    - **Validates: Requirements 2.1**

  - [ ]* 4.7 Write property test for offline content round-trip
    - **Property 5: Offline Content Round-Trip**
    - **Validates: Requirements 2.2**

- [ ] 5. Implement Sync Queue Manager
  - [ ] 5.1 Create SyncQueueManager service
    - Create src/services/offlineStorage/SyncQueueManager.js
    - Implement priority queue with enqueue/dequeue methods
    - Add retry logic with exponential backoff
    - Track retry count and max retries (5)
    - _Requirements: 1.7, 5.1, 5.3_

  - [ ] 5.2 Implement sync queue processing
    - Create processSyncQueue() method
    - Process items in priority order (assessment > certificate > progress > business)
    - Implement batch processing for large queues (10 items per batch)
    - Add conflict resolution (prioritize local data)
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 5.3 Add sync status tracking
    - Implement getSyncStatus() method
    - Track successful/failed sync operations
    - Add user notifications for sync completion
    - Create sync history log
    - _Requirements: 5.5, 5.6_

  - [ ]* 5.4 Write property test for offline action queueing
    - **Property 3: Offline Action Queueing**
    - **Validates: Requirements 1.7**

  - [ ]* 5.5 Write property test for automatic sync queue processing
    - **Property 13: Automatic Sync Queue Processing**
    - **Validates: Requirements 5.1, 5.5**

  - [ ]* 5.6 Write property test for sync retry with exponential backoff
    - **Property 14: Sync Retry with Exponential Backoff**
    - **Validates: Requirements 5.3**

- [ ] 6. Checkpoint - Verify offline storage works
  - Test data persists across sessions
  - Verify sync queue processes correctly
  - Test storage quota management
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 3: Content Download and Optimization

- [ ] 7. Create Content Download Manager
  - [x] 7.1 Build ContentDownloadManager service ✅
    - Create src/services/offlineStorage/ContentDownloadManager.js
    - Implement downloadCourse() with progress tracking
    - Add pause/resume/cancel functionality
    - Implement download queue management
    - _Requirements: 2.3_
    - **COMPLETED**: Full implementation with event system, progress tracking, pause/resume/cancel, size estimation

  - [ ] 7.2 Implement image optimization
    - Create optimizeImages() method
    - Generate three quality levels: low (50KB), medium (150KB), high (300KB)
    - Use WebP format with JPEG fallback
    - Store optimized versions in IndexedDB
    - _Requirements: 3.2, 3.4_

  - [ ] 7.3 Add download progress tracking
    - Implement getDownloadProgress() method
    - Create progress event emitter
    - Show download progress in UI
    - Calculate estimated time remaining
    - _Requirements: 2.3_

  - [ ] 7.4 Implement content size estimation
    - Create estimateSize() method
    - Calculate total download size before starting
    - Display size to users for informed decisions
    - _Requirements: 3.7_

  - [ ]* 7.5 Write property test for image optimization constraints
    - **Property 7: Image Optimization Constraints**
    - **Validates: Requirements 3.2**

  - [ ]* 7.6 Write property test for content size estimation accuracy
    - **Property 9: Content Size Estimation Accuracy**
    - **Validates: Requirements 3.7**

- [x] 8. Implement text-first content delivery
  - [ ] 8.1 Update Module model for offline content
    - Add offline-optimized content structure
    - Store text content as primary format (markdown/HTML)
    - Add optimized image references
    - Include video transcripts and key frames
    - _Requirements: 3.1, 3.3_

  - [ ] 8.2 Create content rendering component
    - Build OfflineContentRenderer component
    - Prioritize text display over images
    - Implement progressive image loading
    - Add video transcript display
    - _Requirements: 3.1, 3.4_

  - [ ] 8.3 Add text-only mode option
    - Implement downloadOptions with textOnly flag
    - Skip image downloads in text-only mode
    - Reduce storage footprint significantly
    - _Requirements: 3.5, 11.6_

  - [ ]* 8.4 Write property test for video alternative content
    - **Property 8: Video Alternative Content**
    - **Validates: Requirements 3.3**

- [ ] 9. Checkpoint - Verify content download and optimization
  - Test course downloads complete successfully
  - Verify image optimization meets size constraints
  - Test text-only mode reduces storage usage
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 4: Offline Assessment Engine

- [x] 10. Build offline assessment infrastructure
  - [x] 10.1 Create OfflineAssessmentEngine service ✅
    - Create src/services/offlineStorage/OfflineAssessmentEngine.js
    - Implement loadAssessment() to cache questions locally
    - Add submitAnswer() for offline answer storage
    - Implement saveAssessmentState() for persistence
    - _Requirements: 4.1, 4.6_
    - **COMPLETED**: Full implementation with client-side scoring, learning path generation, state persistence, and sync queue integration

  - [ ] 10.2 Implement client-side assessment scoring
    - Create calculateResults() method
    - Implement skill scoring algorithm (weighted by difficulty)
    - Normalize scores to 0-100 scale
    - Calculate overall score and skill levels
    - _Requirements: 4.2_

  - [ ] 10.3 Build offline learning path generator
    - Create generateLearningPath() method
    - Use locally stored course metadata
    - Generate recommendations based on scores
    - Select appropriate courses for skill levels
    - _Requirements: 4.3_

  - [ ] 10.4 Add assessment sync functionality
    - Mark assessment for sync when connectivity returns
    - Upload results to server with sync queue
    - Update sync status after successful upload
    - _Requirements: 4.4_

  - [ ]* 10.5 Write property test for offline assessment round-trip
    - **Property 10: Offline Assessment Round-Trip**
    - **Validates: Requirements 4.2**

  - [ ]* 10.6 Write property test for learning path generation offline
    - **Property 11: Learning Path Generation Offline**
    - **Validates: Requirements 4.3**

  - [ ]* 10.7 Write property test for assessment data sync
    - **Property 12: Assessment Data Sync**
    - **Validates: Requirements 4.4**

- [ ] 11. Update SkillsAssessment component for offline
  - [ ] 11.1 Modify SkillsAssessment.js for offline support
    - Use OfflineAssessmentEngine instead of API calls
    - Store answers locally during assessment
    - Calculate results client-side
    - Queue results for sync
    - _Requirements: 4.1, 4.2_

  - [ ] 11.2 Add offline assessment indicators
    - Show "Offline Mode" badge during assessment
    - Display sync status after completion
    - Notify when results are synced
    - _Requirements: 4.4_

- [x] 12. Checkpoint - Verify offline assessment works ✅
  - Test assessment completes entirely offline
  - Verify results match server calculations
  - Test learning path generation offline
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 5: Offline Certificate Generation

- [x] 13. Implement client-side certificate generation ✅
  - [x] 13.1 Create OfflineCertificateGenerator service ✅
    - Create src/services/offlineStorage/OfflineCertificateGenerator.js
    - Integrate jsPDF library for PDF generation
    - Implement generateCertificate() method
    - Create certificate template with styling
    - _Requirements: 7.1, 7.2_

  - [x] 13.2 Build certificate generation logic ✅
    - Add user name, course name, completion date
    - Generate unique verification code
    - Include skills acquired list
    - Add SkillBridge branding and styling
    - _Requirements: 7.1, 7.2_

  - [x] 13.3 Implement certificate storage and retrieval ✅
    - Add saveCertificate() to store locally
    - Add getCertificates() for user's certificate list
    - Track sync status (pending/verified)
    - _Requirements: 7.6_

  - [x] 13.4 Add certificate sync functionality ✅
    - Mark certificates for sync with markForSync()
    - Upload certificate records when online
    - Update verification status after sync
    - Provide shareable verification URL
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ]* 13.5 Write property test for offline certificate generation
    - **Property 20: Offline Certificate Generation**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 13.6 Write property test for certificate sync and verification
    - **Property 21: Certificate Sync and Verification**
    - **Validates: Requirements 7.3, 7.4, 7.5**

- [x] 14. Update Certificates page for offline ✅
  - [x] 14.1 Modify Certificates.js component ✅
    - Use OfflineCertificateGenerator for generation
    - Display certificates from local storage
    - Show sync status for each certificate
    - Add "Generate Offline" button
    - _Requirements: 7.1, 7.6_

  - [x] 14.2 Update LearningPath completion flow ✅
    - Trigger offline certificate generation on course completion
    - Store certificate locally immediately
    - Queue for sync when online
    - _Requirements: 7.1, 7.3_

- [ ] 15. Checkpoint - Verify offline certificate generation
  - Test certificates generate offline
  - Verify PDF includes all required fields
  - Test certificate sync when online
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 6: Bandwidth Detection and Adaptive Content

- [ ] 16. Create bandwidth detection service
  - [ ] 16.1 Build BandwidthDetector service
    - Create src/services/offlineStorage/BandwidthDetector.js
    - Implement detectSpeed() using Network Information API
    - Add fallback speed test (download small file)
    - Classify connections: offline, slow (<256Kbps), moderate (256Kbps-1Mbps), fast (>1Mbps)
    - _Requirements: 6.1_

  - [ ] 16.2 Implement connection monitoring
    - Add monitorConnection() for continuous monitoring
    - Create event emitter for speed changes
    - Update quality settings dynamically
    - _Requirements: 6.5_

  - [ ] 16.3 Add quality adaptation methods
    - Implement getOptimalImageQuality() based on speed
    - Add shouldLoadVideo() decision logic
    - Create getRecommendedChunkSize() for downloads
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ]* 16.4 Write property test for bandwidth-adaptive image quality
    - **Property 17: Bandwidth-Adaptive Image Quality**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 17. Implement adaptive content loading
  - [ ] 17.1 Update image loading components
    - Modify AIImage component to use BandwidthDetector
    - Serve appropriate quality based on connection speed
    - Implement progressive loading with placeholders
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ] 17.2 Add user preference override
    - Create quality settings in user profile
    - Allow manual quality selection (low/medium/high)
    - Respect user preference over auto-detection
    - _Requirements: 6.6_

  - [ ] 17.3 Implement content fallback logic
    - Serve cached version when load fails
    - Fall back to text-only on poor connectivity
    - Display appropriate error messages
    - _Requirements: 6.7_

  - [ ]* 17.4 Write property test for user preference override
    - **Property 18: User Preference Override**
    - **Validates: Requirements 6.6**

  - [ ]* 17.5 Write property test for content fallback on load failure
    - **Property 19: Content Fallback on Load Failure**
    - **Validates: Requirements 6.7**

- [ ] 18. Checkpoint - Verify adaptive content loading
  - Test bandwidth detection accuracy
  - Verify image quality adapts to connection speed
  - Test user preference override works
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 7: Offline Business Tools

- [ ] 19. Implement offline business data storage
  - [ ] 19.1 Update BusinessTools component for offline
    - Modify src/pages/BusinessTools.js to use local storage
    - Store all business records in IndexedDB
    - Queue changes for sync when online
    - _Requirements: 9.1, 9.2_

  - [ ] 19.2 Add offline report generation
    - Implement client-side PDF generation for reports
    - Use jsPDF for financial reports
    - Generate reports from local data
    - _Requirements: 9.3_

  - [ ] 19.3 Implement offline data export
    - Add CSV export functionality
    - Add PDF export for reports
    - Export directly from IndexedDB
    - _Requirements: 9.6_

  - [ ] 19.4 Add business data sync
    - Queue all business records for sync
    - Prioritize by type and timestamp
    - Handle conflicts (prioritize local data)
    - _Requirements: 9.4, 9.7_

  - [ ]* 19.5 Write property test for business data offline persistence
    - **Property 24: Business Data Offline Persistence**
    - **Validates: Requirements 9.1, 9.2, 9.4**

- [ ] 20. Checkpoint - Verify offline business tools
  - Test business tools work entirely offline
  - Verify reports generate correctly
  - Test data export functionality
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 8: Offline-First User Journey

- [ ] 21. Implement first-time user onboarding
  - [ ] 21.1 Create offline onboarding flow
    - Build OnboardingWizard component
    - Guide users through initial content download
    - Prioritize essential resources (assessment, first course, business basics)
    - Show download progress and estimated time
    - _Requirements: 8.1, 8.2_

  - [ ] 21.2 Implement offline registration
    - Allow user registration without connectivity
    - Store credentials securely in IndexedDB
    - Queue registration for sync when online
    - _Requirements: 8.4_

  - [ ] 21.3 Add offline authentication
    - Implement local credential verification
    - Use stored credentials for offline login
    - Sync authentication state when online
    - _Requirements: 8.5_

  - [ ] 21.4 Create content availability indicators
    - Show which content is available offline
    - Display download status for each course
    - Add "Download for Offline" buttons
    - _Requirements: 8.6_

  - [ ]* 21.5 Write property test for initial content download prioritization
    - **Property 22: Initial Content Download Prioritization**
    - **Validates: Requirements 8.2**

  - [ ]* 21.6 Write property test for offline registration and authentication
    - **Property 23: Offline Registration and Authentication**
    - **Validates: Requirements 8.4, 8.5**

- [ ] 22. Checkpoint - Verify offline-first user journey
  - Test new user can complete onboarding offline
  - Verify offline registration and login work
  - Test content availability indicators
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 9: Progressive Enhancement for Online Features

- [ ] 23. Implement progressive enhancement framework
  - [ ] 23.1 Create feature detection service
    - Build OnlineFeatureManager service
    - Detect online/offline state
    - Enable/disable features based on connectivity
    - _Requirements: 10.1, 10.2_

  - [ ] 23.2 Add graceful feature degradation
    - Disable AI chatbot when offline (show FAQ)
    - Show cached analytics when offline
    - Display cached community content
    - Add clear messaging for unavailable features
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 23.3 Implement smooth online/offline transitions
    - Update UI without jarring changes
    - Fade in/out online-only features
    - Show transition animations
    - _Requirements: 10.7_

- [ ] 24. Update ChatWidget for offline mode
  - [ ] 24.1 Add offline FAQ system
    - Create local FAQ database
    - Implement keyword-based search
    - Display relevant FAQs when offline
    - _Requirements: 10.4_

  - [ ] 24.2 Update ChatWidget component
    - Detect online/offline state
    - Switch between AI and FAQ mode
    - Show appropriate messaging
    - _Requirements: 10.4_

- [ ] 25. Checkpoint - Verify progressive enhancement
  - Test features gracefully degrade offline
  - Verify smooth transitions between states
  - Test offline FAQ system
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 10: Storage Management and Performance

- [ ] 26. Implement storage management UI
  - [ ] 26.1 Create StorageManagement component
    - Build storage usage dashboard
    - Show breakdown by content type
    - Display available space
    - Add storage quota warnings
    - _Requirements: 11.1, 11.2_

  - [ ] 26.2 Add content management features
    - Implement selective course deletion
    - Preserve progress data when deleting content
    - Add "Clear Cache" functionality
    - Implement minimal mode for low storage
    - _Requirements: 11.3, 11.4, 11.6, 11.7_

  - [ ] 26.3 Create storage estimation tools
    - Show download size before committing
    - Estimate space needed for courses
    - Warn if insufficient space
    - _Requirements: 11.5_

  - [ ]* 26.4 Write property test for storage usage tracking
    - **Property 25: Storage Usage Tracking**
    - **Validates: Requirements 11.1**

- [ ] 27. Implement performance optimizations
  - [ ] 27.1 Optimize offline load performance
    - Implement lazy loading for components
    - Use code splitting for routes
    - Minimize bundle sizes
    - Target <1s first meaningful content
    - _Requirements: 12.1, 12.2_

  - [ ] 27.2 Add progressive image loading
    - Display text immediately
    - Load images progressively
    - Use low-quality placeholders
    - _Requirements: 12.3_

  - [ ] 27.3 Optimize for low-end devices
    - Implement memory management
    - Unload unused content
    - Optimize for <2GB RAM devices
    - _Requirements: 12.4_

  - [ ] 27.4 Optimize interaction responsiveness
    - Target <100ms response time
    - Use debouncing for inputs
    - Implement optimistic UI updates
    - _Requirements: 12.5_

  - [ ]* 27.5 Write property test for offline load performance
    - **Property 26: Offline Load Performance**
    - **Validates: Requirements 12.1, 12.2**

- [ ] 28. Checkpoint - Verify storage management and performance
  - Test storage management UI works correctly
  - Verify performance meets targets
  - Test on low-end devices
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 11: Integration and Testing

- [ ] 29. Implement comprehensive error handling
  - [ ] 29.1 Add cache storage failure handling
    - Implement retry with exponential backoff
    - Log failures to IndexedDB
    - Display user-friendly error messages
    - Fall back to network-only mode if needed
    - _Requirements: 1.5_

  - [ ] 29.2 Handle IndexedDB quota exceeded
    - Detect quota exceeded errors
    - Show storage management UI
    - Suggest content to remove
    - Prevent new downloads until space freed
    - _Requirements: 11.2_

  - [ ] 29.3 Implement corrupted data recovery
    - Detect data corruption via checksums
    - Isolate corrupted records
    - Re-download corrupted content when online
    - Preserve user progress at all costs
    - _Requirements: 2.7_

  - [ ] 29.4 Add sync conflict resolution
    - Prioritize local data over server data
    - Log conflicts for admin review
    - Merge non-conflicting fields
    - Provide manual resolution UI for critical data
    - _Requirements: 5.2_

- [ ] 30. Create offline testing utilities
  - [ ] 30.1 Build offline simulation tools
    - Create test utilities for offline mode
    - Implement network throttling helpers
    - Add IndexedDB inspection tools
    - _Requirements: All_

  - [ ] 30.2 Add performance monitoring
    - Implement custom performance metrics
    - Track offline operation times
    - Monitor storage usage
    - Log sync performance
    - _Requirements: 12.1-12.7_

- [ ] 31. Update documentation
  - [ ] 31.1 Create offline-first user guide
    - Document offline capabilities
    - Explain download and sync process
    - Provide troubleshooting tips
    - _Requirements: All_

  - [ ] 31.2 Update developer documentation
    - Document offline architecture
    - Explain Service Worker implementation
    - Provide testing guidelines
    - _Requirements: All_

- [ ] 32. Final checkpoint - End-to-end offline testing
  - Test complete offline user journey
  - Verify all features work without connectivity
  - Test sync when connectivity restored
  - Verify performance meets all targets
  - Test on various devices and network conditions
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each phase
- Priority: Service Worker → Storage → Content → Assessment → Certificates → Enhancements
- All offline features must work without any network connectivity
- Sync should be automatic and transparent to users
- Performance targets are critical for low-end devices

## Dependencies

- jsPDF library for certificate generation
- Dexie.js (already used) for IndexedDB management
- Workbox (optional) for advanced Service Worker features

## Success Criteria

- App loads and functions entirely offline after first visit
- All learning content accessible offline
- Assessment completes and generates learning path offline
- Certificates generate offline
- Business tools work offline
- Progress syncs automatically when online
- Performance meets all targets (<1s offline load, <200ms navigation)
