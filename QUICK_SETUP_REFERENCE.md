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

### Step 2: Set Up Redis (Optional - See Note Below)

**⚠️ IMPORTANT**: Render no longer offers free Redis. See `REDIS_ALTERNATIVES.md` for options.

**Recommended**: Skip Redis for now - your app works fine without it!

**If you want Redis**, use Upstash (free tier):

1. **Create Upstash Account**:
   - Go to https://upstash.com/
   - Sign up and create a database
   - Copy the Redis URL

2. **Add to Backend**:
   - Go to your backend service
   - Go to "Environment" tab
   - Add these variables:
   ```
   REDIS_ENABLED=true
   REDIS_URL=rediss://default:password@host:port
   ```
   - Click "Save Changes"

✅ **Or skip this entirely** - emails will still work!

---

## 📋 Environment Variables Checklist

**Minimal Setup (Email Only - Recommended)**:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com

# Redis (optional - skip for now)
REDIS_ENABLED=false
```

**With Redis (Optional - if using Upstash)**:

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

## ✅ Verification

After deployment completes, check Render logs for:

**Email Success**:
```
✅ No "Connection timeout" errors (after adding email config)
```

**Redis (if configured)**:
```
✅ info: Email queue connected to Redis successfully
✅ No "[ioredis] Unhandled error event" messages
```

**Without Redis (default)**:
```
✅ info: Redis disabled - emails will be sent directly
✅ This is normal and expected!
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

**Recommended Setup (Email Only)**:
- **Gmail**: Free (500 emails/day)
- **Redis**: Not needed

**Total Cost**: $0/month 🎉

**With Redis (Optional)**:
- **Upstash Redis**: Free (10,000 commands/day, 256 MB)
- **Total Cost**: Still $0/month 🎉

---

## 📚 Full Documentation

For detailed setup instructions, see:
- `REDIS_ALTERNATIVES.md` - **START HERE** for Redis options
- `EMAIL_AND_REDIS_SETUP_GUIDE.md` - Complete email setup guide
- `PRODUCTION_ISSUES_DIAGNOSIS.md` - Troubleshooting and diagnostics

---

## 🎯 What This Enables

**With Email**:
- ✅ Welcome emails for new users
- ✅ Password reset functionality
- ✅ Assessment completion notifications
- ✅ Module completion certificates

**With Redis (Optional)**:
- ✅ Background email processing (faster response times)
- ✅ Email queue management
- ✅ Better reliability for email delivery
- ✅ Reduced server load

**Note**: Redis is optional. Your app works great without it!

---

**Need help?** Check the full guide in `EMAIL_AND_REDIS_SETUP_GUIDE.md`
