require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createSampleUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if sample user already exists
        const existingUser = await User.findOne({ email: 'user@skillbridge.com' });

        if (existingUser) {
            console.log('⚠️  Sample user already exists!');
            console.log('Email:', existingUser.email);
            console.log('Role:', existingUser.role);
            process.exit(0);
        }

        // Create sample user
        const sampleUser = await User.create({
            email: 'user@skillbridge.com',
            password: 'user123',
            profile: {
                firstName: 'John',
                lastName: 'Doe',
                phoneNumber: '+254700000001'
            },
            role: 'user',
            isVerified: true,
            isActive: true
        });

        console.log('\n✅ Sample user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    user@skillbridge.com');
        console.log('🔑 Password: user123');
        console.log('👤 Role:     user');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Change this password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating sample user:', error.message);
        process.exit(1);
    }
};

createSampleUser();
