require('dotenv').config();
const mongoose = require('mongoose');
const Module = require('../models/Module');

async function checkModuleImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const modules = await Module.find({}).select('title imageUrl');

        console.log(`Found ${modules.length} modules:\n`);

        modules.forEach((module, index) => {
            console.log(`${index + 1}. ${module.title}`);
            console.log(`   Image URL: ${module.imageUrl || 'NO IMAGE'}`);
            console.log('');
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error checking modules:', error);
        process.exit(1);
    }
}

checkModuleImages();
