# Deploy Backend to Render - Complete Guide

## Why Render?
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Easy environment variable management
- ✅ Built-in SSL certificates
- ✅ Good for Node.js applications

## Prerequisites

1. **GitHub Account** - Your code is already on GitHub ✅
2. **Render Account** - Free to create
3. **MongoDB Atlas Account** - Free tier available (if not already set up)

## Step 1: Setup MongoDB Atlas (If Not Already Done)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Choose the **FREE** tier (M0 Sandbox)

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select a cloud provider and region (choose closest to you)
4. Cluster Name: `skillbridge-cluster`
5. Click "Create"

### 1.3 Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `skillbridge_admin`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.4 Whitelist IP Addresses
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. IP Address: `0.0.0.0/0`
5. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://skillbridge_admin:<password>@skillbridge-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end: `/skillbridge254`
   
   Final format:
   ```
   mongodb+srv://skillbridge_admin:YOUR_PASSWORD@skillbridge-cluster.xxxxx.mongodb.net/skillbridge254?retryWrites=true&w=majority
   ```

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your GitHub repositories

### 2.2 Create New Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your GitHub repository:
   - If not connected, click "Connect account"
   - Find and select your `skillbridge` repository
4. Click "Connect"

### 2.3 Configure Web Service

Fill in the following details:

**Basic Settings:**
- **Name:** `skillbridge-backend`
- **Region:** Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch:** `main`
- **Root Directory:** `learner-pwa/backend`
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **Free** tier

### 2.4 Add Environment Variables

Click "Advanced" and add these environment variables:

```
NODE_ENV = production
PORT = 5000

# MongoDB (from Step 1.5)
MONGODB_URI = mongodb+srv://skillbridge_admin:YOUR_PASSWORD@skillbridge-cluster.xxxxx.mongodb.net/skillbridge254?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET = your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE = 30d

# Groq AI API (YOUR KEY!)
GROQ_API_KEY = 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
GROQ_MODEL = llama-3.3-70b-versatile
GROQ_TEMPERATURE = 0.7
GROQ_MAX_TOKENS = 2048

# CORS (will update after Vercel deployment)
CORS_ORIGIN = *

# Rate Limiting
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100

# Email (optional - can add later)
EMAIL_FROM = noreply@skillbridge254.com
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587

# File Upload
MAX_FILE_SIZE = 10485760

# Logging
LOG_LEVEL = info
```

**Important Notes:**
- Replace `YOUR_PASSWORD` in MONGODB_URI with your actual MongoDB password
- Generate a strong JWT_SECRET (at least 32 characters)
- The GROQ_API_KEY is already filled in with your key

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Watch the logs for any errors
4. Once deployed, you'll see "Live" status

### 2.6 Get Your Backend URL
After deployment, copy your backend URL:
```
https://skillbridge-backend.onrender.com
```

## Step 3: Update Vercel Frontend

### 3.1 Add Environment Variable to Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://skillbridge-backend.onrender.com/api/v1`
   - **Environment:** Select all (Production, Preview, Development)
5. Click "Save"

### 3.2 Update CORS in Render
1. Go back to Render dashboard
2. Select your `skillbridge-backend` service
3. Go to "Environment" tab
4. Find `CORS_ORIGIN` variable
5. Update value to your Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
6. Click "Save Changes"
7. Service will automatically redeploy

### 3.3 Redeploy Vercel Frontend
1. Go to Vercel dashboard
2. Go to "Deployments" tab
3. Click three dots (...) on latest deployment
4. Click "Redeploy"
5. **UNCHECK** "Use existing Build Cache"
6. Click "Redeploy"

## Step 4: Seed the Database

### 4.1 Using Render Shell
1. In Render dashboard, go to your service
2. Click "Shell" tab (top right)
3. Run these commands:
   ```bash
   npm run db:setup
   npm run seed
   ```

### 4.2 Or Use Local Script with Production DB
1. On your local machine, temporarily update `learner-pwa/backend/.env`:
   ```
   MONGODB_URI=your-production-mongodb-uri-from-render
   ```
2. Run:
   ```bash
   cd learner-pwa/backend
   npm run db:setup
   npm run seed
   ```
3. Revert the .env change

## Step 5: Verify Everything Works

### 5.1 Test Backend Health
Open in browser:
```
https://skillbridge-backend.onrender.com/api/v1/chatbot/health
```

Expected response:
```json
{
  "status": "healthy",
  "model": "llama-3.3-70b-versatile",
  "configured": true
}
```

✅ If `"configured": true` - Groq API is working!
❌ If `"configured": false` - Check GROQ_API_KEY in Render environment variables

### 5.2 Test Frontend Connection
1. Open your Vercel app: `https://your-app.vercel.app`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Try using the chatbot
5. Check Network tab for API calls to your Render backend

### 5.3 Test Login
1. Try logging in with admin credentials:
   - Email: admin@skillbridge254.com
   - Password: admin123
2. If login fails, you may need to seed the database (Step 4)

## Step 6: Monitor and Maintain

### Check Logs
**Render:**
1. Go to your service dashboard
2. Click "Logs" tab
3. Monitor for errors

**Vercel:**
1. Go to your project
2. Click "Deployments"
3. Click on a deployment
4. View "Function Logs"

### Important Notes About Free Tier

**Render Free Tier Limitations:**
- ⚠️ Service spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds
- ✅ 750 hours/month free (enough for one service)
- ✅ Automatic SSL certificates
- ✅ Automatic deployments from GitHub

**To keep service active:**
- Use a service like UptimeRobot (free) to ping your backend every 10 minutes
- Or accept the cold start delay

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Check MONGODB_URI is correct in Render environment variables
2. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
3. Check MongoDB Atlas user has correct permissions

### Issue: "GROQ_API_KEY not found"
**Solution:**
1. Go to Render → Environment tab
2. Verify `GROQ_API_KEY` is set
3. Check for typos (must be all caps with underscores)
4. Save and redeploy

### Issue: "CORS error" in frontend
**Solution:**
1. Update `CORS_ORIGIN` in Render to match your Vercel URL
2. Or set to `*` for testing (not recommended for production)

### Issue: "Service unavailable" or slow first load
**Solution:**
- This is normal for Render free tier
- Service spins down after inactivity
- First request wakes it up (30-60 seconds)
- Consider upgrading to paid tier or using UptimeRobot

### Issue: Build fails on Render
**Solution:**
1. Check build logs for specific error
2. Verify `package.json` has all dependencies
3. Ensure Node version compatibility
4. Check Root Directory is set to `learner-pwa/backend`

## Quick Reference

### Your Configuration Summary

**Backend URL:** `https://skillbridge-backend.onrender.com`

**Environment Variables Needed:**
```
✅ GROQ_API_KEY = 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
✅ MONGODB_URI = (from MongoDB Atlas)
✅ JWT_SECRET = (generate random 32+ char string)
✅ CORS_ORIGIN = (your Vercel URL)
```

**Vercel Environment Variable:**
```
✅ REACT_APP_API_URL = https://skillbridge-backend.onrender.com/api/v1
```

### Health Check Endpoints

- Backend Health: `https://skillbridge-backend.onrender.com/api/v1/chatbot/health`
- API Status: `https://skillbridge-backend.onrender.com/api/v1/health` (if exists)

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Create admin account if needed
3. ✅ Upload course content
4. ✅ Test chatbot with Groq API
5. ✅ Monitor logs for errors
6. ✅ Set up UptimeRobot to keep service active
7. ✅ Configure email service (optional)
8. ✅ Set up backups for MongoDB

## Cost Breakdown

- **Render Free Tier:** $0/month (750 hours)
- **MongoDB Atlas Free Tier:** $0/month (512MB storage)
- **Vercel Free Tier:** $0/month
- **Total:** $0/month 🎉

## Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend errors
3. Verify all environment variables are set correctly
4. Test health endpoints
5. Check MongoDB Atlas connection

---

**Ready to deploy? Follow the steps above and your backend will be live in ~15 minutes!**

Good luck! 🚀
