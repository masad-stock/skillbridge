const mongoose = require('mongoose');
const Instructor = require('../models/Instructor');
require('dotenv').config();

const sampleInstructors = [
    {
        name: 'Dr. Sarah Kamau',
        email: 'sarah.kamau@skillbridge254.co.ke',
        title: 'Senior Web Development Instructor',
        bio: 'Dr. Sarah Kamau is a seasoned web developer with over 15 years of experience in full-stack development. She holds a PhD in Computer Science and has worked with leading tech companies in Kenya and internationally. Sarah is passionate about empowering youth through digital skills training.',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Kamau&background=667eea&color=fff&size=200',
        expertise: ['Web Development', 'JavaScript', 'React', 'Node.js', 'Database Design'],
        socialLinks: {
            linkedin: 'https://linkedin.com/in/sarahkamau',
            twitter: 'https://twitter.com/sarahkamau',
            github: 'https://github.com/sarahkamau',
            website: 'https://sarahkamau.dev'
        },
        stats: {
            rating: 4.9,
            students: 2500,
            courses: 12
        },
        active: true
    },
    {
        name: 'John Mwangi',
        email: 'john.mwangi@skillbridge254.co.ke',
        title: 'Data Science & AI Specialist',
        bio: 'John Mwangi is a data scientist and machine learning expert with a strong background in statistical analysis and predictive modeling. He has helped numerous organizations leverage data for business insights and has trained over 1000 students in data science fundamentals.',
        avatar: 'https://ui-avatars.com/api/?name=John+Mwangi&background=764ba2&color=fff&size=200',
        expertise: ['Data Science', 'Machine Learning', 'Python', 'AI', 'Statistics'],
        socialLinks: {
            linkedin: 'https://linkedin.com/in/johnmwangi',
            github: 'https://github.com/johnmwangi'
        },
        stats: {
            rating: 4.8,
            students: 1800,
            courses: 8
        },
        active: true
    },
    {
        name: 'Grace Wanjiru',
        email: 'grace.wanjiru@skillbridge254.co.ke',
        title: 'Mobile App Development Expert',
        bio: 'Grace Wanjiru specializes in mobile application development for both iOS and Android platforms. With 10 years of industry experience, she has built and launched over 50 mobile applications. Grace is dedicated to teaching practical, real-world mobile development skills.',
        avatar: 'https://ui-avatars.com/api/?name=Grace+Wanjiru&background=f093fb&color=fff&size=200',
        expertise: ['Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android'],
        socialLinks: {
            linkedin: 'https://linkedin.com/in/gracewanjiru',
            twitter: 'https://twitter.com/gracewanjiru',
            github: 'https://github.com/gracewanjiru'
        },
        stats: {
            rating: 4.9,
            students: 2200,
            courses: 10
        },
        active: true
    },
    {
        name: 'David Omondi',
        email: 'david.omondi@skillbridge254.co.ke',
        title: 'Cybersecurity Consultant',
        bio: 'David Omondi is a certified cybersecurity professional with extensive experience in network security, ethical hacking, and security auditing. He has worked with government agencies and private organizations to strengthen their security posture. David is committed to raising cybersecurity awareness in Kenya.',
        avatar: 'https://ui-avatars.com/api/?name=David+Omondi&background=4facfe&color=fff&size=200',
        expertise: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Penetration Testing'],
        socialLinks: {
            linkedin: 'https://linkedin.com/in/davidomondi',
            website: 'https://davidomondi.security'
        },
        stats: {
            rating: 4.7,
            students: 1500,
            courses: 6
        },
        active: true
    },
    {
        name: 'Mary Njeri',
        email: 'mary.njeri@skillbridge254.co.ke',
        title: 'Digital Marketing Strategist',
        bio: 'Mary Njeri is a digital marketing expert with a proven track record of helping businesses grow their online presence. She specializes in social media marketing, SEO, and content strategy. Mary has trained over 800 entrepreneurs and small business owners in digital marketing.',
        avatar: 'https://ui-avatars.com/api/?name=Mary+Njeri&background=43e97b&color=fff&size=200',
        expertise: ['Digital Marketing', 'SEO', 'Social Media', 'Content Marketing', 'Analytics'],
        socialLinks: {
            linkedin: 'https://linkedin.com/in/marynjeri',
            twitter: 'https://twitter.com/marynjeri',
            website: 'https://marynjeri.marketing'
        },
        stats: {
            rating: 4.8,
            students: 1200,
            courses: 7
        },
        active: true
    },
    {
        name: 'Peter Kariuki',
        email: 'peter.kariuki@skillbridge254.co.ke',
        title: 'Cloud Computing Architect',
        bio: 'Peter Kariuki is a cloud solutions architect with expertise in AWS, Azure, and Google Cloud Platform. He has designed and implemented cloud infrastructure for startups and enterprises across East Africa. Peter is passionate about teaching cloud technologies and DevOps practices.',
        avatar: 'https://ui-avatars.com/api/?name=Peter+Kariuki&background=fa709a&color=fff&size=200',
        expertise: ['Cloud Computing', 'AWS', 'Azure', 'DevOps', 'Docker', 'Kubernetes'],
        socialLinks: {
            linkedin: 'https://linkedin.com/in/peterkariuki',
            github: 'https://github.com/peterkariuki'
        },
        stats: {
            rating: 4.9,
            students: 1600,
            courses: 9
        },
        active: true
    }
];

async function seedInstructors() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge254', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Clear existing instructors
        await Instructor.deleteMany({});
        console.log('Cleared existing instructors');

        // Insert sample instructors
        const instructors = await Instructor.insertMany(sampleInstructors);
        console.log(`✅ Successfully seeded ${instructors.length} instructors`);

        // Display seeded instructors
        instructors.forEach((instructor, index) => {
            console.log(`${index + 1}. ${instructor.name} - ${instructor.title}`);
        });

        mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error seeding instructors:', error);
        process.exit(1);
    }
}

// Run the seed function
if (require.main === module) {
    seedInstructors();
}

module.exports = seedInstructors;
