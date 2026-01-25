# Adaptive Digital Skills Platform - Backend API

## Overview
This is the backend API for the Adaptive Digital Skills Assessment and Training Platform, designed for economic empowerment in Kiharu Constituency.

## Features
- **AI-Powered Assessment**: Adaptive skills evaluation with personalized recommendations
- **Learning Management**: Module tracking, progress monitoring, and personalized learning paths
- **Business Automation Tools**: Inventory, CRM, sales, and expense management
- **Real-time Analytics**: User progress tracking and platform-wide statistics
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Offline Support**: Optimized for low-bandwidth environments

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI/ML**: TensorFlow.js Node, Natural NLP
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Caching**: Redis (optional)
- **Logging**: Winston

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Setup Steps

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

4. **Seed the database**:
```bash
npm run migrate
```

5. **Start the server**:
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/update-profile` - Update profile

### Assessments
- `POST /api/v1/assessments/start` - Start new assessment
- `POST /api/v1/assessments/:id/submit` - Submit assessment
- `GET /api/v1/assessments/history` - Get assessment history

### Learning
- `GET /api/v1/learning/modules` - Get all modules
- `GET /api/v1/learning/personalized-path` - Get AI-generated learning path
- `POST /api/v1/learning/enroll/:moduleId` - Enroll in module
- `PUT /api/v1/learning/progress/:moduleId` - Update progress
- `GET /api/v1/learning/my-progress` - Get user progress

### Business Tools
- `GET /api/v1/business/inventory` - Get inventory items
- `POST /api/v1/business/inventory` - Add inventory item
- `GET /api/v1/business/customers` - Get customers
- `POST /api/v1/business/customers` - Add customer
- `GET /api/v1/business/sales` - Get sales records
- `POST /api/v1/business/sales` - Record new sale
- `GET /api/v1/business/expenses` - Get expenses
- `POST /api/v1/business/expenses` - Add expense
- `GET /api/v1/business/analytics` - Get business analytics

### Analytics
- `GET /api/v1/analytics/my-stats` - Get personal statistics
- `GET /api/v1/analytics/platform-stats` - Get platform statistics (admin)

## Database Models

### User
- Profile information (name, location, education, employment)
- Skills profile with competency levels
- Learning progress tracking
- Business profile
- Preferences and settings

### Assessment
- Adaptive question generation
- Response tracking
- AI-powered analysis
- Competency level calculation

### Module
- Learning content (videos, materials)
- Prerequisites and objectives
- Difficulty levels
- Offline availability

### Progress
- Module enrollment and completion
- Time tracking
- Activity logs
- Quiz scores and ratings

### Business Tools
- Inventory management
- Customer relationship management
- Sales transactions
- Expense tracking

## AI Features

### Adaptive Assessment
- Dynamic question selection based on user level
- Real-time difficulty adjustment
- Personalized competency evaluation

### Learning Path Generation
- AI-powered module recommendations
- Skill gap analysis
- Personalized pacing

### Performance Analysis
- Learning style prediction
- Success rate forecasting
- Adaptive content recommendations

## Security

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet.js security headers

## Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure MongoDB Atlas or production database
4. Set up Redis for caching
5. Configure email service
6. Enable HTTPS
7. Set up monitoring and logging
8. Configure backup strategy

### Recommended Hosting
- **API**: Heroku, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud
- **File Storage**: AWS S3, Cloudinary

## Testing
```bash
npm test
```

## Contributing
This project is part of a Master's thesis research at Mount Kenya University.

## License
Proprietary - Mount Kenya University Research Project

## Contact
- Student: Obike Emmanuel
- Registration: MIT/2025/42733
- Programme: MSc Information Technology
