# Quick Setup Reference Card

## 🚀 Fastest Way to Configure Email & Redis

### Step 1: Set Up Email (5 minutes)

**Using Gmail** (easiest for testing):

1. **Get App Password**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Factor Authentication
   - Click "App passwords"
   - Generate password for "Mail" → "Other"
   - Copy the 16-character code

2. **Add to Render**:
   - Go to https://dashboard.render.com/
   - Click your backend service
   - Go to "Environment" tab
   - Add these variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   EMAIL_FROM=your-email@gmail.com
   ```
   - Click "Save Changes"

✅ **Done!** Emails will now be sent.

---

### Step 2: Set Up Redis (3 minutes)

**Create Redis Instance**:

1. **Add Redis**:
   - Go to https://dashboard.render.com/
   - Click "New +" → "Redis"
   - Name: `skillbridge-redis`
   - Region: Same as your backend
   - Plan: Free
   - Click "Create Redis"

2. **Get Connection URL**:
   - Click on your Redis instance
   - Copy the **Internal Redis URL** (looks like: `redis://red-xxxxx:6379`)

3. **Add to Backend**:
   - Go to your backend service
   - Go to "Environment" tab
   - Add these variables:
   ```
   REDIS_ENABLED=true
   REDIS_URL=redis://red-xxxxx:6379
   ```
   - Click "Save Changes"

✅ **Done!** Redis is now connected.

---

## 📋 Environment Variables Checklist

Copy these to Render → Backend Service → Environment:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com

# Redis Configuration
REDIS_ENABLED=true
REDIS_URL=redis://red-xxxxx:6379
```

---

## ✅ Verification

After deployment completes, check Render logs for:

**Email Success**:
```
✅ info: Email queue connected to Redis successfully
✅ No "Connection timeout" errors
```

**Redis Success**:
```
✅ info: Email queue connected to Redis successfully
✅ No "[ioredis] Unhandled error event" messages
```

---

## 🔧 Troubleshooting

### Email Not Working?

**Error**: `Connection timeout`
- Check EMAIL_USER and EMAIL_PASS are correct
- For Gmail: Use App Password, not regular password
- Make sure 2FA is enabled on Gmail

### Redis Not Working?

**Error**: `[ioredis] Unhandled error event`
- Check REDIS_ENABLED=true
- Verify REDIS_URL is correct
- Make sure Redis instance is running in Render

---

## 💰 Cost

- **Gmail**: Free (500 emails/day)
- **Redis**: Free (25 MB storage)

**Total Cost**: $0/month 🎉

---

## 📚 Full Documentation

For detailed setup instructions, see:
- `EMAIL_AND_REDIS_SETUP_GUIDE.md` - Complete guide with all options
- `PRODUCTION_ISSUES_DIAGNOSIS.md` - Troubleshooting and diagnostics

---

## 🎯 What This Enables

**With Email**:
- ✅ Welcome emails for new users
- ✅ Password reset functionality
- ✅ Assessment completion notifications
- ✅ Module completion certificates

**With Redis**:
- ✅ Background email processing (faster response times)
- ✅ Email queue management
- ✅ Better reliability for email delivery
- ✅ Reduced server load

---

**Need help?** Check the full guide in `EMAIL_AND_REDIS_SETUP_GUIDE.md`
