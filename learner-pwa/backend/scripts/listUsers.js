require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const users = await User.find()
            .select('email role profile.firstName profile.lastName createdAt isVerified')
            .sort({ createdAt: -1 });

        console.log('👥 ALL USERS IN SYSTEM');
        console.log('='.repeat(80));
        console.log(`Total Users: ${users.length}\n`);

        users.forEach((user, index) => {
            const name = user.profile?.firstName && user.profile?.lastName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : 'No name set';

            const verified = user.isVerified ? '✅' : '❌';
            const roleIcon = user.role === 'admin' ? '👑' :
                user.role === 'instructor' ? '👨‍🏫' : '👤';

            console.log(`${index + 1}. ${roleIcon} ${user.role.toUpperCase()}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Name: ${name}`);
            console.log(`   Verified: ${verified}`);
            console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
            console.log('');
        });

        console.log('='.repeat(80));
        console.log('\n📊 SUMMARY BY ROLE:');
        const roleCount = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});

        Object.entries(roleCount).forEach(([role, count]) => {
            const icon = role === 'admin' ? '👑' :
                role === 'instructor' ? '👨‍🏫' : '👤';
            console.log(`   ${icon} ${role}: ${count}`);
        });

        console.log('\n💡 LOGIN CREDENTIALS:');
        console.log('   Admin: admin@skillbridge.com');
        console.log('   (Check DATABASE_SETUP.md for password)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listUsers();
