# Environment Setup Checklist

**Purpose**: Ensure all environment variables and configurations are correctly set for both local and production environments.

---

## 🔴 CRITICAL: Production Environment Variables

### Render Backend Configuration

Access: https://dashboard.render.com → Your Service → Environment

#### Required Variables (MUST BE SET)

```bash
# Database Connection (CRITICAL)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillbridge254?retryWrites=true&w=majority
# ⚠️ Replace username, password, and cluster with your actual values
# ⚠️ Ensure password doesn't contain special characters (@ # $ % &) or URL-encode them
# ⚠️ Database name should be 'skillbridge254' or your chosen name

# JWT Authentication (CRITICAL)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-random-string
# ⚠️ MUST be at least 32 characters
# ⚠️ Use a cryptographically secure random string
# ⚠️ NEVER commit this to git
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

JWT_EXPIRE=30d
# Token expiration time (30 days is recommended)

# Application Settings (CRITICAL)
NODE_ENV=production
# Must be 'production' for production deployment

PORT=5000
# Port number (Render will override this, but good to set)

API_VERSION=v1
# API version prefix

# CORS Configuration (CRITICAL)
CORS_ORIGIN=https://skillbridge-tau.vercel.app
# Your frontend URL - MUST match exactly
# Add multiple origins separated by commas if needed
```

#### Optional Variables (Recommended)

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
# 15 minutes in milliseconds

RATE_LIMIT_MAX_REQUESTS=100
# Maximum requests per window

# Email Service (Optional - non-blocking)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@skillbridge254.com
# Note: Email failures won't block registration/login

# Redis (Optional - should be disabled for now)
REDIS_ENABLED=false
# Set to false unless you have Redis configured

# Logging
LOG_LEVEL=info
# Options: error, warn, info, debug
```

---

### Vercel Frontend Configuration

Access: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

#### Required Variables

```bash
# Backend API URL (CRITICAL)
REACT_APP_API_URL=https://skillbridge-backend-t35r.onrender.com/api/v1
# Your Render backend URL + /api/v1

# Request Timeout (Recommended for mobile)
REACT_APP_REQUEST_TIMEOUT=60000
# 60 seconds (60000ms) for mobile networks and cold starts

# Environment
NODE_ENV=production
```

#### Optional Variables

```bash
# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_OFFLINE_MODE=true

# API Keys (if using external services)
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

---

## 🗄️ MongoDB Atlas Configuration

### Network Access

1. Go to MongoDB Atlas Dashboard
2. Navigate to: **Network Access** → **IP Access List**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add specific Render IP ranges if you prefer
5. Click **"Confirm"**

**Why**: Render uses dynamic IPs, so allowing all IPs is the simplest solution.

### Database User

1. Go to: **Database Access** → **Database Users**
2. Verify user exists with:
   - **Username**: Matches your MONGODB_URI
   - **Password**: Matches your MONGODB_URI (no special characters)
   - **Database User Privileges**: Read and write to any database
   - **Built-in Role**: Atlas admin (or at least readWrite)

### Connection String Validation

**Format**:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Common Issues**:
- ❌ Missing `mongodb+srv://` prefix
- ❌ Special characters in password not URL-encoded
- ❌ Wrong cluster address
- ❌ Missing database name
- ❌ Missing query parameters

**Test Connection**:
```bash
# Using mongosh
mongosh "mongodb+srv://username:password@cluster.mongodb.net/skillbridge254"

# Using MongoDB Compass
# Paste connection string and click "Connect"
```

---

## 🧪 Local Development Environment

### Backend (.env file)

Create `learner-pwa/backend/.env`:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/skillbridge254
# Or use MongoDB Atlas connection string

# JWT
JWT_SECRET=local-development-secret-key-32-chars-minimum
JWT_EXPIRE=30d

# Application
NODE_ENV=development
PORT=5001
API_VERSION=v1

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@skillbridge254.com

# Redis (Optional)
REDIS_ENABLED=false

# Logging
LOG_LEVEL=debug
```

### Frontend (.env file)

Create `learner-pwa/.env`:

```bash
# Backend API
REACT_APP_API_URL=http://localhost:5001/api/v1

# Timeout
REACT_APP_REQUEST_TIMEOUT=60000

# Environment
NODE_ENV=development
```

---

## ✅ Verification Steps

### Step 1: Verify Render Environment Variables

```bash
# Check if all required variables are set
# Go to Render Dashboard → Environment tab

Required:
☐ MONGODB_URI (check format)
☐ JWT_SECRET (minimum 32 chars)
☐ JWT_EXPIRE
☐ NODE_ENV=production
☐ CORS_ORIGIN (matches frontend URL)
```

### Step 2: Verify MongoDB Atlas

```bash
# Check Network Access
☐ 0.0.0.0/0 is whitelisted

# Check Database User
☐ User exists
☐ Password is correct
☐ User has readWrite permissions

# Test Connection
☐ Can connect with mongosh or Compass
```

### Step 3: Test Production Backend

```bash
# Run production test script
node test-production-login.js

Expected Results:
☐ Health check passes
☐ Registration succeeds (201)
☐ Login succeeds (200)
☐ Token is generated
☐ No 500 errors
```

### Step 4: Test Production Frontend

```bash
# Open in browser
https://skillbridge-tau.vercel.app

Test:
☐ Page loads without errors
☐ Can open login modal
☐ Can attempt login
☐ Check browser console for errors
☐ Check Network tab for API calls
```

### Step 5: Test Mobile

```bash
# Open on mobile device
https://skillbridge-tau.vercel.app/mobile-diagnostics.html

Check:
☐ All diagnostic tests pass
☐ Backend connection works
☐ CORS headers present
☐ LocalStorage available
☐ Test login succeeds
```

---

## 🔧 Troubleshooting

### Issue: Registration Returns 500 Error

**Possible Causes**:
1. JWT_SECRET not set or too short
2. MONGODB_URI incorrect or database unreachable
3. MongoDB Atlas IP not whitelisted

**Solutions**:
```bash
# 1. Check JWT_SECRET
# Must be at least 32 characters
# Generate new one:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Test MongoDB connection
mongosh "your-connection-string"

# 3. Check Render logs
# Go to Render Dashboard → Logs
# Look for specific error messages
```

### Issue: CORS Errors

**Symptoms**: Browser console shows "CORS policy" error

**Solutions**:
```bash
# 1. Verify CORS_ORIGIN matches frontend URL exactly
CORS_ORIGIN=https://skillbridge-tau.vercel.app
# No trailing slash!

# 2. Check if backend is adding CORS headers
curl -I https://skillbridge-backend-t35r.onrender.com/health

# Should see:
# Access-Control-Allow-Origin: *
```

### Issue: Timeout Errors

**Symptoms**: Requests timeout after 30-60 seconds

**Solutions**:
```bash
# 1. Increase frontend timeout
REACT_APP_REQUEST_TIMEOUT=60000

# 2. Check if backend is responding
curl -w "@-" -o /dev/null -s https://skillbridge-backend-t35r.onrender.com/health <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_pretransfer:  %{time_pretransfer}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF

# 3. Render free tier has cold starts
# First request after inactivity can take 30+ seconds
# This is normal - retry logic will handle it
```

### Issue: Token Expired Immediately

**Symptoms**: User logs in but immediately logged out

**Solutions**:
```bash
# 1. Check JWT_EXPIRE is set
JWT_EXPIRE=30d

# 2. Verify token expiration in code
# Should be 30 days, not 30 seconds

# 3. Check system time on server
# Render servers should have correct time
```

---

## 📋 Deployment Checklist

### Before Deploying

- [ ] All environment variables set on Render
- [ ] All environment variables set on Vercel
- [ ] MongoDB Atlas IP whitelist configured
- [ ] MongoDB user credentials verified
- [ ] JWT_SECRET is secure (32+ characters)
- [ ] CORS_ORIGIN matches frontend URL
- [ ] Local tests pass
- [ ] Code committed to git

### After Deploying

- [ ] Run `node test-production-login.js`
- [ ] Check Render logs for errors
- [ ] Test registration on production
- [ ] Test login on production
- [ ] Test on mobile device
- [ ] Run mobile diagnostics
- [ ] Monitor for 24 hours

---

## 🔐 Security Best Practices

### JWT_SECRET

```bash
# ✅ GOOD: Cryptographically secure random string
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# ❌ BAD: Short or predictable
JWT_SECRET=secret123
JWT_SECRET=myapp

# Generate secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# or
openssl rand -hex 32
```

### MongoDB Password

```bash
# ✅ GOOD: No special characters
password=MySecurePassword123

# ❌ BAD: Special characters (need URL encoding)
password=My@Pass#123

# If you must use special characters, URL encode them:
@ → %40
# → %23
$ → %24
% → %25
& → %26
```

### Environment Variables

```bash
# ✅ GOOD: Set in platform dashboard
# Render: Dashboard → Environment
# Vercel: Dashboard → Settings → Environment Variables

# ❌ BAD: Committed to git
# Never commit .env files
# Add to .gitignore:
.env
.env.local
.env.production
```

---

## 📞 Support Resources

### Documentation
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas IP Whitelist](https://docs.atlas.mongodb.com/security/ip-access-list/)

### Dashboards
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com

### Testing Tools
- Production Test: `node test-production-login.js`
- Mobile Diagnostics: https://skillbridge-tau.vercel.app/mobile-diagnostics.html
- Backend Health: https://skillbridge-backend-t35r.onrender.com/health

---

**Last Updated**: January 2026  
**Status**: Ready for production deployment verification
