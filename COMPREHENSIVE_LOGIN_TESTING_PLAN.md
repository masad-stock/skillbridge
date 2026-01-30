# Comprehensive Login Testing Plan for Mobile Issues

**Date**: January 2026  
**Issue**: Login errors occurring on mobile devices  
**Priority**: HIGH

---

## Executive Summary

This document outlines a comprehensive testing strategy to diagnose and resolve login issues reported on mobile devices. The testing plan covers backend authentication, frontend validation, network connectivity, mobile-specific issues, and cross-browser compatibility.

---

## Table of Contents

1. [Known Issues & Previous Fixes](#known-issues--previous-fixes)
2. [Potential Root Causes](#potential-root-causes)
3. [Testing Strategy](#testing-strategy)
4. [Test Execution Plan](#test-execution-plan)
5. [Mobile-Specific Tests](#mobile-specific-tests)
6. [Automated Test Suite](#automated-test-suite)
7. [Manual Testing Checklist](#manual-testing-checklist)
8. [Debugging Tools & Techniques](#debugging-tools--techniques)
9. [Resolution Steps](#resolution-steps)

---

## Known Issues & Previous Fixes

### Previously Resolved Issues

1. **Redis Connection Failure** (Fixed)
   - Email queue service was blocking login due to Redis unavailability
   - **Solution**: Made email queue non-blocking, added fallback mechanisms
   - **File**: `learner-pwa/backend/services/emailQueueService.js`

2. **Bull Queue Configuration** (Fixed)
   - Incompatible Redis options causing unhandled rejections
   - **Solution**: Removed `maxRetriesPerRequest` and `enableReadyCheck`
   - **File**: `learner-pwa/backend/services/emailQueueService.js`

3. **Mongoose Duplicate Indexes** (Fixed)
   - Non-critical warnings in production logs
   - **Solution**: Removed duplicate index definitions
   - **Files**: Payment.js, ImageMetadata.js, ResearchEvent.js

### Current Status
- Backend: ✅ Running on Render (https://skillbridge-backend-t35r.onrender.com)
- Frontend: ✅ Deployed on Vercel
- Desktop Login: ✅ Working (assumed)
- Mobile Login: ❌ **FAILING** (reported issue)

---

## Potential Root Causes

### 1. Mobile Network Issues
- **Timeout on slow connections**: 30-second timeout may be too short for 2G/3G
- **Request interruption**: Mobile network switching (WiFi ↔ Cellular)
- **CORS issues**: Mobile browsers may handle CORS differently
- **SSL/TLS issues**: Certificate validation on mobile devices

### 2. Mobile Browser Compatibility
- **LocalStorage limitations**: Some mobile browsers restrict localStorage
- **Cookie handling**: Different cookie policies on mobile
- **Service Worker conflicts**: PWA service worker may interfere
- **Token storage**: Mobile Safari private mode blocks localStorage

### 3. Frontend Issues
- **Token expiration**: Tokens expiring before validation
- **Rate limiting**: Too aggressive rate limiting on mobile IPs
- **Input validation**: Mobile keyboards causing validation failures
- **CSRF token issues**: Token generation/validation failing

### 4. Backend Issues
- **JWT verification**: Token validation failing on mobile requests
- **CORS configuration**: Mobile user agents not whitelisted
- **Rate limiting**: IP-based limiting affecting mobile networks
- **Request size limits**: Mobile requests being rejected

### 5. PWA-Specific Issues
- **Service Worker caching**: Stale authentication responses
- **Offline mode**: App attempting offline login
- **Cache conflicts**: Cached login responses causing issues
- **Manifest configuration**: PWA settings affecting authentication

---

## Testing Strategy

### Phase 1: Backend Authentication Testing
**Objective**: Verify backend authentication logic is working correctly

### Phase 2: Frontend Validation Testing
**Objective**: Ensure frontend properly handles authentication flow

### Phase 3: Network & API Testing
**Objective**: Test API communication under various network conditions

### Phase 4: Mobile Device Testing
**Objective**: Test on actual mobile devices and browsers

### Phase 5: Integration Testing
**Objective**: End-to-end testing of complete login flow

---

## Test Execution Plan

### Phase 1: Backend Authentication Testing

#### Test 1.1: API Endpoint Verification
```bash
# Test login endpoint directly
curl -X POST https://skillbridge-backend-t35r.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected: 200 OK with token
# Failure: 401 Unauthorized or 500 Server Error
```

#### Test 1.2: Token Generation & Validation
```bash
# Test token validation
curl -X GET https://skillbridge-backend-t35r.onrender.com/api/v1/auth/me \
  -H "Authorization: Bearer <token-from-login>"

# Expected: 200 OK with user data
# Failure: 401 Unauthorized
```

#### Test 1.3: Rate Limiting
```bash
# Test rate limiting (15 requests in 15 minutes)
for i in {1..20}; do
  curl -X POST https://skillbridge-backend-t35r.onrender.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' &
done

# Expected: First 15 succeed, rest return 429 Too Many Requests
```

#### Test 1.4: CORS Configuration
```bash
# Test CORS headers
curl -X OPTIONS https://skillbridge-backend-t35r.onrender.com/api/v1/auth/login \
  -H "Origin: https://skillbridge-tau.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Expected: Access-Control-Allow-Origin header present
```

### Phase 2: Frontend Validation Testing

#### Test 2.1: Input Validation
- Test email validation with various formats
- Test password validation (minimum 6 characters)
- Test with special characters in password
- Test with whitespace in inputs

#### Test 2.2: Rate Limiting (Frontend)
- Attempt multiple failed logins
- Verify rate limiter shows correct remaining attempts
- Verify lockout message appears

#### Test 2.3: Token Storage
- Verify token is stored in localStorage
- Verify token is retrieved correctly
- Verify token expiration check works
- Test with localStorage disabled (private mode)

### Phase 3: Network & API Testing

#### Test 3.1: Network Conditions
- Test on fast WiFi (>10 Mbps)
- Test on slow WiFi (1-2 Mbps)
- Test on 4G/LTE
- Test on 3G
- Test on 2G (if available)
- Test with network interruption during login

#### Test 3.2: Timeout Testing
```javascript
// Simulate slow network
// In browser DevTools: Network > Throttling > Slow 3G
// Attempt login and monitor timeout behavior
```

#### Test 3.3: Request/Response Inspection
- Monitor request headers (Authorization, Content-Type, CSRF)
- Monitor response status codes
- Check for CORS errors in console
- Verify request payload format

### Phase 4: Mobile Device Testing

#### Test 4.1: Device Matrix
Test on the following devices/browsers:

**iOS Devices**:
- iPhone (Safari) - Latest iOS
- iPhone (Safari) - iOS 15
- iPhone (Chrome)
- iPhone (Firefox)
- iPad (Safari)

**Android Devices**:
- Android Phone (Chrome) - Latest Android
- Android Phone (Chrome) - Android 11
- Android Phone (Firefox)
- Android Phone (Samsung Internet)
- Android Tablet (Chrome)

#### Test 4.2: Mobile Browser Features
- Test with cookies enabled/disabled
- Test with JavaScript enabled/disabled
- Test in private/incognito mode
- Test with ad blockers enabled
- Test with data saver mode enabled

#### Test 4.3: Mobile Network Scenarios
- Test on WiFi only
- Test on cellular only
- Test switching from WiFi to cellular during login
- Test in airplane mode (should show error)
- Test with VPN enabled

### Phase 5: Integration Testing

#### Test 5.1: Complete Login Flow
1. Open app on mobile device
2. Click "Login" button
3. Enter valid credentials
4. Submit form
5. Verify redirect to dashboard
6. Verify user data loads correctly
7. Verify token persists on page refresh

#### Test 5.2: Error Scenarios
1. Invalid email format
2. Wrong password
3. Non-existent user
4. Network timeout
5. Server error (500)
6. Rate limit exceeded

---

## Mobile-Specific Tests

### Test Suite: Mobile Login Issues

#### Test M1: LocalStorage Availability
```javascript
// Test if localStorage is available
function testLocalStorage() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.error('localStorage not available:', e);
    return false;
  }
}
```

#### Test M2: Service Worker Interference
```javascript
// Check if service worker is interfering
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Active service workers:', registrations.length);
  registrations.forEach(reg => {
    console.log('SW scope:', reg.scope);
    console.log('SW state:', reg.active?.state);
  });
});
```

#### Test M3: Token Expiration on Mobile
```javascript
// Check token expiration
const token = localStorage.getItem('authToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiresAt = new Date(payload.exp * 1000);
  const now = new Date();
  console.log('Token expires at:', expiresAt);
  console.log('Current time:', now);
  console.log('Token expired:', now > expiresAt);
}
```

#### Test M4: Network Request Logging
```javascript
// Log all network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch request:', args[0], args[1]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Fetch response:', response.status, response.statusText);
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
};
```

#### Test M5: CORS Error Detection
```javascript
// Detect CORS errors
window.addEventListener('error', (e) => {
  if (e.message.includes('CORS') || e.message.includes('cross-origin')) {
    console.error('CORS ERROR DETECTED:', e.message);
    alert('CORS Error: ' + e.message);
  }
});
```

---

## Automated Test Suite

### Backend Tests

#### Run Existing Tests
```bash
cd learner-pwa/backend
npm test

# Run specific test suite
npm test -- tests/api/auth.test.js

# Run with coverage
npm test -- --coverage
```

#### Add New Mobile-Specific Tests
Create `learner-pwa/backend/tests/api/auth.mobile.test.js`:

```javascript
const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');

describe('Mobile Login Tests', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'mobile@test.com',
      password: 'password123',
      profile: { firstName: 'Mobile', lastName: 'User' }
    });
  });

  describe('Mobile User-Agent Headers', () => {
    it('should accept login from iOS Safari', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15')
        .send({
          email: 'mobile@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should accept login from Android Chrome', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('User-Agent', 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/91.0.4472.120')
        .send({
          email: 'mobile@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Network Timeout Scenarios', () => {
    it('should handle slow requests gracefully', async () => {
      // Simulate slow network by adding delay
      jest.setTimeout(35000);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .timeout(35000)
        .send({
          email: 'mobile@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Token Validation on Mobile', () => {
    it('should validate token correctly', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'mobile@test.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      // Verify token works
      const meResponse = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.success).toBe(true);
    });

    it('should reject expired tokens', async () => {
      // Create expired token
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting on Mobile Networks', () => {
    it('should apply rate limiting correctly', async () => {
      const requests = [];

      // Make 20 rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({
              email: 'mobile@test.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
```

### Frontend Tests

#### Run Existing Tests
```bash
cd learner-pwa
npm test

# Run specific test
npm test -- src/components/AuthModal.test.js

# Run with coverage
npm test -- --coverage
```

#### Add Mobile-Specific Frontend Tests
Create `learner-pwa/src/components/__tests__/AuthModal.mobile.test.js`:

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthModal from '../AuthModal';
import { UserProvider } from '../../context/UserContext';
import { ToastProvider } from '../../context/ToastContext';

// Mock mobile environment
const mockMobileEnvironment = () => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
};

describe('AuthModal - Mobile Tests', () => {
  beforeEach(() => {
    mockMobileEnvironment();
    localStorage.clear();
  });

  const renderAuthModal = () => {
    return render(
      <BrowserRouter>
        <ToastProvider>
          <UserProvider>
            <AuthModal show={true} onHide={() => {}} />
          </UserProvider>
        </ToastProvider>
      </BrowserRouter>
    );
  };

  test('should handle mobile keyboard input', async () => {
    renderAuthModal();

    const emailInput = screen.getByPlaceholderText(/your.email@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    // Simulate mobile keyboard input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('should handle localStorage unavailability', async () => {
    // Mock localStorage failure
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn(() => {
      throw new Error('QuotaExceededError');
    });

    renderAuthModal();

    // Attempt login
    const emailInput = screen.getByPlaceholderText(/your.email@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Should show error about storage
    await waitFor(() => {
      expect(screen.getByText(/storage/i)).toBeInTheDocument();
    });

    // Restore
    Storage.prototype.setItem = originalSetItem;
  });

  test('should handle slow network timeout', async () => {
    jest.setTimeout(35000);

    renderAuthModal();

    // Mock slow API response
    global.fetch = jest.fn(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, token: 'test-token' })
        }), 31000)
      )
    );

    const emailInput = screen.getByPlaceholderText(/your.email@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Should show timeout error
    await waitFor(() => {
      expect(screen.getByText(/timeout/i)).toBeInTheDocument();
    }, { timeout: 35000 });
  });
});
```

---

## Manual Testing Checklist

### Pre-Testing Setup
- [ ] Ensure backend is running (https://skillbridge-backend-t35r.onrender.com)
- [ ] Ensure frontend is deployed (Vercel)
- [ ] Create test user account
- [ ] Clear browser cache and localStorage
- [ ] Enable browser DevTools console

### Desktop Testing (Baseline)
- [ ] Login with valid credentials (Chrome)
- [ ] Login with valid credentials (Firefox)
- [ ] Login with valid credentials (Safari)
- [ ] Login with valid credentials (Edge)
- [ ] Verify token is stored in localStorage
- [ ] Verify redirect to dashboard works
- [ ] Verify user data loads correctly
- [ ] Logout and verify token is cleared

### Mobile Testing (Primary Focus)

#### iOS Safari
- [ ] Open app in Safari
- [ ] Attempt login with valid credentials
- [ ] Check console for errors
- [ ] Verify localStorage works
- [ ] Test in private browsing mode
- [ ] Test with low power mode enabled
- [ ] Test with WiFi
- [ ] Test with cellular data
- [ ] Test switching networks during login

#### iOS Chrome
- [ ] Open app in Chrome
- [ ] Attempt login with valid credentials
- [ ] Check console for errors
- [ ] Verify localStorage works
- [ ] Test in incognito mode

#### Android Chrome
- [ ] Open app in Chrome
- [ ] Attempt login with valid credentials
- [ ] Check console for errors
- [ ] Verify localStorage works
- [ ] Test in incognito mode
- [ ] Test with data saver enabled
- [ ] Test with WiFi
- [ ] Test with cellular data

#### Android Firefox
- [ ] Open app in Firefox
- [ ] Attempt login with valid credentials
- [ ] Check console for errors
- [ ] Test in private mode

#### Samsung Internet
- [ ] Open app in Samsung Internet
- [ ] Attempt login with valid credentials
- [ ] Check console for errors

### Error Scenario Testing
- [ ] Test with invalid email format
- [ ] Test with wrong password
- [ ] Test with non-existent user
- [ ] Test with empty fields
- [ ] Test with special characters in password
- [ ] Test rate limiting (multiple failed attempts)
- [ ] Test with network disconnected
- [ ] Test with very slow network (throttled)

### PWA-Specific Testing
- [ ] Install PWA on mobile device
- [ ] Test login in installed PWA
- [ ] Test offline behavior
- [ ] Test service worker caching
- [ ] Clear service worker cache and retry
- [ ] Uninstall and reinstall PWA

---

## Debugging Tools & Techniques

### Browser DevTools

#### Console Logging
Add comprehensive logging to track login flow:

```javascript
// In learner-pwa/src/context/UserContext.js
const login = async (email, password) => {
  console.log('[LOGIN] Starting login process');
  console.log('[LOGIN] Email:', email);
  console.log('[LOGIN] API URL:', process.env.REACT_APP_API_URL);

  try {
    console.log('[LOGIN] Sending request to backend');
    const response = await authAPI.login({ email, password });
    console.log('[LOGIN] Response received:', response.status);

    const { token, user } = response.data;
    console.log('[LOGIN] Token received:', token ? 'Yes' : 'No');
    console.log('[LOGIN] User data:', user);

    console.log('[LOGIN] Storing token in localStorage');
    localStorage.setItem('authToken', token);
    localStorage.setItem('cachedUser', JSON.stringify(user));
    console.log('[LOGIN] Token stored successfully');

    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    console.log('[LOGIN] Login successful');

    return { success: true, user };
  } catch (error) {
    console.error('[LOGIN] Error occurred:', error);
    console.error('[LOGIN] Error response:', error.response?.data);
    console.error('[LOGIN] Error status:', error.response?.status);
    console.error('[LOGIN] Network error:', error.isNetworkError);

    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
};
```

#### Network Tab
- Monitor all API requests
- Check request/response headers
- Verify status codes
- Check response times
- Look for CORS errors

#### Application Tab
- Inspect localStorage contents
- Check service worker status
- View cache storage
- Monitor IndexedDB

### Remote Debugging

#### iOS Safari
1. Enable Web Inspector on iPhone (Settings > Safari > Advanced)
2. Connect iPhone to Mac via USB
3. Open Safari on Mac > Develop > [Your iPhone] > [Your App]

#### Android Chrome
1. Enable USB debugging on Android device
2. Connect device to computer via USB
3. Open Chrome on computer
4. Navigate to `chrome://inspect`
5. Click "Inspect" on your device

### Network Monitoring Tools

#### Charles Proxy
- Intercept HTTPS traffic
- View request/response details
- Simulate slow networks
- Test with network interruptions

#### Wireshark
- Capture all network packets
- Analyze TCP/IP level issues
- Identify connection problems

### Mobile-Specific Debugging

#### iOS Console Logs
```bash
# View iOS device logs
idevicesyslog | grep -i "safari\|webkit"
```

#### Android Logcat
```bash
# View Android device logs
adb logcat | grep -i "chromium\|browser"
```

---

## Resolution Steps

### Step 1: Identify the Issue

Run the diagnostic script on mobile device:

```javascript
// Add to learner-pwa/public/mobile-diagnostics.html
<!DOCTYPE html>
<html>
<head>
  <title>Mobile Login Diagnostics</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: monospace; padding: 20px; }
    .test { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
    .pass { background: #d4edda; }
    .fail { background: #f8d7da; }
  </style>
</head>
<body>
  <h1>Mobile Login Diagnostics</h1>
  <div id="results"></div>

  <script>
    const results = document.getElementById('results');

    function addResult(name, passed, details) {
      const div = document.createElement('div');
      div.className = `test ${passed ? 'pass' : 'fail'}`;
      div.innerHTML = `
        <strong>${passed ? '✓' : '✗'} ${name}</strong><br>
        ${details}
      `;
      results.appendChild(div);
    }

    // Test 1: LocalStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      addResult('LocalStorage', true, 'Available');
    } catch (e) {
      addResult('LocalStorage', false, e.message);
    }

    // Test 2: Fetch API
    fetch('https://skillbridge-backend-t35r.onrender.com/health')
      .then(r => r.json())
      .then(data => {
        addResult('Backend Connection', true, `Status: ${data.status}`);
      })
      .catch(e => {
        addResult('Backend Connection', false, e.message);
      });

    // Test 3: CORS
    fetch('https://skillbridge-backend-t35r.onrender.com/api/v1/auth/login', {
      method: 'OPTIONS',
      headers: { 'Origin': window.location.origin }
    })
      .then(r => {
        const corsHeader = r.headers.get('Access-Control-Allow-Origin');
        addResult('CORS', !!corsHeader, `Header: ${corsHeader || 'Missing'}`);
      })
      .catch(e => {
        addResult('CORS', false, e.message);
      });

    // Test 4: User Agent
    addResult('User Agent', true, navigator.userAgent);

    // Test 5: Network Type
    if (navigator.connection) {
      addResult('Network', true, `Type: ${navigator.connection.effectiveType}, Downlink: ${navigator.connection.downlink} Mbps`);
    } else {
      addResult('Network', false, 'Network API not available');
    }

    // Test 6: Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        addResult('Service Worker', true, `${regs.length} registered`);
      });
    } else {
      addResult('Service Worker', false, 'Not supported');
    }

    // Test 7: Token Expiration Check
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expired = Date.now() >= payload.exp * 1000;
        addResult('Token', !expired, expired ? 'Expired' : 'Valid');
      } catch (e) {
        addResult('Token', false, 'Invalid format');
      }
    } else {
      addResult('Token', true, 'No token stored');
    }
  </script>
</body>
</html>
```

### Step 2: Apply Fixes Based on Findings

#### Fix 1: Increase Timeout for Mobile
```javascript
// In learner-pwa/src/services/api.js
const REQUEST_TIMEOUT = process.env.REACT_APP_MOBILE_TIMEOUT || 60000; // 60 seconds for mobile
```

#### Fix 2: Add Retry Logic
```javascript
// In learner-pwa/src/services/api.js
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !error.isNetworkError) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

export const authAPI = {
  login: (credentials) => retryRequest(() => api.post('/auth/login', credentials)),
  // ... other methods
};
```

#### Fix 3: Fallback Storage
```javascript
// In learner-pwa/src/utils/storage.js
export const storage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Fallback to sessionStorage
      try {
        sessionStorage.setItem(key, value);
      } catch (e2) {
        // Fallback to memory storage
        window.__memoryStorage = window.__memoryStorage || {};
        window.__memoryStorage[key] = value;
      }
    }
  },
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      try {
        return sessionStorage.getItem(key);
      } catch (e2) {
        return window.__memoryStorage?.[key];
      }
    }
  }
};
```

#### Fix 4: Better Error Messages
```javascript
// In learner-pwa/src/components/AuthModal.js
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const result = await login(loginData.email, loginData.password);

    if (result.success) {
      showSuccess('Login successful!');
      onHide();
      navigate('/dashboard');
    } else {
      // Provide specific error messages
      let errorMsg = result.message;

      if (result.isNetworkError) {
        errorMsg = 'Network error. Please check your internet connection and try again.';
      } else if (result.message?.includes('timeout')) {
        errorMsg = 'Request timed out. Please check your connection and try again.';
      } else if (result.message?.includes('credentials')) {
        errorMsg = 'Invalid email or password. Please try again.';
      }

      setError(errorMsg);
      showError(errorMsg);
    }
  } catch (err) {
    const errorMsg = 'An unexpected error occurred. Please try again.';
    setError(errorMsg);
    showError(errorMsg);
    console.error('Login error:', err);
  } finally {
    setLoading(false);
  }
};
```

#### Fix 5: Service Worker Cache Bypass
```javascript
// In learner-pwa/public/sw.js
// Add to fetch event handler
self.addEventListener('fetch', (event) => {
  // Never cache authentication requests
  if (event.request.url.includes('/auth/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // ... rest of service worker logic
});
```

### Step 3: Deploy and Test

```bash
# Deploy backend fixes
cd lear
