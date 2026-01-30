# Fix Production Registration - Step-by-Step Guide

**Issue**: Registration returns 500 error on production
**Diagnosis**: Environment variables not properly configured on Render

---

## 🔴 Confirmed Issue

✅ Backend is running (health check passes)
✅ CORS is configured correctly
❌ Registration failing with 500 error

**Root Cause**: Missing or incorrect environment variables on Render

---

## 🛠️ Step-by-Step Fix (15 minutes)

### Step 1: Access Render Dashboard (2 minutes)

1. Open your browser
2. Go to: https://dashboard.render.com
3. Log in with your credentials
4. Find and click on your backend service (likely named "skillbridge-backend" or similar)

### Step 2: Check Environment Variables (5 minutes)

1. In your service dashboard, click on **"Environment"** in the left sidebar
2. You should see a list of environment variables

**Required Variables** (verify each one):

```bash
# CRITICAL - Authentication
JWT_SECRET=<your-secret-key>
# ⚠️ MUST be at least 32 characters
# ⚠️ If missing or too short, this is your problem!

JWT_EXPIRE=30d
# Token expiration time

# CRITICAL - Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillbridge254?retryWrites=true&w=majority
# ⚠️ Replace with your actual MongoDB Atlas connection string
# ⚠️ Ensure format is correct

# Application Settings
NODE_ENV=production
PORT=5000
API_VERSION=v1

# CORS
CORS_ORIGIN=https://skillbridge-tau.vercel.app
# Your frontend URL
```

### Step 3: Generate JWT_SECRET (if missing) (2 minutes)

If `JWT_SECRET` is missing or you're not sure if it's secure:

**Option A: Using Node.js (on your computer)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Using OpenSSL (on Mac/Linux)**
```bash
openssl rand -hex 32
```

**Option C: Using PowerShell (on Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option D: Manual (if above don't work)**
Use this secure random string:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 4: Add/Update Environment Variables (3 minutes)

1. In Render Environment tab, click **"Add Environment Variable"** (if variable doesn't exist)
2. Or click **"Edit"** next to existing variable

**Add these if missing:**

| Key | Value | Notes |
|-----|-------|-------|
| JWT_SECRET | (your 32+ char string) | CRITICAL |
| JWT_EXPIRE | 30d | Token validity |
| MONGODB_URI | (your connection string) | CRITICAL |
| NODE_ENV | production | Required |
| CORS_ORIGIN | https://skillbridge-tau.vercel.app | Your frontend URL |

3. Click **"Save Changes"** after adding/editing each variable

### Step 5: Verify MongoDB Atlas Configuration (3 minutes)

1. Go to: https://cloud.mongodb.com
2. Log in to your MongoDB Atlas account
3. Select your cluster

**Check Network Access:**
1. Click **"Network Access"** in left sidebar
2. Click **"IP Access List"** tab
3. Verify **0.0.0.0/0** is in the list (allows all IPs)
4. If not, click **"Add IP Address"**
5. Select **"Allow Access from Anywhere"**
6. Click **"Confirm"**

**Check Database User:**
1. Click **"Database Access"** in left sidebar
2. Verify your user exists
3. Verify user has **"Read and write to any database"** permission
4. Verify password matches what's in your MONGODB_URI

### Step 6: Redeploy Backend (2 minutes)

After updating environment variables:

1. In Render dashboard, go to your service
2. Click **"Manual Deploy"** button (top right)
3. Select **"Deploy latest commit"**
4. Wait for deployment to complete (usually 2-3 minutes)
5. Watch the logs for any errors

### Step 7: Test Registration (2 minutes)

After deployment completes:

```bash
node test-production-login.js
```

**Expected Result:**
```
📝 Test 2: Register new user
Status: 201
Response: {
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
✅ PASS: User registered successfully
```

If still failing, proceed to Step 8.

### Step 8: Check Render Logs (if still failing)

1. In Render dashboard, click **"Logs"** tab
2. Look for errors around the time of your test
3. Common errors and solutions:

**Error: "JWT_SECRET is not defined"**
- Solution: Add JWT_SECRET environment variable (Step 4)

**Error: "MongoServerError: bad auth"**
- Solution: Check MongoDB user credentials in MONGODB_URI

**Error: "MongooseServerSelectionError"**
- Solution: Check MongoDB Atlas IP whitelist (Step 5)

**Error: "Validation error"**
- Solution: Check MONGODB_URI format is correct

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] JWT_SECRET is set (minimum 32 characters)
- [ ] JWT_EXPIRE is set to "30d"
- [ ] MONGODB_URI is correct and complete
- [ ] NODE_ENV is set to "production"
- [ ] CORS_ORIGIN matches frontend URL
- [ ] MongoDB Atlas IP whitelist includes 0.0.0.0/0
- [ ] MongoDB user has correct permissions
- [ ] Backend redeployed after changes
- [ ] Registration test returns 201 status
- [ ] Can login with newly registered user

---

## 🎯 Quick Test Commands

**Test registration:**
```bash
node test-production-login.js
```

**Test with diagnostic:**
```bash
node diagnose-production-issue.js
```

**Test manually with curl:**
```bash
curl -X POST https://skillbridge-backend-t35r.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "profile": {
      "firstName": "Test",
      "lastName": "User"
    }
  }'
```

---

## 🆘 Still Not Working?

If registration still fails after following all steps:

1. **Copy the exact error from Render logs**
2. **Check these common issues:**
   - JWT_SECRET has special characters that need escaping
   - MONGODB_URI password has special characters (@ # $ %)
   - MongoDB cluster is paused or deleted
   - Render service is out of memory/resources

3. **Try these debugging steps:**
   - Restart the Render service
   - Check if MongoDB Atlas cluster is active
   - Verify connection string by testing locally
   - Check Render service logs for memory/CPU issues

---

## 📊 Expected Timeline

- Step 1-2: 7 minutes (check current state)
- Step 3-4: 5 minutes (fix environment variables)
- Step 5: 3 minutes (verify MongoDB)
- Step 6-7: 4 minutes (deploy and test)
- **Total: ~20 minutes**

---

## 🎉 Success Indicators

You'll know it's fixed when:

1. ✅ `node test-production-login.js` shows registration returning 201
2. ✅ Can login with newly registered user
3. ✅ No 500 errors in Render logs
4. ✅ Frontend registration works on https://skillbridge-tau.vercel.app

---

**Need Help?** Check the detailed logs in Render dashboard and look for the specific error message. The error will tell you exactly what's wrong.
