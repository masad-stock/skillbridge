# Vercel Deployment Troubleshooting Guide

## Problem
Vercel is showing an old version of the app even after reconnecting the repository.

## Solutions Applied

### 1. Configuration Updates
- Added `.vercelignore` to prevent local artifacts from interfering
- Updated `vercel.json` to use `npm ci` instead of `npm install` for cleaner builds
- Added cache control headers for service worker

### 2. Steps to Force Fresh Deployment

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Scroll down and click **"Clear Build Cache & Redeploy"**
5. Or go to **Deployments** tab
6. Click the three dots (...) on the latest deployment
7. Select **"Redeploy"** and check **"Use existing Build Cache"** = OFF

#### Option B: Via Git Commands
```bash
# Commit the new configuration files
git add .vercelignore vercel.json
git commit -m "fix: update Vercel configuration for clean builds"
git push origin main

# This will trigger a new deployment automatically
```

#### Option C: Via Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy with force flag (clears cache)
vercel --prod --force
```

### 3. Verify Deployment

After deployment, check:
1. **Build logs** in Vercel dashboard to ensure it's using the latest code
2. **Deployment URL** - Add `?v=` + timestamp to bypass browser cache
3. **Check commit SHA** in deployment details matches your latest commit

### 4. Additional Troubleshooting

If still showing old version:

#### Check Git Repository Connection
1. Vercel Dashboard → Project Settings → Git
2. Verify the correct branch is selected (usually `main` or `master`)
3. Ensure "Production Branch" matches your main branch name

#### Clear Browser Cache
```
Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
Or open in incognito/private window
```

#### Check Environment Variables
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Ensure all required variables are set:
   - `REACT_APP_API_URL`
   - `REACT_APP_BACKEND_URL`
   - Any other `REACT_APP_*` variables your app needs

#### Verify Build Command
In Vercel Dashboard → Project Settings → General:
- Build Command: `cd learner-pwa && npm ci --legacy-peer-deps && npm run build`
- Output Directory: `learner-pwa/build`
- Install Command: `cd learner-pwa && npm ci --legacy-peer-deps`

### 5. Common Issues

**Issue**: "Module not found" errors
**Solution**: Ensure `package-lock.json` is committed to git

**Issue**: Build succeeds but shows old content
**Solution**: Check if service worker is caching old content. Clear service worker in browser DevTools → Application → Service Workers → Unregister

**Issue**: Environment variables not working
**Solution**: Ensure all `REACT_APP_*` variables are set in Vercel dashboard and redeploy

### 6. Quick Fix Commands

```bash
# 1. Ensure latest code is committed
git status
git add .
git commit -m "fix: force fresh deployment"

# 2. Push to trigger deployment
git push origin main

# 3. Or use Vercel CLI to force deploy
vercel --prod --force

# 4. Check deployment status
vercel ls
```

## Key Changes Made

1. **`.vercelignore`**: Prevents local build artifacts from being uploaded
2. **`vercel.json`**: 
   - Uses `npm ci` for reproducible builds
   - Added version 2 specification
   - Added security headers
   - Added service worker cache control

## Next Steps

1. Commit and push the configuration changes
2. Clear Vercel build cache via dashboard
3. Trigger a new deployment
4. Verify the deployment shows your latest commit SHA
5. Test the deployed app in incognito mode to avoid browser cache

## Support

If issues persist:
- Check Vercel build logs for specific errors
- Verify your GitHub repository has the latest commits
- Ensure the correct branch is connected in Vercel
- Contact Vercel support with your deployment URL and build logs
