# Production Login Credentials

**Date**: January 30, 2026  
**Status**: ✅ Production authentication is working!

---

## 🎉 Great News!

All production authentication tests passed:
- ✅ Registration: Working (201)
- ✅ Login: Working (200)
- ✅ Token generation: Working
- ✅ Duplicate email rejection: Working (400)
- ✅ Wrong password rejection: Working (401)

---

## 👤 Default Admin Account

### Option 1: Create Admin User (Recommended)

Run this command to create an admin account in production:

```bash
cd learner-pwa/backend
node scripts/createAdmin.js
```

**This will create:**
- 📧 Email: `admin@skillbridge.com`
- 🔑 Password: `admin123`
- 👤 Role: `admin`

**⚠️ IMPORTANT:** Change this password immediately after first login!

---

### Option 2: Register a New Account

You can register a new account directly on the live site:

1. Go to: https://skillbridge-tau.vercel.app
2. Click "Register" or "Sign Up"
3. Fill in your details:
   - Email: your-email@example.com
   - Password: (choose a secure password)
   - First Name: Your Name
   - Last Name: Your Last Name
4. Click "Register"
5. You'll be logged in automatically

**Note:** New accounts have `user` role by default. To make it admin, you need to update the database.

---

## 🔐 Test Account (Already Created)

From the production test, this account was created:

- 📧 Email: `test1769801993674@example.com`
- 🔑 Password: `TestPass123!`
- 👤 Role: `user`
- ✅ Status: Active and working

**You can use this to test login immediately!**

---

## 🚀 How to Login

### On Production Site

1. **Go to your deployed frontend:**
   - URL: https://skillbridge-tau.vercel.app

2. **Click "Login" or "Sign In"**

3. **Enter credentials:**
   - Email: `test1769801993674@example.com`
   - Password: `TestPass123!`
   
   OR (if you created admin):
   - Email: `admin@skillbridge.com`
   - Password: `admin123`

4. **Click "Login"**

5. **You should be redirected to the dashboard**

---

## 🛠️ Creating Admin User in Production

### Method 1: Using MongoDB Atlas (Recommended)

1. **Go to MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com
   - Login with your credentials

2. **Navigate to your cluster:**
   - Click "Browse Collections"
   - Select database: `skillbridge254`
   - Select collection: `users`

3. **Find your user:**
   - Search for your email
   - Click "Edit Document"

4. **Change role to admin:**
   - Find the `role` field
   - Change value from `"user"` to `"admin"`
   - Click "Update"

5. **Done!** Your account now has admin privileges

---

### Method 2: Using Backend Script

1. **SSH into Render (if possible)** or run locally:

```bash
cd learner-pwa/backend
node scripts/createAdmin.js
```

2. **This creates:**
   - Email: admin@skillbridge.com
   - Password: admin123
   - Role: admin

---

### Method 3: Using MongoDB Compass

1. **Download MongoDB Compass:**
   - Visit: https://www.mongodb.com/products/compass

2. **Connect to your database:**
   - Connection string: `mongodb+srv://skillbridge_admin:3nSvXo8jWeIJAZk4@cluster0.ysrm5gq.mongodb.net/skillbridge254`

3. **Navigate to users collection:**
   - Database: skillbridge254
   - Collection: users

4. **Edit user document:**
   - Find your user
   - Change `role` field to `"admin"`
   - Save

---

## 📊 Account Summary

| Email | Password | Role | Status | Created |
|-------|----------|------|--------|---------|
| test1769801993674@example.com | TestPass123! | user | ✅ Active | Test account |
| admin@skillbridge.com | admin123 | admin | ⏳ Create it | Default admin |
| (your email) | (your password) | user | ⏳ Register | Your account |

---

## 🔒 Security Best Practices

### After First Login

1. **Change default passwords immediately**
   - Especially for admin@skillbridge.com

2. **Use strong passwords:**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `MyStr0ng!Pass2026`

3. **Enable two-factor authentication** (if implemented)

4. **Don't share credentials**
   - Each user should have their own account

---

## 🧪 Testing Login

### Quick Test

1. **Open browser**
2. **Go to:** https://skillbridge-tau.vercel.app
3. **Click "Login"**
4. **Enter:**
   - Email: `test1769801993674@example.com`
   - Password: `TestPass123!`
5. **Click "Login"**
6. **Expected:** Redirect to dashboard

### If Login Fails

**Check these:**

1. **Frontend environment variable:**
   - Go to Vercel dashboard
   - Check `REACT_APP_API_URL` is set to:
     `https://skillbridge-backend-t35r.onrender.com/api/v1`

2. **Backend CORS:**
   - Go to Render dashboard
   - Check `CORS_ORIGIN` includes your Vercel URL

3. **Browser console:**
   - Press F12
   - Check for errors
   - Look for network requests

4. **Network tab:**
   - Check if requests go to correct backend URL
   - Check response status codes

---

## 🎯 Next Steps

### 1. Configure Vercel Frontend (5 minutes)

**Add environment variable:**
- Go to: https://vercel.com/dashboard
- Select your project
- Go to Settings → Environment Variables
- Add:
  - Key: `REACT_APP_API_URL`
  - Value: `https://skillbridge-backend-t35r.onrender.com/api/v1`
  - Environment: All (Production, Preview, Development)
- Click "Redeploy"

### 2. Test Login on Live Site (2 minutes)

**Use test account:**
- Email: `test1769801993674@example.com`
- Password: `TestPass123!`

### 3. Create Your Admin Account (3 minutes)

**Option A: Register then upgrade:**
1. Register on site with your email
2. Use MongoDB Atlas to change role to "admin"

**Option B: Use script:**
1. Run `node scripts/createAdmin.js`
2. Login with admin@skillbridge.com / admin123
3. Change password immediately

### 4. Create Pull Request (3 minutes)

**Merge your improvements:**
1. Visit: https://github.com/masad-stock/skillbridge/compare/main...blackboxai/mobile-login-testing-framework
2. Create PR
3. Merge to main

---

## 📱 Mobile Testing

After Vercel is configured, test on mobile:

1. **Open on your phone:**
   - URL: https://skillbridge-tau.vercel.app

2. **Try to register:**
   - Use your email
   - Create account

3. **Try to login:**
   - Use test account or your account
   - Should work smoothly

4. **Check dashboard:**
   - Should load properly
   - No errors

---

## ✅ Success Checklist

- [ ] Backend deployed and running (✅ Done!)
- [ ] MongoDB connected (✅ Done!)
- [ ] Registration working (✅ Done!)
- [ ] Login working (✅ Done!)
- [ ] Test account created (✅ Done!)
- [ ] Vercel environment variable added (⏳ To do)
- [ ] Frontend redeployed (⏳ To do)
- [ ] Login tested on live site (⏳ To do)
- [ ] Admin account created (⏳ To do)
- [ ] Mobile testing completed (⏳ To do)
- [ ] Pull request merged (⏳ To do)

---

## 🆘 Troubleshooting

### "Unable to connect to server"

**Cause:** Frontend can't reach backend

**Solution:**
1. Add `REACT_APP_API_URL` to Vercel
2. Redeploy frontend
3. Clear browser cache

### "Invalid credentials"

**Cause:** Wrong email or password

**Solution:**
1. Double-check email and password
2. Try test account: test1769801993674@example.com / TestPass123!
3. Register a new account

### "CORS error"

**Cause:** Backend not allowing frontend origin

**Solution:**
1. Check `CORS_ORIGIN` on Render
2. Should be: `https://skillbridge-tau.vercel.app`
3. Redeploy backend if changed

### "Token expired"

**Cause:** JWT token expired (30 days default)

**Solution:**
1. Logout and login again
2. Token will be refreshed

---

## 📞 Support

**Documentation:**
- Backend setup: `FIX_PRODUCTION_REGISTRATION.md`
- Frontend setup: `VERCEL_ENVIRONMENT_VARIABLES.md`
- MongoDB setup: `MONGODB_SETUP_GUIDE_FOR_BEGINNERS.md`
- Testing guide: `COMPREHENSIVE_LOGIN_TESTING_PLAN.md`

**Test Results:**
- All production tests: ✅ PASSING
- Registration: ✅ Working (201)
- Login: ✅ Working (200)
- Token generation: ✅ Working

---

**Last Updated**: January 30, 2026  
**Status**: ✅ Production authentication fully operational  
**Test Account**: test1769801993674@example.com / TestPass123!
