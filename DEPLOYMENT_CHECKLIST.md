# Deployment Checklist

## Quick Action Items

### ✅ Completed
- [x] Groq API key identified: `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`
- [x] Local backend configured correctly
- [x] Code uses `groqService` (not `geminiService`)
- [x] Created deployment guides
- [x] Created `render.yaml` for easy deployment

### 🔲 To Do

#### 1. Setup MongoDB Atlas (15 minutes)
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/register
- [ ] Create free cluster
- [ ] Create database user
- [ ] Whitelist IP addresses (0.0.0.0/0)
- [ ] Get connection string
- [ ] Save connection string securely

#### 2. Deploy Backend to Render (10 minutes)
- [ ] Create Render account at https://render.com
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Configure service:
  - Root Directory: `learner-pwa/backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Add environment variables (see below)
- [ ] Deploy and wait for "Live" status
- [ ] Copy backend URL

#### 3. Configure Vercel Frontend (5 minutes)
- [ ] Go to Vercel dashboard
- [ ] Add environment variable:
  - Name: `REACT_APP_API_URL`
  - Value: `https://your-backend.onrender.com/api/v1`
- [ ] Clear build cache
- [ ] Redeploy

#### 4. Update CORS (2 minutes)
- [ ] Go to Render → Environment
- [ ] Update `CORS_ORIGIN` to your Vercel URL
- [ ] Save (auto-redeploys)

#### 5. Seed Database (5 minutes)
- [ ] Use Render Shell or local script
- [ ] Run `npm run db:setup`
- [ ] Run `npm run seed`

#### 6. Verify Everything (5 minutes)
- [ ] Test backend health endpoint
- [ ] Test frontend connection
- [ ] Test chatbot (should use Groq now!)
- [ ] Test login
- [ ] Check logs for errors

## Environment Variables for Render

Copy these to Render when deploying:

```
NODE_ENV = production
PORT = 5000

# MongoDB - GET FROM MONGODB ATLAS
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/skillbridge254

# JWT - GENERATE A RANDOM STRING (32+ characters)
JWT_SECRET = your-super-secret-jwt-key-change-this
JWT_EXPIRE = 30d

# Groq AI - YOUR KEY (CONFIRMED WORKING)
GROQ_API_KEY = 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
GROQ_MODEL = llama-3.3-70b-versatile
GROQ_TEMPERATURE = 0.7
GROQ_MAX_TOKENS = 2048

# CORS - UPDATE AFTER VERCEL DEPLOYMENT
CORS_ORIGIN = https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100

# Email (Optional)
EMAIL_FROM = noreply@skillbridge254.com
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587

# File Upload
MAX_FILE_SIZE = 10485760

# Logging
LOG_LEVEL = info
```

## Verification Checklist

### Backend Health Check
```
URL: https://your-backend.onrender.com/api/v1/chatbot/health

Expected Response:
{
  "status": "healthy",
  "model": "llama-3.3-70b-versatile",
  "configured": true  ← MUST BE TRUE!
}
```

### Frontend Connection
- [ ] Open Vercel app
- [ ] Open DevTools (F12)
- [ ] Check Console for errors
- [ ] Check Network tab for API calls
- [ ] Verify API calls go to Render backend

### Chatbot Test
- [ ] Open chatbot
- [ ] Send a message
- [ ] Should see "Powered by Groq AI" in footer
- [ ] Should get response (not error)
- [ ] Check it's NOT using Gemini

## Estimated Time

- **Total Time:** ~45 minutes
- **MongoDB Setup:** 15 min
- **Render Deployment:** 10 min
- **Vercel Configuration:** 5 min
- **CORS Update:** 2 min
- **Database Seeding:** 5 min
- **Testing:** 5 min
- **Buffer:** 3 min

## Common Issues & Quick Fixes

### Issue: "configured": false in health check
**Fix:** GROQ_API_KEY not set in Render environment variables

### Issue: CORS error
**Fix:** Update CORS_ORIGIN in Render to match Vercel URL

### Issue: Cannot connect to database
**Fix:** Check MONGODB_URI and MongoDB Atlas IP whitelist

### Issue: Slow first load
**Fix:** Normal for Render free tier (cold start)

## Resources

- **Detailed Guide:** See `DEPLOY_BACKEND_TO_RENDER.md`
- **Environment Setup:** See `VERCEL_ENV_SETUP.md`
- **Backend Status:** See `CHECK_BACKEND_STATUS.md`
- **Vercel Deployment:** See `VERCEL_DEPLOYMENT_GUIDE.md`

## Support

If stuck:
1. Check the detailed guides above
2. Review Render logs for errors
3. Verify all environment variables
4. Test health endpoints
5. Check MongoDB Atlas connection

## Success Criteria

✅ Backend deployed and "Live" on Render
✅ Health endpoint returns `"configured": true`
✅ Frontend deployed on Vercel
✅ Frontend connects to backend
✅ Chatbot uses Groq API (not Gemini)
✅ Can login and use the app
✅ No CORS errors
✅ No console errors

---

**Current Status:** Ready to deploy! Follow the checklist above.

**Your Groq API Key:** `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`

**Next Step:** Start with MongoDB Atlas setup (Step 1)
