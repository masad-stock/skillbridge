# Mobile Login Testing - Quick Start Guide

This guide will help you quickly diagnose and fix the mobile login issues you're experiencing.

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Automated Testing (Recommended)

**Windows:**
```bash
run-mobile-tests.bat
```

**Mac/Linux:**
```bash
chmod +x run-mobile-tests.sh
./run-mobile-tests.sh
```

This will:
- ✅ Run all backend tests
- ✅ Run mobile-specific authentication tests
- ✅ Test API endpoints
- ✅ Run frontend tests
- ✅ Generate a comprehensive report

### Option 2: On-Device Testing (Most Accurate)

1. **Open the diagnostics page on your mobile device:**
   - Visit: `https://skillbridge-tau.vercel.app/mobile-diagnostics.html`
   - Or if testing locally: `http://localhost:3000/mobile-diagnostics.html`

2. **The page will automatically run tests and show:**
   - ✅ LocalStorage availability
   - ✅ Backend connectivity
   - ✅ CORS configuration
   - ✅ Network speed
   - ✅ Service Worker status
   - ✅ Token validation

3. **Try logging in:**
   - Click "Test Login" button
   - Enter your credentials
   - Check the results

4. **Export results:**
   - Click "Export Results" to download a JSON report
   - Share this with your development team

---

## 🔍 Common Issues & Quick Fixes

### Issue 1: "Network Error" or "Connection Timeout"

**Symptoms:**
- Login button shows loading spinner indefinitely
- Error message: "Unable to connect to server"
- Console shows: "Network request failed"

**Quick Fix:**
```javascript
// In learner-pwa/src/services/api.js
// Increase timeout for mobile devices
const REQUEST_TIMEOUT = 60000; // Change from 30000 to 60000
```

**Why it works:** Mobile networks (especially 3G) are slower than WiFi. Increasing timeout gives more time for requests to complete.

---

### Issue 2: "Token Expired" or "Not Authorized"

**Symptoms:**
- Login succeeds but immediately logs out
- Error: "Token expired"
- Redirected back to login page

**Quick Fix:**
```javascript
// Check token expiration in browser console
const token = localStorage.getItem('authToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
}
```

**Solution:** If token is expired, clear storage and login again:
```javascript
localStorage.clear();
sessionStorage.clear();
// Then try logging in again
```

---

### Issue 3: "LocalStorage Not Available"

**Symptoms:**
- Login fails silently
- Console error: "QuotaExceededError"
- Happens in private/incognito mode

**Quick Fix:**
The app should already have fallback storage. If not, add this to `learner-pwa/src/utils/storage.js`:

```javascript
export const storage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Fallback to sessionStorage
      sessionStorage.setItem(key, value);
    }
  },
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return sessionStorage.getItem(key);
    }
  }
};
```

---

### Issue 4: "CORS Error"

**Symptoms:**
- Console error: "Access to fetch blocked by CORS policy"
- Network tab shows failed OPTIONS request
- Login request never reaches server

**Quick Fix:**
Check backend CORS configuration in `learner-pwa/backend/server.js`:

```javascript
const corsOrigins = [
    'http://localhost:3000',
    'https://skillbridge-tau.vercel.app',
    'https://skillbridge.vercel.app',
    // Add your mobile testing URL if different
];
```

**Verify CORS is working:**
```bash
curl -X OPTIONS https://skillbridge-backend-t35r.onrender.com/api/v1/auth/login \
  -H "Origin: https://skillbridge-tau.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

---

### Issue 5: Service Worker Caching Old Responses

**Symptoms:**
- Login works on desktop but not mobile
- Mobile shows old/cached login page
- Changes to code don't appear on mobile

**Quick Fix:**

1. **Clear service worker cache:**
   - Open DevTools on mobile (remote debugging)
   - Go to Application > Service Workers
   - Click "Unregister"
   - Refresh page

2. **Or add this to service worker to skip auth caching:**
   ```javascript
   // In learner-pwa/public/sw.js
   self.addEventListener('fetch', (event) => {
     // Never cache authentication requests
     if (event.request.url.includes('/auth/')) {
       event.respondWith(fetch(event.request));
       return;
     }
     // ... rest of service worker logic
   });
   ```

---

## 📱 Testing on Actual Devices

### iOS (iPhone/iPad)

**Remote Debugging:**
1. Connect iPhone to Mac via USB
2. On iPhone: Settings > Safari > Advanced > Enable "Web Inspector"
3. On Mac: Safari > Develop > [Your iPhone] > [Your App]
4. You can now see console logs and network requests

**Common iOS Issues:**
- Private browsing blocks localStorage
- iOS Safari has stricter CORS policies
- Service workers may not work in standalone mode

### Android

**Remote Debugging:**
1. Enable Developer Options on Android
2. Enable USB Debugging
3. Connect to computer via USB
4. Open Chrome on computer
5. Go to `chrome://inspect`
6. Click "Inspect" on your device

**Common Android Issues:**
- Data Saver mode may block requests
- Some browsers (Samsung Internet) have different localStorage limits
- Chrome may cache aggressively

---

## 🧪 Manual Testing Checklist

Use this checklist to systematically test login on mobile:

### Pre-Testing
- [ ] Clear browser cache
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Clear cookies
- [ ] Disable any VPN or proxy
- [ ] Ensure good network connection

### Login Flow
- [ ] Open app in mobile browser
- [ ] Click "Login" button
- [ ] Enter valid email
- [ ] Enter valid password
- [ ] Click "Submit"
- [ ] **Check console for errors**
- [ ] **Check Network tab for failed requests**
- [ ] Verify redirect to dashboard
- [ ] Verify user data loads

### Error Scenarios
- [ ] Try with invalid email
- [ ] Try with wrong password
- [ ] Try with empty fields
- [ ] Try with very slow network (throttle to 3G)
- [ ] Try in private/incognito mode
- [ ] Try after clearing localStorage

### Network Conditions
- [ ] Test on WiFi
- [ ] Test on 4G/LTE
- [ ] Test on 3G (if available)
- [ ] Test switching from WiFi to cellular during login
- [ ] Test with airplane mode (should show error)

---

## 🔧 Advanced Debugging

### Enable Verbose Logging

Add this to `learner-pwa/src/context/UserContext.js`:

```javascript
const login = async (email, password) => {
  console.log('[LOGIN] Starting login process');
  console.log('[LOGIN] Email:', email);
  console.log('[LOGIN] API URL:', process.env.REACT_APP_API_URL);
  console.log('[LOGIN] Timestamp:', new Date().toISOString());

  try {
    console.log('[LOGIN] Sending request...');
    const startTime = Date.now();
    
    const response = await authAPI.login({ email, password });
    
    const responseTime = Date.now() - startTime;
    console.log('[LOGIN] Response received in', responseTime, 'ms');
    console.log('[LOGIN] Response status:', response.status);
    console.log('[LOGIN] Response data:', response.data);

    const { token, user } = response.data;
    
    console.log('[LOGIN] Storing token...');
    localStorage.setItem('authToken', token);
    localStorage.setItem('cachedUser', JSON.stringify(user));
    console.log('[LOGIN] Token stored successfully');

    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    console.log('[LOGIN] Login successful!');

    return { success: true, user };
  } catch (error) {
    console.error('[LOGIN] Error occurred');
    console.error('[LOGIN] Error type:', error.name);
    console.error('[LOGIN] Error message:', error.message);
    console.error('[LOGIN] Error response:', error.response?.data);
    console.error('[LOGIN] Error status:', error.response?.status);
    console.error('[LOGIN] Is network error:', error.isNetworkError);
    console.error('[LOGIN] Full error:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
};
```

### Monitor Network Requests

Add this to your app to log all fetch requests:

```javascript
// Add to learner-pwa/src/index.js
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('[FETCH] Request:', args[0], args[1]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('[FETCH] Response:', response.status, response.statusText);
      return response;
    })
    .catch(error => {
      console.error('[FETCH] Error:', error);
      throw error;
    });
};
```

---

## 📊 Interpreting Test Results

### Backend Tests

**All tests passing ✅**
- Backend authentication is working correctly
- Database connection is stable
- JWT token generation is working

**Some tests failing ❌**
- Check MongoDB connection (MONGODB_URI)
- Verify JWT_SECRET is set
- Check test logs for specific errors

### Frontend Tests

**All tests passing ✅**
- Frontend components are working
- Form validation is correct
- State management is functioning

**Some tests failing ❌**
- Check if API_URL is configured correctly
- Verify mock data in tests
- Check test logs for specific errors

### API Endpoint Tests

**Health check passing ✅**
- Backend is accessible
- Server is running

**CORS check passing ✅**
- CORS is configured correctly
- Mobile browsers can make requests

**Login endpoint responding ✅**
- Authentication endpoint is accessible
- Server is processing requests

---

## 🆘 Still Having Issues?

### Collect Diagnostic Information

1. **Run the automated tests:**
   ```bash
   ./run-mobile-tests.sh  # or run-mobile-tests.bat on Windows
   ```

2. **Open mobile diagnostics page on your phone:**
   - Visit: https://skillbridge-tau.vercel.app/mobile-diagnostics.html
   - Click "Export Results"
   - Save the JSON file

3. **Collect browser console logs:**
   - Enable remote debugging
   - Copy all console errors
   - Take screenshots of Network tab

4. **Check backend logs:**
   - Go to Render dashboard
   - View logs for any errors during login attempts
   - Look for 401, 500, or timeout errors

### Share This Information

When reporting the issue, include:
- [ ] Test report from automated tests
- [ ] Diagnostic results from mobile-diagnostics.html
- [ ] Browser console logs
- [ ] Backend logs from Render
- [ ] Device information (model, OS version, browser)
- [ ] Network type (WiFi, 4G, 3G)
- [ ] Screenshots of error messages

---

## 📚 Additional Resources

- **Comprehensive Testing Plan**: See `COMPREHENSIVE_LOGIN_TESTING_PLAN.md`
- **Previous Fixes**: See `LOGIN_ERROR_FIX.md`
- **Production Issues**: See `PRODUCTION_ISSUES_DIAGNOSIS.md`
- **Setup Guide**: See `SETUP_GUIDE.md`

---

## ✅ Success Criteria

Your login is working correctly when:

1. ✅ Automated tests pass (backend + frontend)
2. ✅ Mobile diagnostics page shows all tests passing
3. ✅ You can login on your phone successfully
4. ✅ Token is stored in localStorage
5. ✅ Dashboard loads after login
6. ✅ User data is displayed correctly
7. ✅ Token persists after page refresh
8. ✅ Logout works correctly

---

## 🎯 Next Steps After Testing

Once you've identified the issue:

1. **Apply the appropriate fix** from the "Common Issues" section
2. **Test the fix** on your mobile device
3. **Run automated tests** to ensure nothing broke
4. **Deploy to production** if tests pass
5. **Monitor** for any new issues

---

**Need Help?** Check the comprehensive testing plan or review the backend/frontend logs for more details.
