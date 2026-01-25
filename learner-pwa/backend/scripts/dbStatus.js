require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Module = require('../models/Module');
const Assessment = require('../models/Assessment');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const Payment = require('../models/Payment');

const checkDatabaseStatus = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('📍 Database:', process.env.MONGODB_URI);
        console.log('\n' + '='.repeat(60));
        console.log('DATABASE STATUS');
        console.log('='.repeat(60) + '\n');

        // Count documents in each collection
        const [
            userCount,
            moduleCount,
            assessmentCount,
            progressCount,
            certificateCount,
            paymentCount
        ] = await Promise.all([
            User.countDocuments(),
            Module.countDocuments(),
            Assessment.countDocuments(),
            Progress.countDocuments(),
            Certificate.countDocuments(),
            Payment.countDocuments()
        ]);

        console.log('📊 Collection Statistics:');
        console.log('─'.repeat(60));
        console.log(`👥 Users:         ${userCount}`);
        console.log(`📚 Modules:       ${moduleCount}`);
        console.log(`📝 Assessments:   ${assessmentCount}`);
        console.log(`📈 Progress:      ${progressCount}`);
        console.log(`🎓 Certificates:  ${certificateCount}`);
        console.log(`💳 Payments:      ${paymentCount}`);
        console.log('─'.repeat(60) + '\n');

        // Show user breakdown
        if (userCount > 0) {
            const adminCount = await User.countDocuments({ role: 'admin' });
            const instructorCount = await User.countDocuments({ role: 'instructor' });
            const regularUserCount = await User.countDocuments({ role: 'user' });

            console.log('👥 User Breakdown:');
            console.log('─'.repeat(60));
            console.log(`   Admins:       ${adminCount}`);
            console.log(`   Instructors:  ${instructorCount}`);
            console.log(`   Regular Users: ${regularUserCount}`);
            console.log('─'.repeat(60) + '\n');

            // List admin users
            if (adminCount > 0) {
                const admins = await User.find({ role: 'admin' }).select('email profile.firstName profile.lastName');
                console.log('🔑 Admin Users:');
                console.log('─'.repeat(60));
                admins.forEach(admin => {
                    console.log(`   📧 ${admin.email}`);
                    console.log(`   👤 ${admin.profile.firstName} ${admin.profile.lastName}\n`);
                });
            }
        }

        // Show module breakdown
        if (moduleCount > 0) {
            const modulesByCategory = await Module.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                }
            ]);

            console.log('📚 Modules by Category:');
            console.log('─'.repeat(60));
            modulesByCategory.forEach(cat => {
                console.log(`   ${cat._id}: ${cat.count}`);
            });
            console.log('─'.repeat(60) + '\n');
        }

        console.log('✅ Database is healthy and ready!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        process.exit(1);
    }
};

checkDatabaseStatus();
