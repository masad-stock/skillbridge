require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Module = require('../models/Module');
const seedInstructors = require('./seedInstructors');
const seedBlog = require('./seedBlog');
const seedEvents = require('./seedEvents');

const setupDatabase = async () => {
    try {
        console.log('🚀 Starting Database Setup...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('📍 Database:', process.env.MONGODB_URI, '\n');

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'admin@skillbridge.com' });

        if (!existingAdmin) {
            console.log('👤 Creating admin user...');
            await User.create({
                email: 'admin@skillbridge.com',
                password: 'admin123',
                profile: {
                    firstName: 'Admin',
                    lastName: 'User',
                    phoneNumber: '+254700000000'
                },
                role: 'admin',
                isVerified: true,
                isActive: true
            });
            console.log('✅ Admin user created\n');
        } else {
            console.log('ℹ️  Admin user already exists\n');
        }

        // Check if modules exist
        const moduleCount = await Module.countDocuments();

        if (moduleCount === 0) {
            console.log('📚 Seeding learning modules...');

            const modules = [
                {
                    moduleId: 'bd_001',
                    title: 'Mobile Phone Basics',
                    description: 'Learn essential mobile phone operations and navigation',
                    category: 'basic_digital',
                    difficulty: 1,
                    priority: 10,
                    estimatedTime: 30,
                    content: {
                        youtubeId: '8wHJuLNvNRE',
                        videoUrl: 'https://www.youtube.com/watch?v=8wHJuLNvNRE',
                        instructor: 'TechGumbo'
                    },
                    learningObjectives: [
                        'Navigate mobile phone interface',
                        'Make calls and send messages',
                        'Use basic phone settings',
                        'Manage contacts and apps'
                    ],
                    skills: ['mobile_navigation', 'basic_communication'],
                    offlineAvailable: true
                },
                {
                    moduleId: 'bd_002',
                    title: 'Internet Basics & Safety',
                    description: 'Understanding internet usage and online safety',
                    category: 'basic_digital',
                    difficulty: 1,
                    priority: 9,
                    estimatedTime: 45,
                    content: {
                        youtubeId: 'Dxcc6ycZ73M',
                        videoUrl: 'https://www.youtube.com/watch?v=Dxcc6ycZ73M',
                        instructor: 'GCFGlobal'
                    },
                    learningObjectives: [
                        'Understand how the internet works',
                        'Browse websites safely',
                        'Recognize online threats',
                        'Protect personal information'
                    ],
                    skills: ['internet_browsing', 'online_safety'],
                    offlineAvailable: true
                },
                {
                    moduleId: 'bd_003',
                    title: 'Digital Communication',
                    description: 'Email, messaging, and professional communication',
                    category: 'basic_digital',
                    difficulty: 2,
                    priority: 8,
                    estimatedTime: 60,
                    content: {
                        youtubeId: 'Du10K5UKpQs',
                        videoUrl: 'https://www.youtube.com/watch?v=Du10K5UKpQs',
                        instructor: 'ExpertVillage'
                    },
                    learningObjectives: [
                        'Create and manage email accounts',
                        'Write professional emails',
                        'Use messaging apps effectively',
                        'Understand email etiquette'
                    ],
                    skills: ['email_management', 'professional_communication'],
                    offlineAvailable: true
                }
            ];

            await Module.insertMany(modules);
            console.log(`✅ Seeded ${modules.length} modules\n`);
        } else {
            console.log(`ℹ️  Database already has ${moduleCount} modules\n`);
        }

        // Seed instructors, blog posts, and events
        console.log('\n📋 Seeding additional data...\n');

        // Close current connection before running seed scripts
        await mongoose.connection.close();

        // Run seed scripts (they handle their own connections)
        await seedInstructors();
        await seedBlog();
        await seedEvents();

        // Reconnect to show final status
        await mongoose.connect(process.env.MONGODB_URI);

        // Show final status
        const userCount = await User.countDocuments();
        const finalModuleCount = await Module.countDocuments();
        const Instructor = require('../models/Instructor');
        const BlogPost = require('../models/BlogPost');
        const Event = require('../models/Event');
        const instructorCount = await Instructor.countDocuments();
        const blogPostCount = await BlogPost.countDocuments();
        const eventCount = await Event.countDocuments();

        console.log('\n' + '='.repeat(60));
        console.log('DATABASE SETUP COMPLETE');
        console.log('='.repeat(60));
        console.log(`👥 Total Users: ${userCount}`);
        console.log(`📚 Total Modules: ${finalModuleCount}`);
        console.log(`👨‍🏫 Total Instructors: ${instructorCount}`);
        console.log(`📝 Total Blog Posts: ${blogPostCount}`);
        console.log(`📅 Total Events: ${eventCount}`);
        console.log('='.repeat(60));
        console.log('\n🎉 Your database is ready to use!\n');
        console.log('Admin Credentials:');
        console.log('  📧 Email: admin@skillbridge.com');
        console.log('  🔑 Password: admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    }
};

setupDatabase();
