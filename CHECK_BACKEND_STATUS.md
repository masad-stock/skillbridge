# Backend Status Check

## Your Groq API Key (Confirmed Working Locally)
```
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
```

## Problem Identified
✅ Your **local backend** has the correct Groq API key configured
❌ Your **production backend** (deployed online) does NOT have the Groq API key

## Where is Your Backend Deployed?

Your frontend on Vercel needs to connect to a backend API. Check where your backend is hosted:

### Common Options:
1. **Render** - https://render.com
2. **Railway** - https://railway.app
3. **Heroku** - https://heroku.com
4. **Vercel Serverless Functions**
5. **AWS/Azure/Google Cloud**
6. **Your own server**

## Quick Check: Find Your Backend URL

1. Open your deployed Vercel app in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Try using the chatbot
5. Look for API requests - they will show your backend URL

OR

Check your Vercel environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Look for `REACT_APP_API_URL` - this is your backend URL

## Steps to Fix

### Step 1: Identify Backend Host
Find out where your backend is deployed (see above)

### Step 2: Add Environment Variables to Backend

#### If Backend is on Render:
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Environment" tab
4. Add these variables:
   ```
   GROQ_API_KEY = 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
   GROQ_MODEL = llama-3.3-70b-versatile
   GROQ_TEMPERATURE = 0.7
   GROQ_MAX_TOKENS = 2048
   ```
5. Click "Save Changes"
6. Service will automatically redeploy

#### If Backend is on Railway:
1. Go to https://railway.app/dashboard
2. Select your backend project
3. Click "Variables" tab
4. Add the same variables as above
5. Railway will automatically redeploy

#### If Backend is on Heroku:
1. Go to https://dashboard.heroku.com
2. Select your backend app
3. Go to Settings → Config Vars
4. Click "Reveal Config Vars"
5. Add the same variables as above
6. Heroku will automatically redeploy

#### If Backend is on Vercel (Serverless):
1. Go to Vercel Dashboard
2. Select your backend project (if separate) or main project
3. Settings → Environment Variables
4. Add the same variables as above
5. Redeploy

### Step 3: Verify the Fix

After adding environment variables and redeploying:

1. **Check Health Endpoint**
   Open in browser: `https://your-backend-url.com/api/v1/chatbot/health`
   
   Should return:
   ```json
   {
     "status": "healthy",
     "model": "llama-3.3-70b-versatile",
     "configured": true
   }
   ```

2. **Test Chatbot**
   - Open your Vercel app
   - Try the chatbot
   - It should now use Groq (not Gemini)

3. **Check Logs**
   - Look for "Powered by Groq AI" in the chatbot footer
   - Check backend logs for any errors

## If You Don't Have a Deployed Backend

If your backend is NOT deployed yet, you have two options:

### Option A: Deploy Backend to Render (Recommended - Free Tier)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - Name: `skillbridge-backend`
   - Root Directory: `learner-pwa/backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   Add all variables from `learner-pwa/backend/.env` including:
   ```
   GROQ_API_KEY=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
   GROQ_MODEL=llama-3.3-70b-versatile
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   NODE_ENV=production
   PORT=5000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the service URL (e.g., `https://skillbridge-backend.onrender.com`)

6. **Update Vercel Frontend**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add/Update: `REACT_APP_API_URL = https://skillbridge-backend.onrender.com/api/v1`
   - Redeploy frontend

### Option B: Deploy Backend to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure root directory: `learner-pwa/backend`
6. Add environment variables (same as above)
7. Deploy and copy the URL
8. Update Vercel frontend with the Railway URL

## Database Setup

If you don't have MongoDB set up:

1. **Create MongoDB Atlas Account** (Free)
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free
   - Create a cluster (free tier)
   - Get connection string

2. **Add to Backend Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillbridge254
   ```

## Summary

**The issue:** Your production backend doesn't have the Groq API key configured.

**The fix:** 
1. Find where your backend is deployed
2. Add `GROQ_API_KEY` environment variable
3. Redeploy backend
4. Test the chatbot

**If backend is not deployed:**
1. Deploy to Render or Railway (free)
2. Add all environment variables including Groq API key
3. Update Vercel frontend to point to new backend URL
4. Test

## Need Help?

Tell me:
1. Where is your backend currently deployed? (Render/Railway/Heroku/Other)
2. Do you have a deployed backend at all?
3. What URL does your Vercel app use for API calls?

I can provide specific instructions based on your setup!
