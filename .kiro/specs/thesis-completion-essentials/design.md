# Thesis Completion Essentials - Design Document

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React PWA)                     │
├─────────────────────────────────────────────────────────────┤
│  Research Components  │  Learning Engine  │  Analytics UI   │
│  - Economic Surveys   │  - Adaptive Paths │  - Dashboards   │
│  - SUS Questionnaire  │  - Recommendations│  - Data Export  │
│  - Task Tracking      │  - Progress Track │  - Visualizations│
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Research Services    │  Learning Services │  Analytics      │
│  - Survey Management  │  - Path Generator  │  - Aggregation  │
│  - Economic Tracking  │  - Competency Eval │  - Statistics   │
│  - Data Export        │  - Recommendations │  - Reporting    │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   ML Service (Python/FastAPI)                │
├─────────────────────────────────────────────────────────────┤
│  - Competency Evaluation Model                              │
│  - Learning Path Recommendation Engine                      │
│  - Economic Outcome Prediction                              │
│  - Dropout Risk Assessment (existing)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Database (MongoDB)                         │
├─────────────────────────────────────────────────────────────┤
│  Research Data  │  Learning Data  │  Analytics Data         │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Economic Impact Tracking System

#### 1.1 Economic Survey Model
```javascript
EconomicSurvey {
  userId: ObjectId,
  surveyType: 'baseline' | '3-month' | '6-month',
  surveyDate: Date,
  
  // Employment & Income
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'student',
  monthlyIncome: Number,
  incomeSource: String,
  hoursWorkedPerWeek: Number,
  
  // Business Information (if applicable)
  hasBusiness: Boolean,
  businessType: String,
  monthlyRevenue: Number,
  monthlyExpenses: Number,
  numberOfCustomers: Number,
  
  // Digital Skills Application
  usesDigitalToolsForWork: Boolean,
  digitalToolsUsed: [String],
  digitalSkillsImpact: 'none' | 'minimal' | 'moderate' | 'significant',
  
  // Digital Financial Services
  usesDigitalPayments: Boolean,
  digitalPaymentPlatforms: [String],
  monthlyDigitalTransactions: Number,
  
  // Online Market Access
  sellsOnline: Boolean,
  onlinePlatformsUsed: [String],
  percentageOnlineSales: Number,
  
  // New Opportunities
  newOpportunitiesGained: Number,
  opportunityTypes: [String],
  
  // Qualitative Data
  skillsAppliedToWork: [String],
  challengesFaced: String,
  successStories: String,
  
  // Comparison Metrics
  comparedToBaseline: {
    incomeChange: Number,
    incomeChangePercent: Number,
    employmentStatusChanged: Boolean,
    newSkillsAcquired: [String]
  }
}
```

#### 1.2 Business Tool Usage Tracking
```javascript
BusinessToolUsage {
  userId: ObjectId,
  toolType: 'payment' | 'inventory' | 'crm' | 'analytics',
  
  // Usage Metrics
  firstUsedDate: Date,
  lastUsedDate: Date,
  totalSessions: Number,
  totalTimeSpent: Number,
  
  // Tool-Specific Metrics
  paymentTracking: {
    transactionsRecorded: Number,
    totalAmount: Number,
    averageTransactionValue: Number
  },
  
  inventoryManagement: {
    productsManaged: Number,
    stockUpdates: Number,
    lowStockAlerts: Number
  },
  
  customerRelationship: {
    customersManaged: Number,
    interactionsLogged: Number,
    followUpsScheduled: Number
  },
  
  // Impact Assessment
  perceivedValue: Number, // 1-5 scale
  timesSaved: Number, // hours per week
  efficiencyGain: Number, // percentage
  wouldRecommend: Boolean
}
```

### 2. Dynamic Learning Path Engine

#### 2.1 Competency Evaluation System
```javascript
CompetencyScore {
  userId: ObjectId,
  evaluationDate: Date,
  
  // Competency Domains (0-100 scale)
  competencies: {
    basicDigitalLiteracy: {
      score: Number,
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert',
      subSkills: {
        deviceOperation: Number,
        fileManagement: Number,
        internetNavigation: Number,
        emailCommunication: Number
      }
    },
    
    digitalCommunication: {
      score: Number,
      level: String,
      subSkills: {
        professionalEmail: Number,
        videoConferencing: Number,
        collaborationTools: Number,
        socialMediaProfessional: Number
      }
    },
    
    eCommerce: {
      score: Number,
      level: String,
      subSkills: {
        onlineMarketplaces: Number,
        productListing: Number,
        orderManagement: Number,
        customerService: Number
      }
    },
    
    digitalFinancialServices: {
      score: Number,
      level: String,
      subSkills: {
        mobileMoney: Number,
        onlinePayments: Number,
        digitalBanking: Number,
        financialRecordKeeping: Number
      }
    },
    
    businessAutomation: {
      score: Number,
      level: String,
      subSkills: {
        inventoryManagement: Number,
        paymentTracking: Number,
        customerRelationshipManagement: Number,
        businessAnalytics: Number
      }
    },
    
    digitalMarketing: {
      score: Number,
      level: String,
      subSkills: {
        socialMediaMarketing: Number,
        contentCreation: Number,
        onlineAdvertising: Number,
        customerEngagement: Number
      }
    }
  },
  
  // Overall Metrics
  overallScore: Number,
  overallLevel: String,
  
  // Learning Characteristics
  learningVelocity: Number, // Progress rate
  strengthAreas: [String],
  improvementAreas: [String],
  
  // Recommendations
  suggestedModules: [ObjectId],
  estimatedTimeToNextLevel: Number // hours
}
```

#### 2.2 Learning Pathway Model
```javascript
LearningPathway {
  userId: ObjectId,
  createdDate: Date,
  lastUpdated: Date,
  
  // Pathway Configuration
  targetCompetencyLevel: 'intermediate' | 'advanced' | 'expert',
  focusAreas: [String],
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed',
  availableTimePerWeek: Number,
  
  // Personalized Sequence
  modules: [{
    moduleId: ObjectId,
    sequenceOrder: Number,
    prerequisitesMet: Boolean,
    recommendationReason: String,
    estimatedDuration: Number,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    status: 'locked' | 'available' | 'in-progress' | 'completed',
    
    // Adaptive Elements
    contentVariant: String, // Which version of content
    difficultyAdjustment: Number, // -2 to +2
    additionalResources: [String]
  }],
  
  // Progress Tracking
  currentModuleIndex: Number,
  completedModules: Number,
  totalEstimatedHours: Number,
  hoursCompleted: Number,
  projectedCompletionDate: Date,
  
  // Adaptation History
  adaptations: [{
    date: Date,
    reason: String,
    changesMade: String,
    triggerMetric: String
  }]
}
```

#### 2.3 Adaptive Recommendation Algorithm

**Input Factors:**
1. Current competency scores
2. Learning velocity
3. Module completion history
4. Assessment performance
5. Time spent on content
6. Error patterns
7. Help requests
8. Learning style preferences

**Algorithm Logic:**
```
1. Evaluate Current State
   - Calculate competency scores across domains
   - Identify skill gaps
   - Assess learning velocity

2. Generate Candidate Modules
   - Filter by prerequisites met
   - Match to skill gaps
   - Consider user goals

3. Rank Modules
   - Relevance to skill gaps (40%)
   - Difficulty appropriateness (25%)
   - Learning style match (20%)
   - Estimated time fit (15%)

4. Sequence Optimization
   - Prerequisite dependencies
   - Difficulty progression
   - Variety (content types)
   - Engagement optimization

5. Adaptive Adjustments
   - If struggling: Insert remedial content
   - If excelling: Skip basics, increase difficulty
   - If disengaged: Change content format
   - If time-constrained: Prioritize essentials
```

### 3. Research Data Collection & Export

#### 3.1 Usability Metrics Model
```javascript
UsabilityMetrics {
  userId: ObjectId,
  collectionDate: Date,
  
  // System Usability Scale (SUS)
  susResponses: {
    q1_useFrequently: Number, // 1-5
    q2_unnecessarilyComplex: Number,
    q3_easyToUse: Number,
    q4_needSupport: Number,
    q5_wellIntegrated: Number,
    q6_tooMuchInconsistency: Number,
    q7_learnQuickly: Number,
    q8_cumbersome: Number,
    q9_confident: Number,
    q10_learnBeforeUse: Number
  },
  susScore: Number, // 0-100
  
  // Task Completion Tracking
  taskCompletions: [{
    taskName: String,
    attemptDate: Date,
    completed: Boolean,
    timeToComplete: Number, // seconds
    errorsEncountered: Number,
    helpUsed: Boolean,
    abandonmentReason: String
  }],
  
  // Interaction Metrics
  averageSessionDuration: Number,
  pagesPerSession: Number,
  errorRate: Number,
  helpRequestFrequency: Number,
  
  // Satisfaction
  overallSatisfaction: Number, // 1-5
  likelyToRecommend: Number, // 0-10 NPS
  feedback: String
}
```

#### 3.2 Research Data Export Service

**Export Categories:**

1. **Participant Demographics**
   - Age, gender, education, location
   - Digital literacy baseline
   - Employment status
   - Experimental group assignment

2. **Learning Effectiveness**
   - Pre/post assessment scores
   - Module completion rates
   - Time-to-competency
   - Knowledge retention scores
   - Skill transfer evidence

3. **Economic Outcomes**
   - Income changes (baseline to 6-month)
   - Employment status changes
   - Business revenue changes
   - Digital tool adoption
   - New opportunities gained

4. **Platform Usage**
   - Session frequency and duration
   - Feature adoption rates
   - Offline vs online usage
   - Content consumption patterns
   - Business tool usage

5. **User Experience**
   - SUS scores
   - Task completion rates
   - Error rates
   - Satisfaction scores
   - Accessibility compliance

**Export Formats:**

```javascript
// CSV Export Structure
{
  participantId, age, gender, education, location,
  experimentalGroup, baselineDigitalLiteracy,
  preAssessmentScore, postAssessmentScore, scoreImprovement,
  modulesCompleted, completionRate, totalHoursSpent,
  baselineIncome, month3Income, month6Income, incomeChange,
  baselineEmployment, month6Employment, employmentChanged,
  businessToolsAdopted, toolUsageFrequency,
  susScore, taskCompletionRate, satisfactionScore,
  ...
}

// Statistical Analysis Ready Format
{
  descriptiveStats: {
    mean, median, mode, stdDev, min, max
  },
  inferentialStats: {
    tTest: { tValue, pValue, df, significant },
    effectSize: { cohensD, interpretation },
    correlation: { rValue, pValue, strength }
  }
}
```

### 4. User Interface Components

#### 4.1 Economic Survey Interface
- Multi-step form with progress indicator
- Conditional questions based on responses
- Input validation and data quality checks
- Save and resume functionality
- Offline completion support
- Comparison view (baseline vs current)

#### 4.2 Research Dashboard
- Key metrics overview
- Participant progress tracking
- Data quality monitoring
- Export functionality
- Statistical analysis tools
- Visualization library

#### 4.3 Adaptive Learning Interface
- Personalized module recommendations
- Progress visualization
- Competency radar chart
- Next steps guidance
- Alternative pathway options
- Achievement celebrations

## ML Model Design

### Competency Evaluation Model

**Architecture:** Multi-output Neural Network

**Inputs:**
- Assessment responses (categorical + numerical)
- Time spent per question
- Attempt patterns
- Previous module performance
- Interaction patterns

**Outputs:**
- Competency scores per domain (0-100)
- Confidence intervals
- Skill level classifications
- Improvement recommendations

**Training Data:**
- Historical assessment results
- Expert-rated competency levels
- Learning outcome correlations
- Skill transfer evidence

### Learning Path Recommendation Model

**Architecture:** Collaborative Filtering + Content-Based Hybrid

**Inputs:**
- User competency profile
- Learning history
- Learning style preferences
- Time constraints
- Goals and interests

**Outputs:**
- Ranked module recommendations
- Personalized difficulty adjustments
- Content format preferences
- Estimated completion times

**Training Data:**
- User-module interactions
- Completion patterns
- Success rates by user type
- Engagement metrics

## API Design

### Research Endpoints

```
POST   /api/research/economic-survey
GET    /api/research/economic-survey/:userId
GET    /api/research/economic-survey/:userId/comparison
PUT    /api/research/economic-survey/:id

POST   /api/research/usability-metrics
GET    /api/research/usability-metrics/:userId
POST   /api/research/task-completion

GET    /api/research/data-export
POST   /api/research/data-export/custom
GET    /api/research/statistical-analysis

GET    /api/research/dashboard/overview
GET    /api/research/dashboard/participants
GET    /api/research/dashboard/outcomes
```

### Learning Path Endpoints

```
POST   /api/learning-path/evaluate-competency
GET    /api/learning-path/competency/:userId
POST   /api/learning-path/generate-pathway
GET    /api/learning-path/pathway/:userId
PUT    /api/learning-path/pathway/:userId/adapt

GET    /api/learning-path/recommendations/:userId
POST   /api/learning-path/recommendations/feedback
```

## Data Flow Diagrams

### Economic Impact Tracking Flow
```
User completes survey → Validation → Store in DB → 
Calculate changes → Update analytics → 
Trigger follow-up scheduling → Export for analysis
```

### Adaptive Learning Flow
```
User completes assessment → ML evaluation → 
Competency scores calculated → Pathway generation → 
Module recommendations → User selection → 
Progress tracking → Performance monitoring → 
Adaptive adjustments → Re-evaluation
```

### Research Data Export Flow
```
Admin requests export → Query filters applied → 
Data aggregation → Anonymization → 
Format conversion → Statistical calculations → 
File generation → Secure download
```

## Performance Considerations

- Competency evaluation: < 2 seconds
- Pathway generation: < 3 seconds
- Survey submission: < 1 second
- Data export (1000 records): < 10 seconds
- Dashboard load: < 2 seconds
- Offline survey completion: Full support
- Sync on reconnection: Background process

## Security & Privacy

- All survey data encrypted at rest
- Anonymization for research exports
- Role-based access (participant/researcher/admin)
- Audit logging for data access
- Consent verification before data collection
- GDPR/Kenya Data Protection Act compliance
- Secure data transfer (HTTPS only)
