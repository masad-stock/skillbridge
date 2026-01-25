# 🎓 SkillBridge - Digital Skills Learning Platform

> A comprehensive Progressive Web Application for adaptive digital skills training, business tools, and certification.

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment
cp .env.example .env
cp backend/.env.example backend/.env

# Start application
npm run start-fullstack
```

Visit `http://localhost:3000`

## ✨ Features

- ✅ Adaptive Skills Assessment
- ✅ Learning Modules & Progress Tracking
- ✅ Certificate Generation (PDF)
- ✅ Email Notifications
- ✅ Password Reset
- ✅ Search Functionality
- ✅ Payment System (Stripe, PayPal, M-Pesa)
- ✅ Admin Panel
- ✅ Business Tools
- ✅ Offline Support (PWA)

## 📚 Documentation

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete documentation
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Pre-launch checklist
- **[IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)** - Development progress

## 🛠️ Tech Stack

- **Frontend:** React, Bootstrap, PWA
- **Backend:** Node.js, Express, MongoDB
- **Architecture:** MVC with Repository Pattern
- **Testing:** Jest, React Testing Library

## 📦 Project Structure

```
learner-pwa/
├── src/                # Frontend React app
├── backend/           # Backend API
│   ├── models/       # Database models
│   ├── controllers/  # Request handlers
│   ├── services/     # Business logic
│   ├── routes/       # API routes
│   └── tests/        # Backend tests
├── public/           # Static files
└── build/            # Production build
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
npm test

# Coverage
npm test -- --coverage
```

## 🚢 Deployment

```bash
# Build for production
npm run build

# Deploy to Netlify
./deploy.sh
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

## 📊 Implementation Status

- **Phase 1:** ✅ Critical Fixes (40 hours)
- **Phase 2:** ✅ Essential Features (30 hours)
- **Phase 3:** ✅ Quality Improvements (10 hours)

**Total:** 80/93 hours (86% complete)

## 🔐 Security

- Input validation & sanitization
- XSS & CSRF protection
- JWT authentication
- Rate limiting
- Password hashing (bcrypt)

## 📄 License

[Your License]

## 👥 Contact

For support: [your-email]

---

**Status:** Production Ready | **Version:** 1.0.0 | **Updated:** November 18, 2025
