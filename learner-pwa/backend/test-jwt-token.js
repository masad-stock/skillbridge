const jwt = require('jsonwebtoken');

// Test JWT token generation
const JWT_SECRET = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';

console.log('Testing JWT Token Generation\n');
console.log('='.repeat(60));

// Test 1: With '30d' format
console.log('\n📝 Test 1: Generate token with expiresIn: "30d"');
try {
    const token1 = jwt.sign({ id: 'test123' }, JWT_SECRET, { expiresIn: '30d' });
    const decoded1 = jwt.decode(token1);
    
    console.log('✅ Token generated successfully');
    console.log('Token (first 50 chars):', token1.substring(0, 50) + '...');
    console.log('Decoded payload:', JSON.stringify(decoded1, null, 2));
    
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded1.exp - decoded1.iat;
    const daysUntilExpiry = Math.floor(expiresIn / (60 * 60 * 24));
    
    console.log(`\nToken valid for: ${daysUntilExpiry} days`);
    console.log(`Issued at: ${new Date(decoded1.iat * 1000).toISOString()}`);
    console.log(`Expires at: ${new Date(decoded1.exp * 1000).toISOString()}`);
    
    if (decoded1.iat === decoded1.exp) {
        console.log('❌ ERROR: Token expires immediately! (iat === exp)');
    } else {
        console.log('✅ Token expiration is correct');
    }
} catch (error) {
    console.log('❌ Error:', error.message);
}

// Test 2: With numeric seconds
console.log('\n📝 Test 2: Generate token with expiresIn: 2592000 (30 days in seconds)');
try {
    const token2 = jwt.sign({ id: 'test123' }, JWT_SECRET, { expiresIn: 2592000 });
    const decoded2 = jwt.decode(token2);
    
    console.log('✅ Token generated successfully');
    console.log('Decoded payload:', JSON.stringify(decoded2, null, 2));
    
    const expiresIn = decoded2.exp - decoded2.iat;
    const daysUntilExpiry = Math.floor(expiresIn / (60 * 60 * 24));
    
    console.log(`Token valid for: ${daysUntilExpiry} days`);
    
    if (decoded2.iat === decoded2.exp) {
        console.log('❌ ERROR: Token expires immediately!');
    } else {
        console.log('✅ Token expiration is correct');
    }
} catch (error) {
    console.log('❌ Error:', error.message);
}

// Test 3: Verify token
console.log('\n📝 Test 3: Verify token');
try {
    const token3 = jwt.sign({ id: 'test123' }, JWT_SECRET, { expiresIn: '30d' });
    const verified = jwt.verify(token3, JWT_SECRET);
    
    console.log('✅ Token verified successfully');
    console.log('Verified payload:', JSON.stringify(verified, null, 2));
} catch (error) {
    console.log('❌ Verification error:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ JWT token tests completed!\n');
