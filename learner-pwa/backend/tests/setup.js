// Test setup file
const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/adaptive-learning-test';

// Increase timeout for database operations
jest.setTimeout(10000);

// Connect to test database before all tests
beforeAll(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    } catch (error) {
        console.error('Database connection error:', error);
    }
});

// Clear database after each test
afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    }
});

// Disconnect after all tests
afterAll(async () => {
    await mongoose.connection.close();
});
