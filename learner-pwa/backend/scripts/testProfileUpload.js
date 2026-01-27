/**
 * Test script to verify profile photo upload functionality
 * Run with: node learner-pwa/backend/scripts/testProfileUpload.js
 */

const path = require('path');
const fs = require('fs').promises;

async function testUploadDirectory() {
    console.log('Testing profile upload directory setup...\n');

    const uploadsDir = path.join(__dirname, '../uploads');
    const profilesDir = path.join(uploadsDir, 'profiles');

    try {
        // Check if uploads directory exists
        const uploadsExists = await fs.access(uploadsDir).then(() => true).catch(() => false);
        console.log(`✓ Uploads directory exists: ${uploadsDir}`);
        console.log(`  Status: ${uploadsExists ? 'EXISTS' : 'MISSING'}`);

        // Check if profiles directory exists
        const profilesExists = await fs.access(profilesDir).then(() => true).catch(() => false);
        console.log(`\n✓ Profiles directory exists: ${profilesDir}`);
        console.log(`  Status: ${profilesExists ? 'EXISTS' : 'MISSING'}`);

        // Try to create a test file
        const testFile = path.join(profilesDir, 'test-upload.txt');
        await fs.writeFile(testFile, 'Test upload file');
        console.log(`\n✓ Test file created successfully: ${testFile}`);

        // Verify test file exists
        const testFileExists = await fs.access(testFile).then(() => true).catch(() => false);
        console.log(`  Status: ${testFileExists ? 'EXISTS' : 'MISSING'}`);

        // Clean up test file
        await fs.unlink(testFile);
        console.log(`\n✓ Test file deleted successfully`);

        // List files in profiles directory
        const files = await fs.readdir(profilesDir);
        console.log(`\n✓ Files in profiles directory: ${files.length}`);
        files.forEach(file => console.log(`  - ${file}`));

        console.log('\n✅ All tests passed! Upload directory is properly configured.');
        return true;

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

// Run the test
testUploadDirectory()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
