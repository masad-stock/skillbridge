# Vercel Environment Variables Setup

## Problem
Your app is still using Gemini API instead of Groq API because the environment variables are not set in Vercel.

## Your Groq API Key
```
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
```

## Required Environment Variables for Vercel

### Frontend Environment Variables
These need to be set in your **Vercel Project Settings**:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

#### Frontend Variables (for React app)
```
REACT_APP_API_URL = https://your-backend-url.onrender.com/api/v1
```

**Note:** Replace `your-backend-url.onrender.com` with your actual backend URL.

### Backend Environment Variables
If you're deploying the backend separately (e.g., on Render, Railway, or Heroku), add these:

#### Backend Variables
```
# Server Configuration
PORT = 5000
NODE_ENV = production

# Database
MONGODB_URI = your-mongodb-connection-string

# JWT Secret
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production

# Email Configuration
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-app-specific-password

# Frontend URL
FRONTEND_URL = https://your-vercel-app.vercel.app

# ML Service (if applicable)
ML_SERVICE_URL = http://localhost:8000

# Groq AI API Key (IMPORTANT!)
GROQ_API_KEY = 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
GROQ_MODEL = llama-3.3-70b-versatile
GROQ_TEMPERATURE = 0.7
GROQ_MAX_TOKENS = 2048

# Session Secret
SESSION_SECRET = your-session-secret-here

# File Upload
MAX_FILE_SIZE = 10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
```

## Step-by-Step Instructions

### For Vercel (Frontend)

1. **Login to Vercel Dashboard**
   - Go to https://vercel.com/dashboard

2. **Select Your Project**
   - Click on your project name

3. **Open Settings**
   - Click on "Settings" tab at the top

4. **Add Environment Variables**
   - Click on "Environment Variables" in the left sidebar
   - Click "Add New" button
   - Add each variable:
     - **Name:** `REACT_APP_API_URL`
     - **Value:** Your backend URL (e.g., `https://skillbridge-backend.onrender.com/api/v1`)
     - **Environment:** Select all (Production, Preview, Development)
   - Click "Save"

5. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - Make sure "Use existing Build Cache" is UNCHECKED

### For Backend (Render/Railway/Heroku)

#### If using Render:
1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add all the backend variables listed above
5. Click "Save Changes"
6. Render will automatically redeploy

#### If using Railway:
1. Go to your Railway dashboard
2. Select your backend project
3. Click on "Variables" tab
4. Add all the backend variables
5. Railway will automatically redeploy

#### If using Heroku:
1. Go to your Heroku dashboard
2. Select your backend app
3. Go to "Settings" tab
4. Click "Reveal Config Vars"
5. Add all the backend variables
6. Heroku will automatically redeploy

## Verification Steps

### 1. Check Backend Health
After deploying, test the chatbot health endpoint:
```
https://your-backend-url.com/api/v1/chatbot/health
```

Expected response:
```json
{
  "status": "healthy",
  "model": "llama-3.3-70b-versatile",
  "configured": true
}
```

If you see `"configured": false`, the GROQ_API_KEY is not set correctly.

### 2. Test Frontend Connection
1. Open your Vercel app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Check for any API connection errors
5. Try using the chatbot

### 3. Check Logs
- **Vercel:** Go to Deployments → Click on deployment → View Function Logs
- **Render:** Go to your service → Logs tab
- **Railway:** Go to your project → Deployments → View logs

## Common Issues

### Issue 1: "Gemini API not configured" or still using Gemini
**Cause:** Backend is not using the correct service or environment variables are not set.

**Solution:**
1. Verify `GROQ_API_KEY` is set in backend environment
2. Check that `chatbot.js` imports `groqService` (not `geminiService`)
3. Restart backend service after adding environment variables

### Issue 2: "GROQ_API_KEY not found"
**Cause:** Environment variable not set or typo in variable name.

**Solution:**
1. Double-check spelling: `GROQ_API_KEY` (all caps, underscore)
2. Ensure no extra spaces in the key value
3. Redeploy after adding the variable

### Issue 3: Frontend can't connect to backend
**Cause:** `REACT_APP_API_URL` not set or incorrect.

**Solution:**
1. Verify `REACT_APP_API_URL` is set in Vercel
2. Ensure it includes `/api/v1` at the end
3. Ensure it uses `https://` (not `http://`)
4. Redeploy frontend after adding the variable

### Issue 4: CORS errors
**Cause:** Backend not configured to accept requests from Vercel domain.

**Solution:**
Add `FRONTEND_URL` environment variable to backend with your Vercel URL.

## Quick Checklist

- [ ] Groq API key added to backend environment variables
- [ ] Backend redeployed after adding variables
- [ ] Backend health endpoint returns `"configured": true`
- [ ] Frontend `REACT_APP_API_URL` points to correct backend
- [ ] Frontend redeployed after adding variables
- [ ] Tested chatbot in production
- [ ] Checked browser console for errors
- [ ] Verified no Gemini references in logs

## Support

If issues persist:
1. Check backend logs for "GROQ_API_KEY not found" warnings
2. Verify the API key is valid by testing it directly
3. Ensure your backend service is running and accessible
4. Check that the chatbot route is properly registered in your backend

## Your Current Setup

Based on your code:
- ✅ Frontend: Correctly configured to use Groq
- ✅ Backend: Has `groqService.js` properly implemented
- ✅ Routes: Using `groqService` (not `geminiService`)
- ❌ Environment Variables: **NOT SET IN VERCEL/BACKEND**

**Next Step:** Add the environment variables to your backend hosting platform!
