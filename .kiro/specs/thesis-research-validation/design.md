# Design Document

## Overview

This design document outlines the technical architecture for implementing research validation capabilities, accessibility features, and completing the AI-driven personalization for the SkillBridge thesis project. The design prioritizes research data collection, ethics compliance, and accessibility for diverse literacy levels in Kiharu Constituency.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React PWA)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Voice     │ │ Simplified  │ │   Event     │ │  Offline  │ │
│  │  Guidance   │ │  UI Mode    │ │  Tracker    │ │   Sync    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌─────────────────────────────────────────────────────────────────┐
│                  Backend Layer (Node.js/Express)                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  Research   │ │  Consent    │ │ Experiment  │ │Intervention│ │
│  │  Analytics  │ │  Manager    │ │   Engine    │ │  System   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  MongoDB    │ │   Redis     │ │  IndexedDB  │ │  M-Pesa   │ │
│  │ (Research)  │ │  (Queue)    │ │  (Offline)  │ │   API     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Research Event Tracking Service

**Purpose:** Capture all user interactions for research analysis.

**Architecture:**
```javascript
// backend/services/research/
├── EventTrackingService.js      // Core event capture
├── EventBatchProcessor.js       // Batch submission handler
├── EventStorageService.js       // MongoDB time-series storage
└── EventExportService.js        // Data export functionality
```


**Event Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: String,
  timestamp: Date,
  eventType: String,  // 'page_view', 'module_start', 'assessment_answer', etc.
  eventCategory: String,  // 'learning', 'assessment', 'business_tool', 'navigation'
  
  eventData: {
    moduleId: ObjectId,
    assessmentId: ObjectId,
    questionId: String,
    responseTime: Number,  // milliseconds
    score: Number,
    interactions: Number,
    metadata: Object
  },
  
  context: {
    deviceType: String,  // 'mobile', 'tablet', 'desktop'
    networkType: String,  // 'wifi', '4g', '3g', 'offline'
    offlineMode: Boolean,
    language: String,
    accessibilityMode: String  // 'standard', 'simplified', 'voice'
  },
  
  experimentData: {
    group: String,  // 'control', 'treatment_a', 'treatment_b'
    variant: String,
    treatmentApplied: Boolean
  },
  
  syncStatus: {
    queuedAt: Date,
    syncedAt: Date,
    retryCount: Number
  }
}
```

**API Endpoints:**
```
POST /api/research/events          - Submit single event
POST /api/research/events/batch    - Submit batch of events
GET  /api/research/events/export   - Export events (admin only)
GET  /api/research/events/summary  - Get event statistics
```

### 2. Consent Management System

**Purpose:** Handle informed consent workflows compliant with Kenya Data Protection Act 2019.

**Components:**
```javascript
// backend/services/consent/
├── ConsentService.js           // Core consent logic
├── ConsentVersionManager.js    // Version tracking
├── DataExportService.js        // User data export
└── DataDeletionService.js      // GDPR-style deletion
```


**Consent Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  consentVersion: String,  // 'v1.0', 'v1.1'
  
  permissions: {
    researchDataCollection: Boolean,
    anonymizedDataSharing: Boolean,
    economicSurveys: Boolean,
    followUpContact: Boolean,
    smsNotifications: Boolean
  },
  
  consentGiven: {
    timestamp: Date,
    ipAddress: String,  // Hashed
    language: String,  // 'en' or 'sw'
    method: String  // 'click', 'voice'
  },
  
  withdrawals: [{
    timestamp: Date,
    reason: String,
    dataDeleted: Boolean
  }],
  
  dataExports: [{
    requestedAt: Date,
    completedAt: Date,
    format: String
  }]
}
```

**Frontend Component:**
```javascript
// frontend/src/components/consent/
├── ConsentModal.js             // Main consent form
├── ConsentForm.js              // Detailed permissions
├── ConsentTranslations.js      // EN/SW translations
└── DataControlPanel.js         // User data management
```

### 3. Experiment Engine

**Purpose:** Support A/B testing and control group assignment for research validation.

**Architecture:**
```javascript
// backend/services/experiment/
├── ExperimentService.js        // Core experiment logic
├── GroupAssignmentService.js   // Random assignment
├── VariantManager.js           // A/B variant handling
└── StatisticalAnalysis.js      // t-tests, effect sizes
```


**Experiment Schema:**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  status: String,  // 'draft', 'active', 'paused', 'completed'
  
  groups: [{
    name: String,  // 'control', 'treatment_a'
    ratio: Number,  // 0.5 = 50%
    features: {
      aiRecommendations: Boolean,
      adaptiveDifficulty: Boolean,
      gamification: Boolean,
      voiceGuidance: Boolean
    }
  }],
  
  targeting: {
    newUsersOnly: Boolean,
    demographicFilters: Object
  },
  
  metrics: {
    primaryMetric: String,  // 'completion_rate'
    secondaryMetrics: [String]
  },
  
  results: {
    sampleSize: Number,
    controlMean: Number,
    treatmentMean: Number,
    effectSize: Number,
    pValue: Number,
    confidenceInterval: [Number, Number]
  },
  
  startDate: Date,
  endDate: Date
}
```

**Statistical Analysis Functions:**
```javascript
// Statistical calculations for research validation
calculateTTest(controlData, treatmentData)
calculateEffectSize(controlMean, treatmentMean, pooledSD)
calculateConfidenceInterval(mean, sd, n, confidence)
calculateANOVA(groups)  // For multiple treatment groups
```

### 4. Pre/Post Assessment System

**Purpose:** Measure learning effectiveness with standardized assessments.

**Components:**
```javascript
// backend/services/research/
├── BaselineAssessmentService.js   // Initial assessment
├── OutcomeAssessmentService.js    // Post-learning assessment
├── RetentionAssessmentService.js  // Follow-up assessments
└── AssessmentComparisonService.js // Pre/post analysis
```


**Research Assessment Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  assessmentType: String,  // 'baseline', 'post', 'retention_3m', 'retention_6m'
  
  skillCategory: String,
  questions: [{
    questionId: String,
    difficulty: Number,
    response: String,
    correct: Boolean,
    responseTime: Number,
    confidence: Number  // Self-reported 1-5
  }],
  
  scores: {
    raw: Number,
    normalized: Number,  // 0-100
    percentile: Number
  },
  
  comparison: {
    baselineScore: Number,
    improvement: Number,
    effectSize: Number
  },
  
  completedAt: Date,
  scheduledFollowUp: Date
}
```

### 5. Voice Guidance System

**Purpose:** Enable audio-based learning for low-literacy users.

**Architecture:**
```javascript
// frontend/src/accessibility/
├── VoiceGuidanceProvider.js    // Context provider
├── TextToSpeech.js             // Web Speech API wrapper
├── VoiceCommands.js            // Speech recognition
├── AudioFeedback.js            // UI sound effects
└── VoiceSettings.js            // User preferences
```

**Voice Command Grammar:**
```javascript
const voiceCommands = {
  navigation: {
    'next': () => navigateNext(),
    'back': () => navigateBack(),
    'home': () => navigateHome(),
    'help': () => showHelp(),
    // Swahili equivalents
    'endelea': () => navigateNext(),
    'rudi': () => navigateBack(),
    'nyumbani': () => navigateHome(),
    'msaada': () => showHelp()
  },
  assessment: {
    'option one': () => selectOption(0),
    'option two': () => selectOption(1),
    'submit': () => submitAnswer(),
    'repeat': () => repeatQuestion()
  }
};
```


### 6. Simplified UI Mode

**Purpose:** Reduce cognitive load for users with limited digital experience.

**Design Principles:**
- Icon-based navigation with minimal text
- Large touch targets (minimum 48px)
- One task per screen
- Visual progress indicators
- High contrast colors

**Component Structure:**
```javascript
// frontend/src/components/simplified/
├── SimplifiedLayout.js         // Main layout wrapper
├── IconNavigation.js           // Icon-based nav
├── StepWizard.js              // Step-by-step tasks
├── VisualProgress.js          // Progress indicators
└── SimplifiedForms.js         // Large input forms
```

**Simplified Navigation Icons:**
```javascript
const navigationIcons = {
  home: '🏠',
  learn: '📚',
  assessment: '✅',
  business: '💼',
  profile: '👤',
  settings: '⚙️',
  help: '❓',
  back: '⬅️',
  next: '➡️'
};
```

### 7. Intervention System

**Purpose:** Automated dropout prevention and learner support.

**Architecture:**
```javascript
// backend/services/intervention/
├── InterventionService.js      // Core intervention logic
├── RiskCalculator.js           // Dropout risk scoring
├── MessageGenerator.js         // Motivational messages
├── SMSService.js              // SMS delivery via Africa's Talking
└── InterventionTracker.js     // Effectiveness tracking
```


**Intervention Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  
  trigger: {
    type: String,  // 'dropout_risk', 'performance_decline', 'inactivity'
    riskScore: Number,
    factors: [String]
  },
  
  intervention: {
    type: String,  // 'motivational_message', 'content_recommendation', 'admin_alert'
    channel: String,  // 'in_app', 'sms', 'email'
    content: String,
    language: String
  },
  
  delivery: {
    scheduledAt: Date,
    deliveredAt: Date,
    status: String  // 'pending', 'delivered', 'failed'
  },
  
  response: {
    userReturned: Boolean,
    returnedAt: Date,
    subsequentActivity: Number,
    effectivenessScore: Number
  }
}
```

**Risk Calculation Algorithm:**
```javascript
function calculateDropoutRisk(user) {
  let risk = 0;
  
  // Inactivity factor (0-30 points)
  const daysSinceActive = getDaysSinceLastActive(user);
  if (daysSinceActive > 14) risk += 30;
  else if (daysSinceActive > 7) risk += 20;
  else if (daysSinceActive > 3) risk += 10;
  
  // Performance factor (0-25 points)
  const avgScore = getAverageAssessmentScore(user);
  if (avgScore < 40) risk += 25;
  else if (avgScore < 60) risk += 15;
  
  // Completion factor (0-25 points)
  const completionRate = getModuleCompletionRate(user);
  if (completionRate < 0.2) risk += 25;
  else if (completionRate < 0.5) risk += 15;
  
  // Engagement factor (0-20 points)
  const sessionDuration = getAverageSessionDuration(user);
  if (sessionDuration < 5) risk += 20;
  else if (sessionDuration < 15) risk += 10;
  
  return Math.min(risk, 100);
}
```

### 8. Economic Impact Tracking

**Purpose:** Collect self-reported economic data for research validation.

**Survey Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  surveyType: String,  // 'baseline', 'followup_3m', 'followup_6m'
  
  employment: {
    status: String,  // 'employed', 'self_employed', 'unemployed', 'student'
    sector: String,
    hoursPerWeek: Number
  },
  
  income: {
    range: String,  // 'below_10k', '10k_20k', '20k_50k', '50k_100k', 'above_100k'
    currency: 'KES',
    changeFromBaseline: Number  // Percentage
  },
  
  business: {
    hasBusinesss: Boolean,
    type: String,
    monthlyRevenue: String,
    employeesCount: Number,
    digitalToolsUsed: [String]
  },
  
  digitalSkillsApplication: {
    usesDigitalPayments: Boolean,
    hasOnlinePresence: Boolean,
    usesBusinessSoftware: Boolean,
    sellsOnline: Boolean
  },
  
  completedAt: Date
}
```


### 9. Research Data Export System

**Purpose:** Generate publication-ready datasets and visualizations.

**Export Formats:**
```javascript
// backend/services/research/
├── CSVExporter.js              // CSV format export
├── JSONExporter.js             // JSON format export
├── AnonymizationService.js     // PII removal
├── StatisticalReporter.js      // Summary statistics
└── VisualizationGenerator.js   // Chart generation
```

**Export API:**
```
GET /api/research/export/events?format=csv&dateRange=...
GET /api/research/export/assessments?format=json&anonymize=true
GET /api/research/export/economic-impact?format=csv
GET /api/research/export/experiment-results?experimentId=...
GET /api/research/reports/summary?type=weekly
GET /api/research/reports/publication?format=latex
```

### 10. Advanced Offline Sync with Workbox

**Purpose:** Enable full offline functionality with intelligent synchronization.

**Service Worker Strategy:**
```javascript
// frontend/src/sw.js (Workbox configuration)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache-first for static assets
registerRoute(
  ({request}) => request.destination === 'image' || 
                 request.destination === 'style' ||
                 request.destination === 'script',
  new CacheFirst({ cacheName: 'static-assets' })
);

// Network-first for API with cache fallback
registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60 // 24 hours
      })
    ]
  })
);
```


**IndexedDB Schema (Dexie.js):**
```javascript
const db = new Dexie('SkillBridgeOffline');
db.version(1).stores({
  pendingEvents: '++id, timestamp, eventType, synced',
  cachedModules: 'moduleId, cachedAt, priority',
  userProgress: 'moduleId, lastUpdated',
  pendingAssessments: '++id, assessmentId, completedAt, synced',
  offlineQueue: '++id, action, data, timestamp, retryCount'
});
```

### 11. Business Tool Tutorial System

**Purpose:** Interactive tutorials within business tools.

**Tutorial Component:**
```javascript
// frontend/src/components/tutorials/
├── TutorialOverlay.js          // Highlight overlay
├── TutorialStep.js             // Individual step
├── TutorialProgress.js         // Progress tracker
├── TutorialTooltip.js          // Contextual tips
└── TutorialAssessment.js       // Skill validation
```

**Tutorial Definition Schema:**
```javascript
{
  toolId: 'inventory',
  steps: [
    {
      id: 'add-item',
      target: '#add-item-btn',
      title: 'Add Your First Item',
      titleSw: 'Ongeza Bidhaa Yako ya Kwanza',
      content: 'Click here to add a new product to your inventory',
      contentSw: 'Bonyeza hapa kuongeza bidhaa mpya',
      action: 'click',
      competencyPoints: 5
    },
    // ... more steps
  ],
  completionBadge: 'inventory-basics',
  certificateId: 'inventory-management-cert'
}
```

### 12. M-Pesa Integration

**Purpose:** Enable mobile payments for Kenyan users.

**Architecture:**
```javascript
// backend/services/payments/
├── MpesaService.js             // Daraja API integration
├── STKPushService.js           // STK Push initiation
├── CallbackHandler.js          // Payment callbacks
└── TransactionLogger.js        // Transaction records
```


**M-Pesa STK Push Flow:**
```javascript
async function initiateSTKPush(phoneNumber, amount, accountRef) {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const password = Buffer.from(
    `${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`
  ).toString('base64');
  
  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${BASE_URL}/api/payments/mpesa/callback`,
      AccountReference: accountRef,
      TransactionDesc: 'SkillBridge Course Payment'
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  return response.data;
}
```

## Data Models

### Enhanced User Model (Research Fields)

```javascript
{
  // ... existing user fields
  
  researchParticipant: {
    consentId: ObjectId,
    experimentGroup: String,
    enrolledAt: Date,
    baselineAssessmentId: ObjectId,
    followUpSchedule: [Date]
  },
  
  accessibilityPreferences: {
    voiceGuidance: Boolean,
    simplifiedUI: Boolean,
    language: String,
    speechRate: Number,
    highContrast: Boolean,
    fontSize: String
  },
  
  economicBaseline: {
    incomeRange: String,
    employmentStatus: String,
    hasBusinesss: Boolean,
    surveyCompletedAt: Date
  },
  
  interventionHistory: [{
    interventionId: ObjectId,
    type: String,
    deliveredAt: Date,
    responded: Boolean
  }]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*


### Property 1: Event Completeness
*For any* user interaction on the platform, the recorded event SHALL contain userId, sessionId, timestamp, eventType, and context fields (deviceType, networkStatus, offlineMode).
**Validates: Requirements 1.1, 1.2, 1.3, 1.7**

### Property 2: Offline Event Queuing
*For any* user action performed while offline, the action SHALL be queued locally with a timestamp and synced when connectivity is restored without data loss.
**Validates: Requirements 1.5, 10.2, 10.3**

### Property 3: Consent Record Completeness
*For any* consent submission, the consent record SHALL contain version, timestamp, language, and all permission flags.
**Validates: Requirements 2.3**

### Property 4: Consent Withdrawal Enforcement
*For any* user who withdraws consent, no new research events SHALL be recorded for that user after withdrawal.
**Validates: Requirements 2.5**

### Property 5: Balanced Random Assignment
*For any* set of N new users assigned to experiment groups, the distribution SHALL match configured ratios within statistical tolerance (chi-square test p > 0.05).
**Validates: Requirements 3.1, 3.2**

### Property 6: Control Group Feature Isolation
*For any* user in a control group, AI-powered features (recommendations, adaptive difficulty) SHALL NOT be applied, while progress tracking SHALL continue.
**Validates: Requirements 3.3**

### Property 7: Statistical Calculation Correctness
*For any* two groups of numeric data, the calculated t-test statistic, p-value, and effect size SHALL match reference statistical library calculations within floating-point tolerance.
**Validates: Requirements 3.5, 4.4, 9.3**

### Property 8: Assessment Difficulty Matching
*For any* post-assessment, the average difficulty of questions SHALL be equivalent to the baseline assessment (within 10% variance).
**Validates: Requirements 4.2**

### Property 9: Follow-up Scheduling Correctness
*For any* user who completes a learning path, follow-up assessment reminders SHALL be scheduled at exactly 3 months and 6 months from completion date.
**Validates: Requirements 4.3, 8.2**

### Property 10: Voice Command Recognition
*For any* supported voice command in English or Swahili, the system SHALL correctly parse and execute the corresponding action.
**Validates: Requirements 5.3**

### Property 11: Simplified UI Touch Target Size
*For any* interactive element in simplified UI mode, the touch target SHALL be at least 48px in both width and height.
**Validates: Requirements 6.2**

### Property 12: Mode Preference Persistence
*For any* user who sets an accessibility preference (simplified mode, voice guidance), the preference SHALL be restored on subsequent sessions.
**Validates: Requirements 6.7**

### Property 13: Risk-Based Intervention Triggering
*For any* user with dropout risk score above 60%, an intervention SHALL be triggered within 24 hours. For risk above 80%, an admin notification SHALL also be sent.
**Validates: Requirements 7.2, 7.6**

### Property 14: Economic Improvement Calculation
*For any* user reporting income change, the percentage improvement SHALL be correctly calculated as ((current - baseline) / baseline) * 100.
**Validates: Requirements 8.5**

### Property 15: Export Anonymization
*For any* data export, the output SHALL NOT contain any personally identifiable information (name, email, phone, exact location).
**Validates: Requirements 9.2**

### Property 16: Sync Conflict Resolution
*For any* data conflict during sync, simple data SHALL use last-write-wins, and the final state SHALL be consistent across client and server.
**Validates: Requirements 10.4**

### Property 17: Tutorial Progression
*For any* user completing a tutorial step, competency points SHALL be awarded and the user's skill profile SHALL be updated accordingly.
**Validates: Requirements 11.3**

### Property 18: Payment Verification Round-Trip
*For any* successful M-Pesa payment callback, the corresponding content SHALL be unlocked and a transaction record SHALL be created.
**Validates: Requirements 12.2, 12.5**

## Error Handling

### Research Data Errors
- Non-blocking: Research data collection failures SHALL NOT affect user experience
- Retry mechanism: Failed event submissions SHALL be retried with exponential backoff
- Local fallback: Events SHALL be stored locally if server is unreachable

### Consent Errors
- Blocking: Users SHALL NOT proceed without valid consent
- Clear messaging: Consent errors SHALL display user-friendly messages in selected language

### Payment Errors
- Graceful degradation: Payment failures SHALL show clear error messages with retry options
- Transaction logging: All payment attempts (success/failure) SHALL be logged

### Offline Errors
- Queue management: Offline queue SHALL have maximum size limit with oldest-first eviction
- Conflict notification: Users SHALL be notified of sync conflicts requiring manual resolution

## Testing Strategy

### Unit Tests
- Statistical calculation functions (t-test, effect size, confidence intervals)
- Risk score calculation algorithm
- Anonymization functions
- Voice command parsing

### Property-Based Tests
- Event completeness validation
- Consent enforcement after withdrawal
- Random assignment distribution
- Export anonymization verification

### Integration Tests
- End-to-end consent workflow
- Offline sync cycle
- M-Pesa payment flow
- Tutorial completion flow

### Accessibility Tests
- WCAG 2.1 Level AA compliance (axe-core)
- Voice guidance functionality
- Simplified UI touch targets
- Screen reader compatibility

## Performance Targets

- Event tracking: < 10ms per event capture
- Offline sync: < 5s for typical queue (100 events)
- Voice command recognition: < 500ms response time
- Risk calculation: < 1s per user
- Data export: < 30s for 10,000 records

## Security Considerations

### Research Data Protection
- Encryption at rest for all research data
- Anonymization before any data export
- Audit logging for data access
- Consent verification before data collection

### Payment Security
- HTTPS for all M-Pesa API calls
- Callback URL validation
- Transaction signature verification
- PCI-DSS compliance for payment data

