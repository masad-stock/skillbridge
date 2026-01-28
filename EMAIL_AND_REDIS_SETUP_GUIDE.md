# Email and Redis Configuration Guide for Render

This guide walks you through setting up email service and Redis for your application on Render.

---

## Part 1: Email Configuration

Email is used for:
- Welcome emails when users register
- Password reset emails
- Assessment completion notifications
- Module completion certificates
- Weekly progress reports

### Option A: Using Gmail (Easiest for Testing)

#### Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled
4. After enabling 2FA, go back to Security
5. Click on "App passwords" (you'll see this only after enabling 2FA)
6. Select "Mail" and "Other (Custom name)"
7. Enter "SkillBridge App" as the name
8. Click "Generate"
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

#### Step 2: Add Environment Variables to Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Click on your backend service (skillbridge-backend-t35r)
3. Click on "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add these three variables:

```
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=abcdefghijklmnop  (the 16-char app password, no spaces)
EMAIL_FROM=noreply@yourdomain.com  (or use your Gmail address)
```

6. Click "Save Changes"
7. Render will automatically redeploy your service

#### Step 3: Test Email Functionality

After deployment completes:
1. Try registering a new user
2. Try password reset
3. Check your Gmail sent folder to see if emails were sent

---

### Option B: Using SendGrid (Recommended for Production)

SendGrid is a professional email service with better deliverability and higher sending limits.

#### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up for a free account (100 emails/day free forever)
3. Verify your email address
4. Complete the sender verification process

#### Step 2: Create API Key

1. Log in to SendGrid dashboard
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Name it "SkillBridge Production"
5. Select "Full Access" or "Restricted Access" with Mail Send permissions
6. Click "Create & View"
7. **Copy the API key** (starts with `SG.`)

#### Step 3: Verify Sender Identity

1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your details (use your real email)
4. Check your email and click the verification link

#### Step 4: Configure Render Environment Variables

1. Go to your Render dashboard
2. Click on your backend service
3. Go to Environment tab
4. Add these variables:

```
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=SG.your-actual-api-key-here
EMAIL_FROM=noreply@yourdomain.com  (must match verified sender)
```

5. Save and wait for redeployment

---

### Option C: Using Mailgun (Alternative)

#### Step 1: Create Mailgun Account

1. Go to https://www.mailgun.com/
2. Sign up for free trial (5,000 emails/month for 3 months)
3. Verify your email

#### Step 2: Get SMTP Credentials

1. Log in to Mailgun dashboard
2. Go to Sending → Domain settings
3. Click on your sandbox domain (or add your own domain)
4. Go to "SMTP credentials" tab
5. Note down:
   - SMTP hostname (usually: smtp.mailgun.org)
   - Port: 587
   - Username (looks like: postmaster@sandboxXXX.mailgun.org)
   - Password (click "Reset password" if needed)

#### Step 3: Configure Render

```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@sandboxXXX.mailgun.org
EMAIL_PASS=your-mailgun-password
EMAIL_FROM=noreply@sandboxXXX.mailgun.org
```

---

## Part 2: Redis Configuration

Redis is used for:
- Email queue management (background job processing)
- Caching frequently accessed data
- Session management
- Rate limiting

### Step 1: Add Redis to Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Click "New +" button in the top right
3. Select "Redis"
4. Configure:
   - **Name**: `skillbridge-redis`
   - **Region**: Same as your backend (for lower latency)
   - **Plan**: Free (25 MB, perfect for email queue)
   - **Maxmemory Policy**: `allkeys-lru` (recommended)
5. Click "Create Redis"
6. Wait for Redis to be created (~1-2 minutes)

### Step 2: Get Redis Connection Details

1. Click on your newly created Redis instance
2. You'll see connection details:
   - **Internal Redis URL**: `redis://red-xxxxx:6379` (use this!)
   - **External Redis URL**: `rediss://red-xxxxx:6379` (for external access)
3. **Copy the Internal Redis URL**

### Step 3: Configure Backend to Use Redis

1. Go to your backend service in Render
2. Click "Environment" tab
3. Add these environment variables:

```
REDIS_ENABLED=true
REDIS_URL=redis://red-xxxxx:6379  (paste the Internal Redis URL)
```

**Note**: If you use `REDIS_URL`, you don't need separate `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` variables.

4. Click "Save Changes"
5. Render will redeploy your service

### Step 4: Update Code to Use REDIS_URL (if needed)

Your current code might need a small update to use `REDIS_URL`. Let me check and update if necessary.

---

## Part 3: Verification

### Check Email Configuration

1. Watch Render logs after deployment
2. Look for: `info: Email queue connected to Redis successfully`
3. No more `Connection timeout` errors
4. Try registering a new user and check if welcome email arrives

### Check Redis Configuration

1. Watch Render logs
2. Look for: `info: Email queue connected to Redis successfully`
3. No more `[ioredis] Unhandled error event` messages
4. Redis should show active connections in its dashboard

---

## Environment Variables Summary

### Minimal Configuration (Gmail + Redis)

```bash
# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=noreply@yourdomain.com

# Redis
REDIS_ENABLED=true
REDIS_URL=redis://red-xxxxx:6379
```

### Production Configuration (SendGrid + Redis)

```bash
# Email (SendGrid)
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Redis
REDIS_ENABLED=true
REDIS_URL=redis://red-xxxxx:6379

# Optional: Redis with password
REDIS_HOST=red-xxxxx.render.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

---

## Troubleshooting

### Email Not Sending

**Check logs for**:
```
error: Email service error: Connection timeout
```

**Solutions**:
1. Verify EMAIL_USER and EMAIL_PASS are correct
2. For Gmail: Make sure you're using App Password, not regular password
3. For Gmail: Make sure 2FA is enabled
4. Check EMAIL_FROM matches your verified sender

### Redis Connection Errors

**Check logs for**:
```
[ioredis] Unhandled error event: AggregateError [ECONNREFUSED]
```

**Solutions**:
1. Verify REDIS_ENABLED=true
2. Check REDIS_URL is correct (should start with `redis://`)
3. Make sure Redis instance is running in Render dashboard
4. Use Internal Redis URL, not External

### Still Getting Warnings

**If you see**:
```
Email queue unavailable, attempting direct send
```

This means Redis isn't connected, but emails will still be sent directly (slower but works).

---

## Cost Breakdown

### Free Tier Limits

**Email Services**:
- Gmail: 500 emails/day (free)
- SendGrid: 100 emails/day (free forever)
- Mailgun: 5,000 emails/month for 3 months (then paid)

**Redis**:
- Render Free: 25 MB storage (perfect for email queue)
- Upgrade to $7/month for 256 MB if needed

### Recommended Setup

For a production app with moderate traffic:
- **Email**: SendGrid Free (100/day) or Paid ($15/month for 40k emails)
- **Redis**: Render Free (25 MB) - upgrade only if you need more storage

---

## Next Steps

1. **Set up email first** (easier, more visible impact)
   - Start with Gmail for testing
   - Switch to SendGrid for production

2. **Add Redis second** (improves performance)
   - Create Redis instance on Render
   - Add REDIS_URL to environment variables

3. **Test everything**
   - Register new user → check welcome email
   - Reset password → check reset email
   - Monitor Render logs for errors

4. **Monitor usage**
   - Check SendGrid dashboard for email stats
   - Check Redis dashboard for memory usage
   - Set up alerts if approaching limits

---

## Quick Start Commands

### To add environment variables via Render CLI (optional)

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Add environment variables
render env set EMAIL_USER=your-email@gmail.com
render env set EMAIL_PASS=your-app-password
render env set REDIS_ENABLED=true
render env set REDIS_URL=redis://red-xxxxx:6379
```

---

## Support Resources

- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Render Redis**: https://render.com/docs/redis
- **Render Environment Variables**: https://render.com/docs/environment-variables

---

**Need help?** Check the Render logs for specific error messages and refer to the troubleshooting section above.
