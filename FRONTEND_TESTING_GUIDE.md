# Frontend Login/Registration Testing Guide

## 🎯 Overview

This guide provides comprehensive testing procedures for the login and registration functionality on the deployed frontend at https://skillbridge-tau.vercel.app

---

## ✅ Pre-Test Verification

### 1. Environment Variables Check
Verify that `REACT_APP_API_URL` is set on Vercel:
```
REACT_APP_API_URL=https://skillbridge-backend-t35r.onrender.com/api/v1
```

**How to check:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Verify the variable exists for ALL environments

### 2. Backend Health Check
Test backend connectivity:
```bash
curl https://skillbridge-backend-t35r.onrender.com/api/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T..."
}
```

---

## 📝 Test Cases

### Test Case 1: New User Registration ✅

**Steps:**
1. Open https://skillbridge-tau.vercel.app
2. Click "Get Started" or "Create Free Account" button
3. Click on the "Register" tab
4. Fill in the registration form with NEW credentials:
   ```
   First Name: Test
   Last Name: User
   Email: test[TIMESTAMP]@example.com  (use unique email)
   Password: TestPass123!
   Confirm Password: TestPass123!
   ```
5. Click "Create Account"

**Expected Result:**
- ✅ Success message: "🎉 Registration successful! Welcome to SkillBridge254! Redirecting to your dashboard..."
- ✅ Modal closes after 1.5 seconds
- ✅ Automatically redirected to /dashboard
- ✅ User stays logged in (no immediate logout)
- ✅ Dashboard loads with user data

**What to Check:**
- [ ] Registration form loads correctly
- [ ] All fields accept input
- [ ] Password visibility toggle works
- [ ] Success message shows correctly
- [ ] Redirects to dashboard
- [ ] User stays logged in
- [ ] No console errors

---

### Test Case 2: Duplicate Email Registration ❌

**Steps:**
1. Try to register again with the SAME email from Test Case 1
2. Fill in the form with the same email address
3. Click "Create Account"

**Expected Result:**
- ✅ Error message: "This email is already registered. Please login instead or use a different email."
- ✅ After 2 seconds, automatically switches to Login tab
- ✅ Email field pre-filled in login form

**What to Check:**
- [ ] Error message shows correctly
- [ ] Error is user-friendly (not technical)
- [ ] Switches to login tab automatically
- [ ] Email pre-filled in login form

---

### Test Case 3: Successful Login ✅

**Steps:**
1. Logout if logged in (click profile → Logout)
2. Click "Get Started" button
3. Stay on "Login" tab
4. Enter credentials:
   ```
   Email: test1769801993674@example.com
   Password: TestPass123!
   ```
5. Click "Login"

**Expected Result:**
- ✅ Success message: "Login successful! Welcome back!"
- ✅ Modal closes
- ✅ Redirected to /dashboard
- ✅ User stays logged in (token persists)
- ✅ Dashboard loads correctly

**What to Check:**
- [ ] Login form loads correctly
- [ ] Password visibility toggle works
- [ ] Success message shows
- [ ] Redirects to dashboard
- [ ] User stays logged in
- [ ] No console errors

---

### Test Case 4: Wrong Password ❌

**Steps:**
1. Try to login with wrong password
2. Email: test1769801993674@example.com
3. Password: WrongPassword123!
4. Click "Login"

**Expected Result:**
- ✅ Error message: "Invalid credentials"
- ✅ Stays on login page
- ✅ No redirect
- ✅ Form remains filled (email persists)

**What to Check:**
- [ ] Error message shows
- [ ] Error is user-friendly
- [ ] No redirect occurs
- [ ] Can try again

---

### Test Case 5: Non-Existent Email ❌

**Steps:**
1. Try to login with non-existent email
2. Email: nonexistent@example.com
3. Password: AnyPassword123!
4. Click "Login"

**Expected Result:**
- ✅ Error message: "Invalid credentials"
- ✅ Stays on login page
- ✅ No information disclosure (doesn't say "email not found")

**What to Check:**
- [ ] Error message shows
- [ ] No information disclosure
- [ ] Security best practice followed

---

### Test Case 6: Token Persistence - Page Refresh 🔄

**Steps:**
1. Login successfully
2. Navigate to dashboard
3. Press F5 or Ctrl+R to refresh the page

**Expected Result:**
- ✅ User stays logged in
- ✅ Dashboard loads correctly
- ✅ No redirect to login page
- ✅ User data persists

**What to Check:**
- [ ] User stays logged in after refresh
- [ ] Dashboard loads correctly
- [ ] No flash of login page
- [ ] Token in localStorage

---

### Test Case 7: Token Persistence - Browser Tab Close/Reopen 🔄

**Steps:**
1. Login successfully
2. Close the browser tab
3. Open a new tab and go to https://skillbridge-tau.vercel.app

**Expected Result:**
- ✅ User stays logged in
- ✅ Token persists in localStorage
- ✅ Can access dashboard without re-login
- ✅ Token valid for 30 days

**What to Check:**
- [ ] User stays logged in after tab close
- [ ] Can access dashboard
- [ ] Token persists
- [ ] No re-authentication required

---

### Test Case 8: Slow Network (3G) 🐌

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select "Slow 3G" from throttling dropdown
4. Try to login

**Expected Result:**
- ✅ Loading spinner shows
- ✅ Request completes within 60 seconds
- ✅ Login succeeds (retry logic works)
- ✅ No timeout errors

**What to Check:**
- [ ] Loading indicator shows
- [ ] Request completes successfully
- [ ] Retry logic works (check Network tab)
- [ ] User experience is acceptable

---

### Test Case 9: Network Failure & Retry 🔄

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select "Offline" mode
4. Try to login
5. After error, go back online
6. Try again

**Expected Result:**
- ✅ Error message: "Unable to connect to server. Please check your internet connection..."
- ✅ After going online, login succeeds
- ✅ Retry logic works automatically

**What to Check:**
- [ ] Offline error message shows
- [ ] Error is user-friendly
- [ ] Can retry after going online
- [ ] Automatic retry works

---

### Test Case 10: Mobile Device Testing 📱

**Steps:**
1. Open on mobile device (iOS or Android)
2. Test registration flow
3. Test login flow
4. Test token persistence

**Alternative: Use Chrome DevTools**
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or "Pixel 5"
4. Test all flows

**Expected Result:**
- ✅ Registration works on mobile
- ✅ Login works on mobile
- ✅ UI is responsive
- ✅ Token persists on mobile
- ✅ Forms are usable on small screens

**What to Check:**
- [ ] Registration works on mobile
- [ ] Login works on mobile
- [ ] UI is responsive
- [ ] Token persists on mobile
- [ ] No layout issues
- [ ] Buttons are tappable

---

### Test Case 11: Browser Console Check 🔍

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Perform login/registration
4. Check for errors

**Expected Result:**
- ✅ No red errors in console
- ✅ API calls show correct URL (not localhost)
- ✅ Token stored in localStorage
- ✅ No CORS errors

**What to Check:**
- [ ] No console errors
- [ ] API URL is correct (https://skillbridge-backend-t35r.onrender.com/api/v1)
- [ ] Token stored correctly
- [ ] No CORS errors
- [ ] No 404 errors

**How to Check localStorage:**
```javascript
// In browser console
localStorage.getItem('authToken')
localStorage.getItem('token')
```

---

### Test Case 12: Logout Functionality 🚪

**Steps:**
1. Login successfully
2. Navigate to dashboard
3. Click profile menu
4. Click "Logout"

**Expected Result:**
- ✅ User logged out
- ✅ Redirected to home page
- ✅ Token removed from localStorage
- ✅ Cannot access dashboard without re-login

**What to Check:**
- [ ] Logout button works
- [ ] Redirects to home
- [ ] Token removed
- [ ] Cannot access protected routes

---

## 🔍 Additional Checks

### LocalStorage Inspection
Open browser console and run:
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('authToken') || localStorage.getItem('token'));

// Check token expiration
const token = localStorage.getItem('authToken') || localStorage.getItem('token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Issued at:', new Date(payload.iat * 1000));
    console.log('Expires at:', new Date(payload.exp * 1000));
    console.log('Valid for (days):', (payload.exp - payload.iat) / (60 * 60 * 24));
}
```

### Network Tab Inspection
1. Open DevTools → Network tab
2. Perform login/registration
3. Check:
   - [ ] Request URL is correct (not localhost)
   - [ ] Status code is 200/201
   - [ ] Response contains token
   - [ ] No CORS errors
   - [ ] Request completes in reasonable time

### Application Tab Inspection
1. Open DevTools → Application tab
2. Go to Local Storage
3. Check:
   - [ ] authToken or token exists
   - [ ] Token is a valid JWT (3 parts separated by dots)
   - [ ] Other user data stored correctly

---

## 📊 Test Summary Template

After completing all tests, fill out this summary:

```
# Frontend Testing Results

**Date:** [DATE]
**Tester:** [YOUR NAME]
**Environment:** Production (https://skillbridge-tau.vercel.app)

## Test Results

### Registration
- [ ] New user registration: PASS / FAIL
- [ ] Duplicate email handling: PASS / FAIL
- [ ] Form validation: PASS / FAIL
- [ ] Success message: PASS / FAIL
- [ ] Auto-redirect: PASS / FAIL

### Login
- [ ] Successful login: PASS / FAIL
- [ ] Wrong password: PASS / FAIL
- [ ] Non-existent email: PASS / FAIL
- [ ] Success message: PASS / FAIL
- [ ] Auto-redirect: PASS / FAIL

### Token Persistence
- [ ] Page refresh: PASS / FAIL
- [ ] Tab close/reopen: PASS / FAIL
- [ ] Token expiration (30 days): PASS / FAIL

### Network & Error Handling
- [ ] Slow network (3G): PASS / FAIL
- [ ] Network failure & retry: PASS / FAIL
- [ ] Error messages: PASS / FAIL

### Mobile
- [ ] Mobile registration: PASS / FAIL
- [ ] Mobile login: PASS / FAIL
- [ ] Mobile UI: PASS / FAIL

### Technical
- [ ] No console errors: PASS / FAIL
- [ ] Correct API URL: PASS / FAIL
- [ ] Token storage: PASS / FAIL
- [ ] Logout functionality: PASS / FAIL

## Issues Found
[List any issues discovered]

## Overall Status
[ ] ALL TESTS PASSED ✅
[ ] SOME TESTS FAILED ❌

## Notes
[Any additional observations]
```

---

## 🚀 Quick Test Checklist

For a quick verification, test these critical paths:

1. **Registration Flow (2 minutes)**
   - [ ] Register new user
   - [ ] See success message
   - [ ] Redirect to dashboard
   - [ ] Stay logged in

2. **Login Flow (1 minute)**
   - [ ] Login with existing user
   - [ ] See success message
   - [ ] Redirect to dashboard
   - [ ] Stay logged in

3. **Token Persistence (1 minute)**
   - [ ] Refresh page
   - [ ] Still logged in
   - [ ] Dashboard loads

4. **Error Handling (1 minute)**
   - [ ] Try wrong password
   - [ ] See error message
   - [ ] Try duplicate email
   - [ ] See helpful error

**Total Time: 5 minutes for critical path testing**

---

## 📞 Support

If you encounter any issues:

1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify environment variables on Vercel
4. Check backend health endpoint
5. Review documentation in repository

---

## ✅ Success Criteria

The frontend is working correctly if:

1. ✅ Users can register new accounts
2. ✅ Users can login with correct credentials
3. ✅ Users stay logged in after page refresh
4. ✅ Tokens persist for 30 days
5. ✅ Error messages are clear and helpful
6. ✅ No console errors
7. ✅ API calls go to production backend (not localhost)
8. ✅ Works on mobile devices
9. ✅ Handles network issues gracefully
10. ✅ Logout works correctly

---

**Last Updated:** January 30, 2026
**Version:** 1.0
