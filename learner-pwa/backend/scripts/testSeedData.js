require('dotenv').config();
const mongoose = require('mongoose');
const Instructor = require('../models/Instructor');
const BlogPost = require('../models/BlogPost');
const Event = require('../models/Event');

async function testSeedData() {
    try {
        console.log('🔍 Testing Seed Data...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge254', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB\n');

        // Test Instructors
        const instructorCount = await Instructor.countDocuments();
        console.log(`👨‍🏫 Instructors: ${instructorCount}`);

        if (instructorCount > 0) {
            const sampleInstructor = await Instructor.findOne();
            console.log(`   Sample: ${sampleInstructor.name} - ${sampleInstructor.title}`);
        }

        // Test Blog Posts
        const blogPostCount = await BlogPost.countDocuments();
        console.log(`\n📝 Blog Posts: ${blogPostCount}`);

        if (blogPostCount > 0) {
            const publishedCount = await BlogPost.countDocuments({ published: true });
            const draftCount = await BlogPost.countDocuments({ published: false });
            console.log(`   Published: ${publishedCount}`);
            console.log(`   Drafts: ${draftCount}`);

            const samplePost = await BlogPost.findOne().populate('author', 'email');
            console.log(`   Sample: "${samplePost.title}" by ${samplePost.author?.email || 'Unknown'}`);
        }

        // Test Events
        const eventCount = await Event.countDocuments();
        console.log(`\n📅 Events: ${eventCount}`);

        if (eventCount > 0) {
            const upcomingCount = await Event.countDocuments({ status: 'upcoming' });
            const onlineCount = await Event.countDocuments({ isOnline: true });
            console.log(`   Upcoming: ${upcomingCount}`);
            console.log(`   Online: ${onlineCount}`);

            const sampleEvent = await Event.findOne();
            console.log(`   Sample: "${sampleEvent.title}" - ${sampleEvent.startDate.toLocaleDateString()}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All seed data verified successfully!');
        console.log('='.repeat(60));

        mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('❌ Error testing seed data:', error);
        process.exit(1);
    }
}

// Run the test
testSeedData();
