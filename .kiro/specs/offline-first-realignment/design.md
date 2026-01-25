# Design Document

## Overview

This design document outlines the technical architecture for transforming SkillBridge into a truly offline-first progressive web application. The current implementation relies heavily on online connectivity for core features (AI assessments, video streaming, real-time sync), making it unsuitable for rural areas with intermittent connectivity. This redesign prioritizes local-first data storage, lightweight content delivery, and progressive enhancement to ensure the entire learning journey works offline.

The offline-first approach follows these principles:
1. **Local First**: All essential data stored in IndexedDB, cloud as backup
2. **Progressive Enhancement**: Core features work offline, enhanced features available online
3. **Bandwidth Efficiency**: Text and optimized images instead of videos
4. **Resilient Sync**: Background synchronization with conflict resolution
5. **Performance**: Fast load times on older devices with limited resources

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │ Service      │  │  IndexedDB   │     │
│  │  Components  │←→│  Worker      │←→│   Storage    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↕                  ↕                                 │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Offline-First Data Layer                 │      │
│  │  • Local Storage Manager                         │      │
│  │  • Sync Queue                                    │      │
│  │  • Cache Manager                                 │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           ↕
              (When connectivity available)
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   REST API   │  │   MongoDB    │  │  File Store  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Service Worker Architecture

The Service Worker is the foundation of offline functionality:


```
Service Worker Layers:
┌─────────────────────────────────────────────────────────────┐
│  Install Phase                                               │
│  • Cache app shell (HTML, CSS, JS)                          │
│  • Cache critical assets (fonts, icons)                     │
│  • Initialize IndexedDB schemas                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Activate Phase                                              │
│  • Clean up old caches                                       │
│  • Claim all clients                                         │
│  • Register background sync                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Fetch Phase (Runtime)                                       │
│  • Intercept all network requests                            │
│  • Apply caching strategies:                                 │
│    - Cache First: App shell, static assets                   │
│    - Network First: API calls (with cache fallback)          │
│    - Cache Only: Offline-downloaded content                  │
│  • Queue failed requests for sync                            │
└─────────────────────────────────────────────────────────────┘
```

### Caching Strategies

**Cache First (for static assets)**:
```javascript
// Pseudocode
function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return cached || offlineFallback;
  }
}
```

**Network First with Cache Fallback (for dynamic content)**:
```javascript
// Pseudocode
function networkFirst(request) {
  try {
    const response = await fetch(request, { timeout: 3000 });
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || offlineFallback;
  }
}
```


## Components and Interfaces

### 1. Offline Storage Manager

**Purpose**: Manages all local data storage using IndexedDB

**Interface**:
```typescript
interface OfflineStorageManager {
  // Course content
  saveCourse(courseId: string, content: CourseContent): Promise<void>;
  getCourse(courseId: string): Promise<CourseContent | null>;
  deleteCourse(courseId: string): Promise<void>;
  listCachedCourses(): Promise<CourseMetadata[]>;
  
  // User progress
  saveProgress(userId: string, progress: Progress): Promise<void>;
  getProgress(userId: string): Promise<Progress | null>;
  
  // Assessment data
  saveAssessment(assessment: Assessment): Promise<void>;
  getAssessment(): Promise<Assessment | null>;
  
  // Business data
  saveBusinessRecord(record: BusinessRecord): Promise<void>;
  getBusinessRecords(filter?: Filter): Promise<BusinessRecord[]>;
  
  // Storage management
  getStorageUsage(): Promise<StorageInfo>;
  clearStorage(options?: ClearOptions): Promise<void>;
}
```

**IndexedDB Schema**:
```javascript
// Database: skillbridge-offline
// Version: 1

// Object Stores:
{
  courses: {
    keyPath: 'id',
    indexes: ['title', 'category', 'downloadDate']
  },
  progress: {
    keyPath: 'userId',
    indexes: ['lastUpdated', 'syncStatus']
  },
  assessments: {
    keyPath: 'id',
    indexes: ['completedDate', 'syncStatus']
  },
  businessRecords: {
    keyPath: 'id',
    indexes: ['type', 'date', 'syncStatus']
  },
  syncQueue: {
    keyPath: 'id',
    indexes: ['timestamp', 'priority', 'retryCount']
  }
}
```


### 2. Sync Queue Manager

**Purpose**: Manages background synchronization of offline actions

**Interface**:
```typescript
interface SyncQueueManager {
  // Queue operations
  enqueue(action: SyncAction): Promise<void>;
  dequeue(): Promise<SyncAction | null>;
  peek(): Promise<SyncAction[]>;
  
  // Sync execution
  processSyncQueue(): Promise<SyncResult>;
  retryFailed(): Promise<void>;
  
  // Status
  getSyncStatus(): Promise<SyncStatus>;
  clearCompleted(): Promise<void>;
}

interface SyncAction {
  id: string;
  type: 'progress' | 'assessment' | 'business' | 'certificate';
  data: any;
  timestamp: number;
  priority: number;
  retryCount: number;
  maxRetries: number;
}
```

**Sync Strategy**:
```
Priority Queue (highest to lowest):
1. Assessment completions (priority: 10)
2. Certificate generations (priority: 9)
3. Progress updates (priority: 5)
4. Business records (priority: 3)

Retry Logic:
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Max retries: 5
- After max retries: Mark as failed, notify user
```

### 3. Content Download Manager

**Purpose**: Handles downloading and caching of course content

**Interface**:
```typescript
interface ContentDownloadManager {
  // Download operations
  downloadCourse(courseId: string, options?: DownloadOptions): Promise<void>;
  pauseDownload(courseId: string): Promise<void>;
  resumeDownload(courseId: string): Promise<void>;
  cancelDownload(courseId: string): Promise<void>;
  
  // Progress tracking
  getDownloadProgress(courseId: string): Promise<DownloadProgress>;
  onProgress(callback: (progress: DownloadProgress) => void): void;
  
  // Content optimization
  estimateSize(courseId: string): Promise<number>;
  optimizeImages(images: Image[]): Promise<OptimizedImage[]>;
}

interface DownloadOptions {
  quality: 'low' | 'medium' | 'high';
  includeVideos: boolean;
  includeImages: boolean;
  textOnly: boolean;
}
```


### 4. Offline Assessment Engine

**Purpose**: Runs skills assessments entirely offline

**Interface**:
```typescript
interface OfflineAssessmentEngine {
  // Assessment execution
  loadAssessment(): Promise<Assessment>;
  submitAnswer(questionId: string, answer: Answer): Promise<void>;
  calculateResults(): Promise<AssessmentResults>;
  
  // Learning path generation
  generateLearningPath(results: AssessmentResults): Promise<LearningPath>;
  
  // Persistence
  saveAssessmentState(): Promise<void>;
  loadAssessmentState(): Promise<AssessmentState | null>;
}

interface AssessmentResults {
  overallScore: number;
  skillLevels: {
    digitalLiteracy: number;
    businessSkills: number;
    technicalSkills: number;
  };
  recommendations: string[];
  suggestedCourses: string[];
}
```

**Assessment Algorithm** (runs client-side):
```javascript
// Pseudocode for offline assessment scoring
function calculateAssessmentResults(answers) {
  const skillScores = {
    digitalLiteracy: 0,
    businessSkills: 0,
    technicalSkills: 0
  };
  
  // Weight each answer by question difficulty
  for (const answer of answers) {
    const question = getQuestion(answer.questionId);
    const isCorrect = validateAnswer(answer, question.correctAnswer);
    const weight = question.difficulty; // 1-5
    
    if (isCorrect) {
      skillScores[question.category] += weight;
    }
  }
  
  // Normalize scores to 0-100
  const maxScores = calculateMaxScores(questions);
  for (const skill in skillScores) {
    skillScores[skill] = (skillScores[skill] / maxScores[skill]) * 100;
  }
  
  // Generate recommendations based on scores
  const recommendations = generateRecommendations(skillScores);
  const suggestedCourses = selectCourses(skillScores);
  
  return {
    overallScore: average(Object.values(skillScores)),
    skillLevels: skillScores,
    recommendations,
    suggestedCourses
  };
}
```


### 5. Offline Certificate Generator

**Purpose**: Generates PDF certificates client-side

**Interface**:
```typescript
interface OfflineCertificateGenerator {
  // Certificate generation
  generateCertificate(data: CertificateData): Promise<Blob>;
  saveCertificate(certificate: Certificate): Promise<void>;
  getCertificates(userId: string): Promise<Certificate[]>;
  
  // Verification
  generateVerificationCode(certificate: Certificate): string;
  markForSync(certificateId: string): Promise<void>;
}

interface CertificateData {
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  completionDate: Date;
  skillsAcquired: string[];
}
```

**Certificate Generation** (using jsPDF):
```javascript
// Pseudocode for client-side PDF generation
function generateCertificatePDF(data) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add certificate template
  pdf.setFillColor(240, 248, 255); // Light blue background
  pdf.rect(0, 0, 297, 210, 'F');
  
  // Add border
  pdf.setDrawColor(0, 102, 204);
  pdf.setLineWidth(2);
  pdf.rect(10, 10, 277, 190);
  
  // Add title
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certificate of Completion', 148.5, 50, { align: 'center' });
  
  // Add recipient name
  pdf.setFontSize(24);
  pdf.text(data.userName, 148.5, 80, { align: 'center' });
  
  // Add course details
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`has successfully completed`, 148.5, 100, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.courseName, 148.5, 115, { align: 'center' });
  
  // Add date and verification code
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Date: ${formatDate(data.completionDate)}`, 148.5, 140, { align: 'center' });
  pdf.text(`Verification Code: ${data.verificationCode}`, 148.5, 150, { align: 'center' });
  
  return pdf.output('blob');
}
```


### 6. Bandwidth Detector

**Purpose**: Detects network speed and adapts content quality

**Interface**:
```typescript
interface BandwidthDetector {
  // Detection
  detectSpeed(): Promise<ConnectionSpeed>;
  monitorConnection(): void;
  onSpeedChange(callback: (speed: ConnectionSpeed) => void): void;
  
  // Adaptation
  getOptimalImageQuality(): ImageQuality;
  shouldLoadVideo(): boolean;
  getRecommendedChunkSize(): number;
}

type ConnectionSpeed = 'offline' | 'slow' | 'moderate' | 'fast';
type ImageQuality = 'low' | 'medium' | 'high';
```

**Speed Detection Algorithm**:
```javascript
// Pseudocode for bandwidth detection
async function detectConnectionSpeed() {
  if (!navigator.onLine) return 'offline';
  
  // Use Network Information API if available
  if ('connection' in navigator) {
    const connection = navigator.connection;
    const effectiveType = connection.effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'slow'; // < 256 Kbps
    } else if (effectiveType === '3g') {
      return 'moderate'; // 256 Kbps - 1 Mbps
    } else {
      return 'fast'; // > 1 Mbps
    }
  }
  
  // Fallback: Download small test file
  const startTime = Date.now();
  const testSize = 50000; // 50 KB
  
  try {
    await fetch('/test-file.bin', { cache: 'no-store' });
    const duration = (Date.now() - startTime) / 1000; // seconds
    const speedKbps = (testSize * 8) / duration / 1000;
    
    if (speedKbps < 256) return 'slow';
    if (speedKbps < 1000) return 'moderate';
    return 'fast';
  } catch (error) {
    return 'offline';
  }
}
```


## Data Models

### Course Content Model (Optimized for Offline)

```typescript
interface OfflineCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDuration: number; // minutes
  
  // Metadata
  downloadDate: Date;
  lastUpdated: Date;
  version: string;
  size: number; // bytes
  
  // Content (text-first)
  modules: OfflineModule[];
  
  // Sync status
  syncStatus: 'synced' | 'pending' | 'conflict';
}

interface OfflineModule {
  id: string;
  title: string;
  order: number;
  
  // Text content (primary)
  content: {
    type: 'markdown' | 'html';
    text: string;
  };
  
  // Images (optimized)
  images: OptimizedImage[];
  
  // Optional video (with text alternative)
  video?: {
    url: string; // Only if online
    transcript: string; // Always available
    keyFrames: string[]; // Base64 encoded thumbnails
  };
  
  // Interactive elements
  exercises: Exercise[];
  quiz: Quiz;
}

interface OptimizedImage {
  id: string;
  alt: string;
  caption?: string;
  
  // Multiple quality levels
  versions: {
    low: string; // Base64 or blob URL, max 50KB
    medium: string; // Base64 or blob URL, max 150KB
    high: string; // Base64 or blob URL, max 300KB
  };
  
  // Metadata
  originalSize: number;
  optimizedSize: number;
  format: 'webp' | 'jpeg';
}
```


### Progress Tracking Model

```typescript
interface OfflineProgress {
  userId: string;
  lastUpdated: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
  
  // Course progress
  courses: {
    [courseId: string]: {
      status: 'not_started' | 'in_progress' | 'completed';
      completedModules: string[];
      currentModule: string;
      timeSpent: number; // minutes
      lastAccessed: Date;
      quizScores: { [moduleId: string]: number };
    };
  };
  
  // Overall stats
  totalTimeSpent: number;
  coursesCompleted: number;
  certificatesEarned: number;
  
  // Achievements (calculated offline)
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: Date;
  icon: string; // Base64 encoded
}
```

### Business Tools Data Model

```typescript
interface BusinessRecord {
  id: string;
  userId: string;
  type: 'transaction' | 'customer' | 'inventory' | 'expense';
  createdDate: Date;
  modifiedDate: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
  
  // Type-specific data
  data: TransactionData | CustomerData | InventoryData | ExpenseData;
}

interface TransactionData {
  amount: number;
  currency: string;
  description: string;
  category: string;
  paymentMethod: string;
  customerId?: string;
}

interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  lastPurchaseDate?: Date;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Service Worker Asset Caching Completeness

*For any* first load of the application with connectivity, all essential application assets (HTML, CSS, JavaScript, fonts, icons) should be present in the cache after the Service Worker installation completes.

**Validates: Requirements 1.1**

### Property 2: Offline Asset Serving

*For any* cached asset, when the user is offline, the Service Worker should serve the asset from cache without attempting network requests or showing connection errors.

**Validates: Requirements 1.2, 1.3**

### Property 3: Offline Action Queueing

*For any* user action performed while offline (progress update, assessment completion, business record), the action should be added to the Sync_Queue with appropriate metadata (timestamp, priority, retry count).

**Validates: Requirements 1.7**

### Property 4: Content Download Completeness

*For any* course enrollment with connectivity, all course materials (modules, images, exercises, quizzes) should be stored in IndexedDB after the download completes.

**Validates: Requirements 2.1**

### Property 5: Offline Content Round-Trip

*For any* course downloaded while online, accessing the course content while offline should serve all materials from local storage without network requests.

**Validates: Requirements 2.2**

### Property 6: Progress Persistence and Sync

*For any* module completion while offline, the progress should be saved to local storage immediately and synced to the server when connectivity is restored, with local data taking precedence in conflicts.

**Validates: Requirements 2.6, 5.2**

### Property 7: Image Optimization Constraints

*For any* image included in course content, the optimized versions should meet size constraints: low quality ≤ 50KB, medium quality ≤ 150KB, high quality ≤ 300KB.

**Validates: Requirements 3.2**

### Property 8: Video Alternative Content

*For any* video included in course content, a text transcript and at least one key frame image should be available for offline access.

**Validates: Requirements 3.3**


### Property 9: Content Size Estimation Accuracy

*For any* course, the estimated download size displayed to users should be within 10% of the actual download size.

**Validates: Requirements 3.7**

### Property 10: Offline Assessment Round-Trip

*For any* skills assessment completed offline, the results should be calculated locally using client-side algorithms and match the results that would be calculated by the server (within acceptable variance for floating-point calculations).

**Validates: Requirements 4.2**

### Property 11: Learning Path Generation Offline

*For any* assessment results generated offline, a personalized learning path should be created using locally stored course metadata without requiring server communication.

**Validates: Requirements 4.3**

### Property 12: Assessment Data Sync

*For any* assessment completed offline, when connectivity is restored, the assessment results should be synced to the server and marked as synced in local storage.

**Validates: Requirements 4.4**

### Property 13: Automatic Sync Queue Processing

*For any* pending items in the Sync_Queue, when connectivity is restored, all items should be processed in priority order (highest priority first) and removed from the queue upon successful sync.

**Validates: Requirements 5.1, 5.5**

### Property 14: Sync Retry with Exponential Backoff

*For any* sync operation that fails due to server errors, the system should retry with exponential backoff (1s, 2s, 4s, 8s, 16s) up to a maximum of 5 retries before marking as failed.

**Validates: Requirements 5.3**

### Property 15: Sync Batching for Large Datasets

*For any* sync queue containing more than 10 items, the system should batch requests into groups of 10 to avoid overwhelming the server.

**Validates: Requirements 5.4**

### Property 16: Non-Blocking Sync

*For any* sync operation in progress, the user interface should remain responsive and allow users to continue working without blocking interactions.

**Validates: Requirements 5.6**

### Property 17: Bandwidth-Adaptive Image Quality

*For any* detected network speed (slow, moderate, fast), the system should serve the appropriate image quality (low, medium, high respectively) matching the speed classification.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**


### Property 18: User Preference Override

*For any* user-specified quality preference, the system should serve content at that quality level regardless of detected network speed.

**Validates: Requirements 6.6**

### Property 19: Content Fallback on Load Failure

*For any* content that fails to load due to poor connectivity, the system should serve the cached version if available, or display a text-only alternative.

**Validates: Requirements 6.7**

### Property 20: Offline Certificate Generation

*For any* course completion while offline, the system should generate a PDF certificate locally containing all required fields (user name, course name, completion date, verification code).

**Validates: Requirements 7.1, 7.2**

### Property 21: Certificate Sync and Verification

*For any* certificate generated offline, when connectivity is restored, the certificate record should be uploaded to the server and the verification status should be updated from "pending verification" to "verified".

**Validates: Requirements 7.3, 7.4, 7.5**

### Property 22: Initial Content Download Prioritization

*For any* first-time user download, essential resources (assessment, first course, business tools basics) should be downloaded before optional content.

**Validates: Requirements 8.2**

### Property 23: Offline Registration and Authentication

*For any* user registration performed offline, a local account should be created with credentials stored securely in IndexedDB, and authentication should work offline using locally stored credentials.

**Validates: Requirements 8.4, 8.5**

### Property 24: Business Data Offline Persistence

*For any* business record (transaction, customer, inventory, expense) created offline, the record should be stored in IndexedDB and synced to the server when connectivity returns.

**Validates: Requirements 9.1, 9.2, 9.4**

### Property 25: Storage Usage Tracking

*For any* content stored locally, the system should accurately track storage usage by content type and display the total to users within 5% accuracy.

**Validates: Requirements 11.1**

### Property 26: Offline Load Performance

*For any* page navigation while offline, the first meaningful content should be displayed within 1 second, and page transitions should complete within 200ms.

**Validates: Requirements 12.1, 12.2**


## Error Handling

### Offline Error Scenarios

**1. Cache Storage Failure**
- **Scenario**: Service Worker fails to cache critical assets
- **Handling**: 
  - Retry with exponential backoff (1s, 2s, 4s, 8s, 16s)
  - Log failure details to IndexedDB for diagnostics
  - Display user-friendly error message with retry option
  - Fall back to network-only mode if caching repeatedly fails

**2. IndexedDB Storage Quota Exceeded**
- **Scenario**: Device runs out of storage space
- **Handling**:
  - Detect quota exceeded error
  - Notify user with storage management UI
  - Suggest content to remove (oldest, least accessed)
  - Offer text-only mode for new downloads
  - Prevent new downloads until space is freed

**3. Corrupted Local Data**
- **Scenario**: IndexedDB data becomes corrupted
- **Handling**:
  - Detect corruption through checksum validation
  - Isolate corrupted records
  - Attempt to recover from backup if available
  - Re-download corrupted content when online
  - Preserve user progress data at all costs

**4. Sync Conflicts**
- **Scenario**: Local and server data differ
- **Handling**:
  - Always prioritize local data (user's device is source of truth)
  - Log conflicts for admin review
  - Merge non-conflicting fields when possible
  - Notify user of conflict resolution
  - Provide manual conflict resolution UI for critical data

**5. Network Timeout During Sync**
- **Scenario**: Sync operation times out
- **Handling**:
  - Set reasonable timeout (30 seconds for sync operations)
  - Retry with exponential backoff
  - Keep data in sync queue
  - Allow user to continue working
  - Notify user of sync status

**6. Service Worker Update Failure**
- **Scenario**: New Service Worker fails to install
- **Handling**:
  - Keep old Service Worker active
  - Retry update on next page load
  - Log update failure for diagnostics
  - Don't disrupt user experience
  - Notify user of update availability when successful


## Testing Strategy

### Dual Testing Approach

This implementation requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Specific offline scenarios (e.g., "user completes module while offline")
- Error handling paths (e.g., "cache storage fails")
- UI component behavior (e.g., "offline indicator displays correctly")
- Integration points between components

**Property-Based Tests**: Verify universal properties across all inputs
- Service Worker caching behavior across all asset types
- Sync queue processing for any number of queued items
- Content download and retrieval for any course
- Offline authentication for any valid credentials
- Storage management for any content size

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property-based tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Testing Library**: fast-check (JavaScript property-based testing library)

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: offline-first-realignment, Property {number}: {property_text}`

**Example Property Test Structure**:
```javascript
// Feature: offline-first-realignment, Property 2: Offline Asset Serving
describe('Offline Asset Serving', () => {
  it('should serve any cached asset from cache when offline', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(assetGenerator(), { minLength: 1, maxLength: 50 }),
        async (assets) => {
          // Setup: Cache all assets
          await cacheAssets(assets);
          
          // Action: Go offline and request each asset
          setNetworkStatus('offline');
          
          for (const asset of assets) {
            const response = await fetch(asset.url);
            
            // Verify: Asset served from cache
            expect(response.ok).toBe(true);
            expect(response.headers.get('x-cache')).toBe('HIT');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```


### Unit Testing Strategy

**Critical Unit Test Areas**:

1. **Service Worker Lifecycle**
   - Install event handling
   - Activate event handling
   - Fetch event interception
   - Cache versioning and cleanup

2. **IndexedDB Operations**
   - CRUD operations for each object store
   - Transaction handling
   - Error recovery
   - Migration between schema versions

3. **Sync Queue Management**
   - Enqueue/dequeue operations
   - Priority ordering
   - Retry logic
   - Conflict resolution

4. **Content Download**
   - Download progress tracking
   - Pause/resume functionality
   - Image optimization
   - Size estimation

5. **Offline Assessment**
   - Question loading
   - Answer validation
   - Score calculation
   - Learning path generation

6. **Certificate Generation**
   - PDF creation
   - Template rendering
   - Verification code generation
   - Local storage

7. **Bandwidth Detection**
   - Speed classification
   - Quality adaptation
   - Fallback behavior

### Integration Testing

**Critical Integration Flows**:

1. **First-Time User Journey**
   - Landing → Registration (offline) → Content Download → Assessment → Learning

2. **Offline Learning Flow**
   - Course Access → Module Completion → Progress Save → Certificate Generation

3. **Sync Flow**
   - Offline Actions → Connectivity Restored → Sync Queue Processing → Conflict Resolution

4. **Content Update Flow**
   - New Content Available → Download → Cache Update → User Notification

### Performance Testing

**Key Performance Metrics**:

- **First Load (Online)**: < 3 seconds to interactive
- **First Load (Offline)**: < 1 second to interactive
- **Page Navigation (Offline)**: < 200ms
- **Content Download**: Progress updates every 500ms
- **Sync Operation**: Complete within 30 seconds for 100 items
- **Certificate Generation**: < 5 seconds
- **Assessment Scoring**: < 2 seconds

**Performance Testing Tools**:
- Lighthouse for PWA audits
- Chrome DevTools for offline simulation
- Custom performance monitoring for offline operations

