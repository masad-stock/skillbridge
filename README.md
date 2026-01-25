# Adaptive Digital Skills Learning Platform

> An offline-first Progressive Web App for digital skills training in low-connectivity environments, with integrated research framework for academic study.

## 🎯 Project Overview

This platform addresses the challenge of digital skills education in Kenya and similar low-connectivity environments through an offline-first learning approach with built-in research data collection capabilities.

### Key Features
- 📱 **Progressive Web App (PWA)** - Works offline, installable on mobile devices
- 🎓 **Adaptive Learning** - AI-powered personalized learning paths
- 📊 **Research Framework** - Built-in data collection for academic research
- 🏆 **Certification System** - Automated certificate generation and verification
- 🌍 **Kenyan Context** - Localized content and economic impact tracking
- 🤖 **ML Integration** - Dropout prediction and learning style detection

## 📚 Documentation

**START HERE:** Read these documents in order:

1. **[SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)** ⭐ - For academic submission
2. **[COMPREHENSIVE_DOCUMENTATION.md](COMPREHENSIVE_DOCUMENTATION.md)** - Complete system overview
3. **[QUICK_START.md](QUICK_START.md)** - Setup and installation guide
4. **[KNOWN_ISSUES.md](KNOWN_ISSUES.md)** - Current limitations and status
5. **[SUBMISSION_READINESS.md](SUBMISSION_READINESS.md)** - Detailed status report

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Python 3.8+ (for ML service)
- Git

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd learner-pwa

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection string

# 4. Setup database
cd backend
npm run db:setup
npm run seed
cd ..

# 5. Start the application
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend (new terminal)
npm start
```

Visit `http://localhost:3000` to access the application.

**Detailed instructions:** See [QUICK_START.md](QUICK_START.md)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React PWA)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Services │  │  Offline │   │
│  │          │  │          │  │          │  │  Storage │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │  │Controllers│ │ Services │  │  Models  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (MongoDB)                      │
│  Users | Modules | Assessments | Certificates | Research    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  ML Service (Python/FastAPI)                 │
│  Dropout Prediction | Learning Style | Recommendations      │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
learner-pwa/
├── src/                      # Frontend React application
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API and business logic
│   ├── context/            # React context providers
│   └── __tests__/          # Frontend tests
├── backend/                 # Backend Node.js API
│   ├── routes/             # API route definitions
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # MongoDB schemas
│   ├── middleware/         # Express middleware
│   ├── tests/              # Backend tests
│   └── scripts/            # Utility scripts
├── ml-service/             # Python ML service
│   ├── models/             # ML model implementations
│   ├── api/                # FastAPI endpoints
│   └── training/           # Model training scripts
├── public/                 # Static assets
└── .kiro/specs/           # Project specifications

Documentation Files:
├── COMPREHENSIVE_DOCUMENTATION.md
├── QUICK_START.md
├── KNOWN_ISSUES.md
├── SUBMISSION_READINESS.md
├── SUBMISSION_CHECKLIST.md
└── PROJECT_HISTORY.md
```

## 🧪 Testing

```bash
# Frontend tests
cd learner-pwa
npm test

# Backend tests
cd learner-pwa/backend
npm test

# Run specific test suites
npm test -- --testPathPattern="properties"  # Research validation tests
npm test -- --testPathPattern="models"      # Model tests
npm test -- --testPathPattern="services"    # Service tests
```

**Current Status:** See [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for test coverage details.

## 🔬 Research Framework

This platform includes a comprehensive research framework for academic study:

- **Informed Consent Management** - Ethical data collection
- **Experiment Groups** - A/B testing and control groups
- **Event Tracking** - Detailed user interaction logging
- **Offline Queue** - Research data collection works offline
- **Statistical Analysis** - Built-in analysis tools
- **Data Export** - CSV/JSON export for external analysis

**Documentation:** See `.kiro/specs/thesis-research-validation/`

## 🎓 Academic Context

This project was developed as part of academic research on digital skills education in low-connectivity environments. It demonstrates:

- Full-stack web development
- Progressive Web App architecture
- Research methodology implementation
- Machine learning integration
- Offline-first design patterns

## 📊 Current Status

### ✅ Completed Features
- User authentication and authorization
- Module content management
- Assessment system with AI generation
- Certificate generation and verification
- Admin dashboard
- Research data collection framework
- Offline support infrastructure
- Payment integration (stubbed)
- ML service integration
- Email notification system

### ⚠️ Known Limitations
- Test coverage at 12% (target: 70%)
- Some integration tests failing
- Email service requires configuration
- ML models need training data
- Production deployment needs hardening

**Full details:** [KNOWN_ISSUES.md](KNOWN_ISSUES.md)

## 🛠️ Technology Stack

### Frontend
- React 19.2.0
- React Router 6.20.1
- Bootstrap 5.3.2
- Chart.js 4.4.0
- TensorFlow.js 4.22.0
- Dexie (IndexedDB)
- Workbox (Service Worker)

### Backend
- Node.js with Express 4.18.2
- MongoDB with Mongoose 8.0.3
- JWT authentication
- Socket.io 4.6.0
- Bull (job queue)
- Winston (logging)

### ML Service
- Python 3.8+
- FastAPI
- scikit-learn
- pandas
- numpy

## 🚢 Deployment

```bash
# Build for production
npm run build

# Deploy to Netlify
npm run deploy:netlify

# Deploy to Vercel
npm run deploy:vercel

# Or use deployment scripts
./deploy.bat  # Windows
./deploy.sh   # Linux/Mac
```

**Note:** Requires environment variables and external service configuration.

## 📝 License

This project is developed for academic purposes. Please contact the author for usage rights.

## 👤 Author

**Obike Emmanuel**
- MIT 2025 Cohort
- Research Focus: Digital Skills Education in Low-Connectivity Environments

## 🙏 Acknowledgments

- MIT for the research opportunity
- Kenyan digital skills training organizations
- Open source community for excellent tools and libraries

## 📞 Support

For questions or issues:
1. Check [KNOWN_ISSUES.md](KNOWN_ISSUES.md)
2. Review [COMPREHENSIVE_DOCUMENTATION.md](COMPREHENSIVE_DOCUMENTATION.md)
3. See [QUICK_START.md](QUICK_START.md) for setup help

## 🎯 For Evaluators

**If you're evaluating this project for academic purposes:**

1. Start with [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)
2. Review [COMPREHENSIVE_DOCUMENTATION.md](COMPREHENSIVE_DOCUMENTATION.md)
3. Check [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for honest assessment
4. See research specs in `.kiro/specs/thesis-research-validation/`

**Key Points:**
- This is a research prototype, not production software
- Focus is on architecture, methodology, and feasibility
- Test coverage needs improvement (documented)
- Core functionality works and has been manually verified
- Demonstrates significant technical complexity and research rigor

---

**Built with ❤️ for improving digital skills education in Kenya**
