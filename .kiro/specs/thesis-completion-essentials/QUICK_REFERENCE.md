# Quick Reference Guide - Thesis Platform

## 🚀 Quick Start

### Start the Platform
```bash
# Terminal 1: Backend
cd learner-pwa/backend
npm start

# Terminal 2: Frontend
cd learner-pwa
npm start

# Terminal 3: ML Service (optional)
cd learner-pwa/ml-service
python main.py
```

### Access URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **ML Service:** http://localhost:8000
- **API Docs:** http://localhost:5000/api/v1/docs

## 📍 Key Routes

### User Routes
- `/` - Home page
- `/dashboard` - User dashboard
- `/assessment` - Skills assessment
- `/learning` - Learning modules
- `/business-tools` - Business automation tools
- `/competency` - **NEW** Competency dashboard
- `/economic-survey?type=baseline` - **NEW** Economic survey
- `/profile` - User profile
- `/certificates` - Certificates

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/modules` - Module management
- `/admin/analytics` - Analytics

## 🔌 API Endpoints

### Economic Survey API
```bash
# Submit survey
POST /api/v1/economic-surveys
Body: { surveyType, employment, income, business, ... }

# Get user's surveys
GET /api/v1/economic-surveys/my-surveys

# Get pending surveys
GET /api/v1/economic-surveys/pending

# Admin: Aggregate impact
GET /api/v1/economic-surveys/admin/aggregate-impact

# Admin: Completion rates
GET /api/v1/economic-surveys/admin/completion-rates
```

### Competency API
```bash
# Trigger evaluation
POST /api/v1/competency/evaluate

# Get latest evaluation
GET /api/v1/competency/latest

# Get history
GET /api/v1/competency/history?limit=10

# Compare evaluations
GET /api/v1/competency/compare/:id1/:id2

# Admin: Statistics
GET /api/v1/competency/admin/statistics

# Admin: Domain distribution
GET /api/v1/competency/admin/domain-distribution
```

## 📊 Data Models

### CompetencyScore
```javascript
{
  userId: ObjectId,
  evaluationDate: Date,
  competencies: {
    basicDigitalLiteracy: { score, level, subSkills },
    digitalCommunication: { score, level, subSkills },
    eCommerce: { score, level, subSkills },
    digitalFinancialServices: { score, level, subSkills },
    businessAutomation: { score, level, subSkills },
    digitalMarketing: { score, level, subSkills },
    dataManagement: { score, level, subSkills }
  },
  overallScore: Number,
  overallLevel: String,
  learningVelocity: Number,
  strengthAreas: Array,
  improvementAreas: Array,
  suggestedModules: Array
}
```

### EconomicSurvey
```javascript
{
  userId: ObjectId,
  surveyType: 'baseline' | 'followup_3m' | 'followup_6m' | 'followup_12m',
  employment: { status, sector, hoursPerWeek, ... },
  income: { range, sources },
  business: { hasBusiness, type, monthlyRevenue, ... },
  digitalSkillsApplication: { usesDigitalPayments, ... },
  platformImpact: { helpedFindJob, helpedIncreaseIncome, ... }
}
```

## 🧪 Testing Commands

### Test Economic Survey
```bash
# Create test user
node learner-pwa/backend/scripts/createAdmin.js

# Submit baseline survey
curl -X POST http://localhost:5000/api/v1/economic-surveys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "surveyType": "baseline",
    "employment": { "status": "unemployed" },
    "income": { "range": "below_5k", "sources": [] }
  }'

# Get surveys
curl http://localhost:5000/api/v1/economic-surveys/my-surveys \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Competency Evaluation
```bash
# Trigger evaluation
curl -X POST http://localhost:5000/api/v1/competency/evaluate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "method": "hybrid" }'

# Get latest
curl http://localhost:5000/api/v1/competency/latest \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get history
curl http://localhost:5000/api/v1/competency/history?limit=5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📈 Research Data Collection

### Baseline Data Collection (Week 1-2)
1. Users register on platform
2. Complete baseline economic survey
3. Take initial skills assessment
4. System generates competency evaluation

### Ongoing Tracking (Weeks 3-24)
1. Users complete learning modules
2. System tracks progress and tool usage
3. Automatic competency re-evaluation after assessments
4. Continuous event tracking

### Follow-up Surveys
- **3-month:** Triggered automatically at day 90
- **6-month:** Triggered automatically at day 180
- **12-month:** Triggered automatically at day 365

### Data Export (For Thesis)
```bash
# Export economic survey data
GET /api/v1/economic-surveys/admin/cohort-comparison

# Export competency data
GET /api/v1/competency/admin/statistics

# Export user progress
GET /api/v1/analytics/user-progress
```

## 🎯 Key Metrics to Track

### Competency Metrics
- Overall competency score (0-100)
- Domain-specific scores (7 domains)
- Sub-skill scores (28 sub-skills)
- Learning velocity (points/week)
- Level progression (beginner → expert)

### Economic Metrics
- Income changes (baseline vs follow-up)
- Employment status changes
- Business creation/growth
- Digital tool adoption rates
- Platform satisfaction scores

### Engagement Metrics
- Module completion rates
- Assessment scores
- Time spent learning
- Business tool usage frequency
- Session frequency and duration

## 🔧 Troubleshooting

### Backend Issues
```bash
# Check database connection
node learner-pwa/backend/scripts/dbStatus.js

# List users
node learner-pwa/backend/scripts/listUsers.js

# Reset password
node learner-pwa/backend/scripts/resetPassword.js
```

### Frontend Issues
```bash
# Clear cache
rm -rf learner-pwa/node_modules/.cache

# Rebuild
cd learner-pwa
npm install
npm start
```

### Database Issues
```bash
# Setup database
node learner-pwa/backend/scripts/setupDatabase.js

# Seed modules
node learner-pwa/backend/scripts/seedModules.js
```

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learner-pwa
JWT_SECRET=your_jwt_secret
ML_SERVICE_URL=http://localhost:8000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ML_SERVICE_URL=http://localhost:8000
```

## 🎓 For Thesis Writing

### Methodology Section
- Describe 7-domain competency model
- Explain multi-source evidence integration
- Document economic survey design
- Detail longitudinal tracking approach

### Results Section
- Competency distribution charts
- Economic impact statistics
- Before/after comparisons
- Correlation analyses

### Discussion Section
- Competency progression patterns
- Economic empowerment outcomes
- Platform effectiveness
- Limitations and future work

## 📊 Data Analysis Tools

### Export Formats
- **CSV** - For Excel/SPSS
- **JSON** - For R/Python
- **Aggregate Reports** - For thesis charts

### Statistical Tests
- Paired t-tests (before/after)
- Independent t-tests (control vs intervention)
- Correlation analysis
- Effect size calculations (Cohen's d)

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificates ready
- [ ] Domain configured

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] ML service deployed (optional)
- [ ] Database migrated

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup schedule set
- [ ] User testing completed

## 📞 Support

### Documentation
- Backend: `learner-pwa/backend/README.md`
- ML Service: `learner-pwa/ml-service/README.md`
- Main: `README.md`

### Logs
- Backend: `learner-pwa/backend/logs/`
- Frontend: Browser console
- ML Service: Terminal output

## 🎉 Success Indicators

### Technical
- ✅ All endpoints responding
- ✅ Competency evaluation < 3s
- ✅ Survey submission < 1s
- ✅ Offline functionality working

### Research
- ✅ Baseline surveys collected
- ✅ Competency evaluations generated
- ✅ Progress tracking active
- ✅ Data export working

### User Experience
- ✅ Intuitive navigation
- ✅ Visual feedback clear
- ✅ Mobile responsive
- ✅ Error handling graceful

---

**Remember:** This platform is built for your thesis validation. Every feature directly supports your research objectives!
