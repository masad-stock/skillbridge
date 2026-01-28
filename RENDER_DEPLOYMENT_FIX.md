# Render Deployment Fix

## Issues Fixed

### 1. Express Trust Proxy Configuration ✅
**Error:** `ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false`

**Fix Applied:** Added `app.set('trust proxy', 1);` to `server.js`

This is critical for Render deployments because:
- Render uses reverse proxies
- Rate limiting needs to identify real client IPs
- Without this, all requests appear to come from the same IP

### 2. JWT Token Expiration Configuration ⚠️
**Error:** `"expiresIn" should be a number of seconds or string representing a timespan`

**Root Cause:** Missing `JWT_EXPIRE` environment variable in Render

**Action Required:** Add this environment variable in Render dashboard:
```
JWT_EXPIRE=30d
```

Valid formats:
- `30d` (30 days)
- `7d` (7 days)
- `24h` (24 hours)
- `3600` (3600 seconds)

### 3. Email Service Timeout (Non-Critical)
**Error:** `Connection timeout` to SMTP server

This won't block core functionality but affects:
- Welcome emails
- Password reset emails
- Notification emails

**Possible Causes:**
- Render's outbound SMTP restrictions
- Incorrect email credentials
- Gmail blocking connections

**Solutions:**
1. Use a transactional email service (recommended):
   - SendGrid
   - Mailgun
   - AWS SES
   - Postmark

2. Or verify Gmail App Password is correct and 2FA is enabled

## Deployment Checklist

### Required Environment Variables in Render

Check your Render dashboard and ensure these are set:

```bash
# Critical - Must be set
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret-key
JWT_EXPIRE=30d

# Important
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://skillbridge-tau.vercel.app

# Email (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional but recommended
GROQ_API_KEY=your-groq-key
ML_SERVICE_URL=your-ml-service-url
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Steps to Deploy Fix

1. **Commit and push the changes:**
   ```bash
   git add learner-pwa/backend/server.js learner-pwa/backend/.env.example
   git commit -m "Fix: Add trust proxy and JWT_EXPIRE for Render deployment"
   git push origin main
   ```

2. **Add JWT_EXPIRE in Render Dashboard:**
   - Go to your Render service
   - Navigate to "Environment" tab
   - Add new variable: `JWT_EXPIRE` = `30d`
   - Click "Save Changes"

3. **Render will auto-deploy** after detecting the git push

4. **Monitor the logs** for successful startup:
   - Should see: "Server running on port 5000"
   - Should NOT see the trust proxy error
   - Should NOT see the JWT expiresIn error

### Verification

After deployment, test the login endpoint:
```bash
curl -X POST https://skillbridge-backend-t35r.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

Expected: Should return a token (or proper error if credentials are wrong)

### MongoDB Connection

Your logs show MongoDB connected successfully ✅
```
info: MongoDB connected successfully
```

### Additional Notes

- The duplicate schema index warning is non-critical
- Email service timeout won't affect core functionality
- Rate limiting will now work correctly with proxies
- JWT tokens will generate properly

## Next Steps

1. Deploy the fix (commit + push)
2. Add `JWT_EXPIRE=30d` to Render environment variables
3. Wait for auto-deploy to complete
4. Test login functionality
5. (Optional) Fix email service if needed
