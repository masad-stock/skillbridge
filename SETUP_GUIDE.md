# Complete Setup Guide - Email & Redis Configuration

**Your app is already running!** This guide helps you add email functionality and optionally Redis for better performance.

---

## Quick Start (5 Minutes)

### Step 1: Configure Email

1. **Get Gmail App Password**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Factor Authentication
   - Click "App passwords"
   - Generate password for "Mail" → "Other"
   - Copy the 16-character code (e.g., `abcd efgh ijkl mnop`)

2. **Add to Render**:
   - Go to https://dashboard.render.com/
   - Click your backend service → "Environment" tab
   - Add these variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   EMAIL_FROM=your-email@gmail.com
   ```
   - Click "Save Changes"

✅ **Done!** Emails will now be sent.

### Step 2: Redis (Optional - Skip for Now)

**Important**: Your app works perfectly without Redis. Skip this unless you need background email processing.

---

## Email Configuration Options

### Option A: Gmail (Easiest - Free)

**Limits**: 500 emails/day

**Setup**:
1. Enable 2FA on your Google account
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Add to Render:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

### Option B: SendGrid (Production - Free Tier)

**Limits**: 100 emails/day free forever

**Setup**:
1. Sign up at https://sendgrid.com/
2. Verify your email and sender identity
3. Create API Key (Settings → API Keys)
4. Add to Render:
   ```
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASS=SG.your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Option C: Mailgun (Alternative)

**Limits**: 5,000 emails/month for 3 months

**Setup**:
1. Sign up at https://mailgun.com/
2. Get SMTP credentials from dashboard
3. Add to Render:
   ```
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USER=postmaster@sandboxXXX.mailgun.org
   EMAIL_PASS=your-mailgun-password
   EMAIL_FROM=noreply@sandboxXXX.mailgun.org
   ```

---

## Redis Configuration (Optional)

### Do You Need Redis?

**Skip Redis if**:
- You're just testing
- You send < 100 emails/day
- You're okay with slightly slower responses

**Add Redis if**:
- You need background processing
- You send > 100 emails/day
- You want faster API responses
- You need email retry logic

### Redis Options

#### Option 1: No Redis (Recommended for Now)

**Cost**: Free  
**Setup**: Do nothing!

Your app already handles this gracefully. Emails are sent directly instead of queued.

#### Option 2: Upstash (Free Tier)

**Cost**: Free  
**Limits**: 10,000 commands/day, 256 MB

**Setup**:
1. Go to https://upstash.com/
2. Sign up and create a database
3. Copy the Redis URL
4. Add to Render:
   ```
   REDIS_ENABLED=true
   REDIS_URL=rediss://default:password@host:port
   ```

#### Option 3: Redis Cloud (Free Tier)

**Cost**: Free  
**Limits**: 30 MB

**Setup**:
1. Go to https://redis.com/try-free/
2. Create account and database
3. Get connection details
4. Add to Render:
   ```
   REDIS_ENABLED=true
   REDIS_URL=redis://default:password@host:port
   ```

#### Option 4: Render Redis (Paid)

**Cost**: $7/month (256 MB)

**Setup**:
1. In Render dashboard: New + → Redis
2. Choose paid plan
3. Copy Internal Redis URL
4. Add to backend environment variables

---

## Environment Variables Summary

### Minimal Setup (Email Only - Recommended)

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com

# Redis (optional - leave disabled)
REDIS_ENABLED=false
```

### With Redis (Optional)

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com

# Redis Configuration (Upstash)
REDIS_ENABLED=true
REDIS_URL=rediss://default:password@host:port
```

---

## Verification

After deployment, check Render logs:

### Email Success
```
✅ No "Connection timeout" errors
✅ Emails being sent
```

### Redis Success (if configured)
```
✅ info: Email queue connected to Redis successfully
✅ No "[ioredis] Unhandled error event" messages
```

### Without Redis (default)
```
✅ info: Redis disabled - emails will be sent directly
✅ This is normal and expected!
```

---

## Troubleshooting

### Email Not Sending

**Error**: `Connection timeout`

**Solutions**:
1. Verify EMAIL_USER and EMAIL_PASS are correct
2. For Gmail: Use App Password, not regular password
3. For Gmail: Make sure 2FA is enabled
4. Check EMAIL_FROM matches your verified sender

### Redis Connection Errors

**Error**: `[ioredis] Unhandled error event`

**Solutions**:
1. Verify REDIS_ENABLED=true
2. Check REDIS_URL is correct
3. Make sure Redis instance is running
4. Use correct URL format (redis:// or rediss://)

### Mongoose Warnings

**Warning**: `Duplicate schema index`

**Status**: Fixed in latest deployment. Will disappear on next deploy.

---

## What You Get

### With Email Only
- ✅ Welcome emails for new users
- ✅ Password reset functionality
- ✅ Assessment completion notifications
- ✅ Module completion certificates
- ✅ $0/month

### With Email + Redis
- ✅ All of the above
- ✅ Background email processing
- ✅ Faster API responses
- ✅ Email retry logic
- ✅ Better reliability
- ✅ Still $0/month (with Upstash)

---

## Cost Breakdown

| Service | Free Tier | Paid Option |
|---------|-----------|-------------|
| **Gmail** | 500 emails/day | N/A |
| **SendGrid** | 100 emails/day | $15/mo (40k emails) |
| **Mailgun** | 5k emails/3mo | $35/mo (50k emails) |
| **Upstash Redis** | 10k commands/day | $10/mo (1M commands) |
| **Redis Cloud** | 30 MB | $5/mo (250 MB) |
| **Render Redis** | N/A | $7/mo (256 MB) |

**Recommended Free Setup**: Gmail + Upstash = $0/month

---

## Current Production Status

Your application on Render is:
- ✅ Running successfully
- ✅ MongoDB connected
- ✅ All features working
- ✅ No critical errors
- ⚠️ Email not configured (optional)
- ⚠️ Redis not configured (optional)

**This is fine!** The warnings you see are expected when email/Redis aren't configured.

---

## Issues Fixed

### 1. Mongoose Duplicate Index Warnings ✅
- Fixed in Payment.js, ImageMetadata.js, ResearchEvent.js
- Will disappear on next deployment

### 2. Bull/Redis Configuration Error ✅
- Removed incompatible Redis options
- Server starts without errors

### 3. Email Queue Resilience ✅
- App works without Redis
- Graceful fallback to direct email sending

---

## Next Steps

1. **Now**: Configure email (5 minutes)
2. **Test**: Register a user and check for welcome email
3. **Later**: Add Redis if you need it (optional)
4. **Monitor**: Check Render logs for any issues

---

## Support Resources

- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Upstash**: https://upstash.com/
- **Render Docs**: https://render.com/docs

---

**Your app is working!** Email and Redis just add extra features. Start with email, add Redis later if needed.
