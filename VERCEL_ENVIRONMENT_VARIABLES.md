# Vercel Frontend Environment Variables

**Project**: SkillBridge Frontend  
**Platform**: Vercel  
**Framework**: React (Create React App)

---

## 🔧 Required Environment Variables

### 1. REACT_APP_API_URL (CRITICAL)

**Description**: The backend API base URL  
**Purpose**: Tells the frontend where to send API requests

**Value for Production:**
```
https://skillbridge-backend-t35r.onrender.com/api/v1
```

**Value for Development:**
```
http://localhost:5001/api/v1
```

**Why it's needed:**
- Frontend needs to know where the backend is hosted
- All API calls (login, register, etc.) use this URL
- Without it, frontend defaults to `http://localhost:5001/api/v1` (won't work in production)

---

### 2. REACT_APP_REQUEST_TIMEOUT (OPTIONAL)

**Description**: API request timeout in milliseconds  
**Purpose**: How long to wait for API responses before timing out

**Recommended Value:**
```
60000
```
(60 seconds - good for mobile networks and cold starts)

**Default if not set:**
```
60000
```
(Already set in code as fallback)

**Why it's useful:**
- Mobile networks can be slow
- Render free tier has cold starts (first request takes longer)
- 60 seconds gives enough time for slow connections

---

## 📋 How to Add Environment Variables to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in to your account

2. **Select Your Project**
   - Click on your project (skillbridge or similar)
   - You'll see the project overview

3. **Go to Settings**
   - Click "Settings" tab at the top
   - Click "Environment Variables" in the left sidebar

4. **Add Variables**
   - Click "Add New" button
   - Fill in the form:

**Variable 1:**
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://skillbridge-backend-t35r.onrender.com/api/v1`
- **Environment**: Select all (Production, Preview, Development)
- Click "Save"

**Variable 2 (Optional):**
- **Key**: `REACT_APP_REQUEST_TIMEOUT`
- **Value**: `60000`
- **Environment**: Select all (Production, Preview, Development)
- Click "Save"

5. **Redeploy**
   - After adding variables, Vercel will ask if you want to redeploy
   - Click "Redeploy" to apply the changes
   - Or go to "Deployments" tab and click "Redeploy" on the latest deployment

---

### Method 2: Vercel CLI

If you have Vercel CLI installed:

```bash
# Add production environment variable
vercel env add REACT_APP_API_URL production
# When prompted, enter: https://skillbridge-backend-t35r.onrender.com/api/v1

# Add preview environment variable
vercel env add REACT_APP_API_URL preview
# When prompted, enter: https://skillbridge-backend-t35r.onrender.com/api/v1

# Add development environment variable
vercel env add REACT_APP_API_URL development
# When prompted, enter: http://localhost:5001/api/v1

# Redeploy
vercel --prod
```

---

### Method 3: .env File (Local Development Only)

For local development, create `.env` file in `learner-pwa/` directory:

```bash
# learner-pwa/.env
REACT_APP_API_URL=http://localhost:5001/api/v1
REACT_APP_REQUEST_TIMEOUT=60000
```

**⚠️ IMPORTANT**: Never commit `.env` file to git! It's already in `.gitignore`.

---

## ✅ Verification

### Check if Variables are Set

1. **In Vercel Dashboard:**
   - Go to Settings → Environment Variables
   - You should see `REACT_APP_API_URL` listed

2. **In Your Deployed App:**
   - Open browser console (F12)
   - Type: `console.log(process.env.REACT_APP_API_URL)`
   - Should show: `https://skillbridge-backend-t35r.onrender.com/api/v1`

3. **Test API Connection:**
   - Try to register or login on your deployed site
   - Open Network tab in browser DevTools
   - Check if requests go to `https://skillbridge-backend-t35r.onrender.com`

---

## 🔍 Troubleshooting

### Issue: "Unable to connect to server"

**Cause**: `REACT_APP_API_URL` not set or incorrect

**Solution:**
1. Check Vercel environment variables
2. Verify the URL is correct (no trailing slash)
3. Redeploy after adding the variable

### Issue: "Request timed out"

**Cause**: `REACT_APP_REQUEST_TIMEOUT` too short or backend slow

**Solution:**
1. Set `REACT_APP_REQUEST_TIMEOUT` to `60000`
2. Check if backend is running (visit backend URL in browser)
3. Wait for Render cold start to complete

### Issue: Variables not working after adding

**Cause**: Need to redeploy for changes to take effect

**Solution:**
1. Go to Vercel dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on latest deployment
4. Wait for deployment to complete

### Issue: CORS errors

**Cause**: Backend CORS not configured for frontend URL

**Solution:**
1. Check backend `CORS_ORIGIN` environment variable on Render
2. Should be: `https://skillbridge-tau.vercel.app`
3. Or use your actual Vercel deployment URL

---

## 📊 Environment Variable Summary

| Variable | Required | Production Value | Development Value |
|----------|----------|------------------|-------------------|
| REACT_APP_API_URL | ✅ Yes | `https://skillbridge-backend-t35r.onrender.com/api/v1` | `http://localhost:5001/api/v1` |
| REACT_APP_REQUEST_TIMEOUT | ⚠️ Optional | `60000` | `60000` |

---

## 🎯 Quick Setup Checklist

- [ ] Go to Vercel dashboard
- [ ] Select your project
- [ ] Go to Settings → Environment Variables
- [ ] Add `REACT_APP_API_URL` = `https://skillbridge-backend-t35r.onrender.com/api/v1`
- [ ] Add `REACT_APP_REQUEST_TIMEOUT` = `60000` (optional)
- [ ] Select all environments (Production, Preview, Development)
- [ ] Save changes
- [ ] Redeploy the project
- [ ] Test login/registration on deployed site

---

## 🔗 Related Configuration

### Backend (Render) Environment Variables

Make sure these are set on Render:

| Variable | Value |
|----------|-------|
| MONGODB_URI | `mongodb+srv://skillbridge_admin:3nSvXo8jWeIJAZk4@cluster0.ysrm5gq.mongodb.net/skillbridge254?retryWrites=true&w=majority&appName=Cluster0` |
| JWT_SECRET | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2` |
| JWT_EXPIRE | `30d` |
| NODE_ENV | `production` |
| CORS_ORIGIN | `https://skillbridge-tau.vercel.app` |
| PORT | `5000` |
| API_VERSION | `v1` |

### CORS Configuration

The backend must allow requests from your Vercel frontend URL. Check that `CORS_ORIGIN` on Render matches your Vercel deployment URL.

---

## 📱 Testing After Setup

### Test 1: Check API URL

1. Open your deployed site: https://skillbridge-tau.vercel.app
2. Open browser console (F12)
3. Go to Network tab
4. Try to login or register
5. Check the request URL - should be `https://skillbridge-backend-t35r.onrender.com/api/v1/auth/...`

### Test 2: Test Registration

1. Go to your deployed site
2. Click "Register" or "Sign Up"
3. Fill in the form
4. Submit
5. Should successfully create account (if backend is configured)

### Test 3: Test Login

1. Go to your deployed site
2. Click "Login" or "Sign In"
3. Enter credentials
4. Submit
5. Should successfully login and redirect to dashboard

---

## 🎓 Important Notes

### About REACT_APP_ Prefix

- ✅ All environment variables in Create React App **must** start with `REACT_APP_`
- ✅ This is a security feature - prevents exposing sensitive backend variables
- ✅ Variables without this prefix won't be accessible in the frontend

### About Redeployment

- ⚠️ Environment variables are only loaded during build time
- ⚠️ You **must redeploy** after adding/changing variables
- ⚠️ Simply saving the variable is not enough

### About Security

- ✅ Frontend environment variables are **public** (visible in browser)
- ✅ Never put secrets (API keys, passwords) in frontend env vars
- ✅ Backend URL is safe to expose (it's public anyway)

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Vercel shows environment variables in Settings
2. ✅ Browser console shows correct API URL
3. ✅ Network requests go to Render backend
4. ✅ Login and registration work on deployed site
5. ✅ No CORS errors in console
6. ✅ No "Unable to connect to server" errors

---

## 🚀 Next Steps After Setup

1. Test registration on deployed site
2. Test login on deployed site
3. Test on mobile device
4. Monitor for any errors
5. Check Vercel deployment logs if issues occur

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs/concepts/projects/environment-variables
- Check browser console for errors
- Check Vercel deployment logs
- Check Render backend logs

---

**Last Updated**: January 30, 2026  
**Status**: Ready to configure  
**Time Required**: 5 minutes
