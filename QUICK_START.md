# SkillBridge254 - Quick Start Guide

> Get up and running in 5 minutes

## Prerequisites
- Node.js v16+
- MongoDB v5.0+
- npm v8.0+

## Installation

### Option 1: Automated Setup (Recommended)
```bash
setup.bat
```

### Option 2: Manual Setup
```bash
# 1. Start MongoDB
net start MongoDB

# 2. Install dependencies
cd learner-pwa
npm install --legacy-peer-deps

# 3. Install backend dependencies
cd backend
npm install

# 4. Seed database
node scripts/seedModules.js
cd ../..
```

## Running the Application

### Full Stack (Frontend + Backend)
```bash
cd learner-pwa
start-fullstack.bat
```

Or manually:
```bash
# Terminal 1 - Backend
cd learner-pwa/backend
npm run dev

# Terminal 2 - Frontend
cd learner-pwa
npm start
```

**Access**: http://localhost:3000

## Testing

### Run All Tests
```bash
test.bat
```

### Manual Testing
```bash
# Frontend tests
cd learner-pwa
npm test

# Backend tests
cd learner-pwa/backend
npm test
```

## Project Structure

```
SkillBridge254/
├── learner-pwa/              # Main application
│   ├── src/                  # React frontend
│   ├── backend/              # Node.js API
│   ├── public/               # Static assets
│   └── start-fullstack.bat   # Quick start script
├── Learner/                  # Static HTML templates
├── COMPREHENSIVE_DOCUMENTATION.md  # Full documentation
├── PROJECT_HISTORY.md        # Implementation history
├── setup.bat                 # Setup script
└── test.bat                  # Test runner
```

## Key Features

- ✅ Adaptive Skills Assessment
- ✅ Learning Modules (Video + PDF)
- ✅ Progress Tracking
- ✅ Certificate Generation
- ✅ Business Tools
- ✅ Offline Support (PWA)
- ✅ Multi-language (EN/SW)
- ✅ Dark/Light Mode

## Default Credentials

### Admin
- Email: admin@skillbridge254.com
- Password: admin123

### Test User
- Email: test@example.com
- Password: test123

## Common Issues

### MongoDB Not Running
```bash
net start MongoDB
```

### Port Already in Use
```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Module Not Found
```bash
cd learner-pwa
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Documentation

- **Full Documentation**: `COMPREHENSIVE_DOCUMENTATION.md`
- **Implementation History**: `PROJECT_HISTORY.md`
- **Backend README**: `learner-pwa/backend/README.md`
- **ML Service README**: `learner-pwa/ml-service/README.md`

## Support

For detailed information, see `COMPREHENSIVE_DOCUMENTATION.md`

---

**Version**: 1.0.0  
**Status**: Production Ready ✅
