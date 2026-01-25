require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function resetUserPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Reset admin password (in case you forgot)
        await User.updateOne(
            { email: 'admin@skillbridge.com' },
            { password: 'admin123' }
        );

        // Reset test user passwords to 'password123'
        await User.updateMany(
            { email: { $in: ['tutorleonemmanuel@gmail.com', 'obikewriting@gmail.com', 'test@example.com'] } },
            { password: 'password123' }
        );

        console.log('\n🔑 UPDATED LOGIN CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👑 ADMIN ACCESS:');
        console.log('   Email:    admin@skillbridge.com');
        console.log('   Password: admin123');
        console.log('');
        console.log('👤 STUDENT ACCOUNTS:');
        console.log('   Email:    tutorleonemmanuel@gmail.com');
        console.log('   Password: password123');
        console.log('');
        console.log('   Email:    obikewriting@gmail.com');
        console.log('   Password: password123');
        console.log('');
        console.log('   Email:    test@example.com');
        console.log('   Password: password123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🌐 LOGIN AT: http://localhost:3000');
        console.log('🎯 ADMIN PANEL: http://localhost:3000/admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting passwords:', error);
        process.exit(1);
    }
}

resetUserPassword();