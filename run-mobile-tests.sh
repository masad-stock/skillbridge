#!/bin/bash

# Mobile Login Testing Script
# This script runs comprehensive tests for mobile login issues

set -e

echo "================================================"
echo "🔍 Mobile Login Testing Suite"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if backend directory exists
if [ ! -d "learner-pwa/backend" ]; then
    print_error "Backend directory not found!"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "learner-pwa" ]; then
    print_error "Frontend directory not found!"
    exit 1
fi

echo ""
print_status "Step 1: Checking environment setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    exit 1
fi
print_success "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi
print_success "npm version: $(npm --version)"

echo ""
print_status "Step 2: Installing backend dependencies..."
echo ""

cd learner-pwa/backend
if [ ! -d "node_modules" ]; then
    npm install
else
    print_success "Dependencies already installed"
fi

echo ""
print_status "Step 3: Running backend tests..."
echo ""

# Run all backend tests
print_status "Running all backend tests..."
npm test 2>&1 | tee ../../backend-test-results.log

# Run mobile-specific tests
print_status "Running mobile-specific authentication tests..."
npm test -- tests/api/auth.mobile.test.js 2>&1 | tee ../../mobile-auth-test-results.log

echo ""
print_status "Step 4: Running backend authentication tests..."
echo ""

npm test -- tests/api/auth.test.js 2>&1 | tee ../../auth-test-results.log

echo ""
print_status "Step 5: Testing backend API endpoints..."
echo ""

# Check if backend is running
BACKEND_URL="${BACKEND_URL:-https://skillbridge-backend-t35r.onrender.com}"
print_status "Testing backend at: $BACKEND_URL"

# Test health endpoint
print_status "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" || echo "000")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HEALTH_CODE" = "200" ]; then
    print_success "Health check passed"
else
    print_error "Health check failed (HTTP $HEALTH_CODE)"
fi

# Test CORS
print_status "Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -w "\n%{http_code}" -X OPTIONS \
    -H "Origin: https://skillbridge-tau.vercel.app" \
    -H "Access-Control-Request-Method: POST" \
    "$BACKEND_URL/api/v1/auth/login" || echo "000")
CORS_CODE=$(echo "$CORS_RESPONSE" | tail -n1)

if [ "$CORS_CODE" = "204" ] || [ "$CORS_CODE" = "200" ]; then
    print_success "CORS check passed"
else
    print_warning "CORS check returned HTTP $CORS_CODE"
fi

# Test login endpoint (should fail with 400 for missing credentials)
print_status "Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    "$BACKEND_URL/api/v1/auth/login" || echo "000")
LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)

if [ "$LOGIN_CODE" = "400" ]; then
    print_success "Login endpoint responding correctly"
else
    print_warning "Login endpoint returned HTTP $LOGIN_CODE"
fi

cd ../..

echo ""
print_status "Step 6: Installing frontend dependencies..."
echo ""

cd learner-pwa
if [ ! -d "node_modules" ]; then
    npm install
else
    print_success "Dependencies already installed"
fi

echo ""
print_status "Step 7: Running frontend tests..."
echo ""

# Run frontend tests
print_status "Running all frontend tests..."
npm test -- --watchAll=false 2>&1 | tee ../frontend-test-results.log || true

cd ..

echo ""
print_status "Step 8: Generating test report..."
echo ""

# Create test report
REPORT_FILE="mobile-test-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# Mobile Login Testing Report

**Date**: $(date)
**Backend URL**: $BACKEND_URL

## Test Results Summary

### Backend Tests
- All backend tests: See \`backend-test-results.log\`
- Mobile auth tests: See \`mobile-auth-test-results.log\`
- Auth tests: See \`auth-test-results.log\`

### Frontend Tests
- All frontend tests: See \`frontend-test-results.log\`

### API Endpoint Tests

#### Health Check
- Status: $([ "$HEALTH_CODE" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")
- HTTP Code: $HEALTH_CODE

#### CORS Configuration
- Status: $([ "$CORS_CODE" = "204" ] || [ "$CORS_CODE" = "200" ] && echo "✅ PASS" || echo "⚠️ WARNING")
- HTTP Code: $CORS_CODE

#### Login Endpoint
- Status: $([ "$LOGIN_CODE" = "400" ] && echo "✅ PASS" || echo "⚠️ WARNING")
- HTTP Code: $LOGIN_CODE

## Next Steps

1. Review test logs for any failures
2. Test on actual mobile devices using the diagnostics page:
   - Open: $BACKEND_URL/../mobile-diagnostics.html (if deployed)
   - Or use: https://skillbridge-tau.vercel.app/mobile-diagnostics.html
3. Check browser console for errors during mobile testing
4. Monitor network requests in browser DevTools

## Mobile Testing Checklist

- [ ] Test on iOS Safari
- [ ] Test on iOS Chrome
- [ ] Test on Android Chrome
- [ ] Test on Android Firefox
- [ ] Test on Samsung Internet
- [ ] Test with WiFi connection
- [ ] Test with cellular connection
- [ ] Test with slow network (throttled)
- [ ] Test in private/incognito mode
- [ ] Test with localStorage disabled

## Common Issues to Check

1. **Token Storage**: Verify localStorage is available on mobile
2. **Network Timeout**: Check if requests timeout on slow connections
3. **CORS Errors**: Verify CORS headers are present
4. **Service Worker**: Check if service worker is interfering
5. **Rate Limiting**: Verify rate limiting isn't too aggressive

## Debugging Resources

- Backend logs: Check Render dashboard
- Frontend logs: Use remote debugging (Safari/Chrome DevTools)
- Network logs: Use Charles Proxy or browser DevTools
- Mobile diagnostics: Use the mobile-diagnostics.html page

EOF

print_success "Test report generated: $REPORT_FILE"

echo ""
echo "================================================"
print_success "Testing Complete!"
echo "================================================"
echo ""
print_status "Test logs saved:"
echo "  - backend-test-results.log"
echo "  - mobile-auth-test-results.log"
echo "  - auth-test-results.log"
echo "  - frontend-test-results.log"
echo "  - $REPORT_FILE"
echo ""
print_status "Next steps:"
echo "  1. Review test logs for failures"
echo "  2. Test on actual mobile devices"
echo "  3. Use mobile-diagnostics.html for on-device testing"
echo "  4. Check COMPREHENSIVE_LOGIN_TESTING_PLAN.md for detailed testing procedures"
echo ""
print_warning "If tests are failing, check:"
echo "  - MongoDB connection (MONGODB_URI environment variable)"
echo "  - JWT_SECRET is set"
echo "  - Backend is accessible at $BACKEND_URL"
echo ""
