const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

const sampleEvents = [
    {
        title: 'Digital Skills Workshop for Entrepreneurs',
        description: 'Join us for a comprehensive workshop covering essential digital skills for modern entrepreneurs. Learn about social media marketing, online business management, and digital payment systems. Perfect for small business owners looking to expand their digital presence.',
        startDate: new Date('2024-02-15T09:00:00'),
        endDate: new Date('2024-02-15T17:00:00'),
        location: 'Nairobi Innovation Hub, Ngong Road',
        isOnline: false,
        category: 'Workshop',
        maxAttendees: 50,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        status: 'upcoming'
    },
    {
        title: 'Introduction to Web Development - Free Webinar',
        description: 'Discover the exciting world of web development in this free online webinar. Learn about HTML, CSS, JavaScript, and career opportunities in tech. Ideal for beginners interested in starting a career in web development.',
        startDate: new Date('2024-02-20T14:00:00'),
        endDate: new Date('2024-02-20T16:00:00'),
        location: 'Online',
        isOnline: true,
        meetingLink: 'https://zoom.us/j/123456789',
        category: 'Webinar',
        maxAttendees: 200,
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        status: 'upcoming'
    },
    {
        title: 'Mobile Money & Digital Payments Masterclass',
        description: 'Master M-Pesa, mobile banking, and digital payment systems for business. Learn best practices for accepting payments, managing transactions, and leveraging mobile money for business growth. Hands-on training included.',
        startDate: new Date('2024-02-25T10:00:00'),
        endDate: new Date('2024-02-25T15:00:00'),
        location: 'Mombasa Tech Hub, Mombasa',
        isOnline: false,
        category: 'Training',
        maxAttendees: 30,
        image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&h=600&fit=crop',
        status: 'upcoming'
    },
    {
        title: 'E-commerce Success Summit 2024',
        description: 'Annual summit bringing together successful e-commerce entrepreneurs, industry experts, and aspiring online business owners. Network, learn, and get inspired by success stories. Features keynote speakers, panel discussions, and networking sessions.',
        startDate: new Date('2024-03-10T08:00:00'),
        endDate: new Date('2024-03-10T18:00:00'),
        location: 'Kenyatta International Convention Centre, Nairobi',
        isOnline: false,
        category: 'Conference',
        maxAttendees: 500,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        status: 'upcoming'
    },
    {
        title: 'Cybersecurity Basics for Small Businesses',
        description: 'Protect your business from online threats. Learn about password security, phishing prevention, data protection, and safe online practices. Essential knowledge for any business owner operating in the digital space.',
        startDate: new Date('2024-03-15T13:00:00'),
        endDate: new Date('2024-03-15T16:00:00'),
        location: 'Online',
        isOnline: true,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        category: 'Webinar',
        maxAttendees: 150,
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
        status: 'upcoming'
    },
    {
        title: 'Social Media Marketing Bootcamp',
        description: 'Intensive 2-day bootcamp covering Facebook, Instagram, Twitter, and TikTok marketing strategies. Learn content creation, audience engagement, advertising, and analytics. Includes practical exercises and real campaign planning.',
        startDate: new Date('2024-03-20T09:00:00'),
        endDate: new Date('2024-03-21T17:00:00'),
        location: 'Kisumu Innovation Centre, Kisumu',
        isOnline: false,
        category: 'Bootcamp',
        maxAttendees: 40,
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
        status: 'upcoming'
    }
];

async function seedEvents() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge254', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Find an admin user to use as organizer
        let organizer = await User.findOne({ role: 'admin' });

        if (!organizer) {
            console.log('No admin user found, creating one for events...');
            organizer = await User.create({
                email: 'admin@skillbridge.com',
                password: 'admin123',
                profile: {
                    firstName: 'Admin',
                    lastName: 'User'
                },
                role: 'admin',
                isVerified: true,
                isActive: true
            });
        }

        // Add organizer to events
        const eventsWithOrganizer = sampleEvents.map(event => ({
            ...event,
            organizer: organizer._id
        }));

        // Clear existing events
        await Event.deleteMany({});
        console.log('Cleared existing events');

        // Insert sample events
        const events = await Event.insertMany(eventsWithOrganizer);
        console.log(`✅ Successfully seeded ${events.length} events`);

        // Display seeded events
        events.forEach((event, index) => {
            const dateStr = event.startDate.toLocaleDateString();
            const attendeeCount = event.attendees.length;
            const capacity = event.maxAttendees;
            console.log(`${index + 1}. ${event.title} - ${dateStr} (${attendeeCount}/${capacity} attendees)`);
        });

        mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error seeding events:', error);
        process.exit(1);
    }
}

// Run the seed function
if (require.main === module) {
    seedEvents();
}

module.exports = seedEvents;
