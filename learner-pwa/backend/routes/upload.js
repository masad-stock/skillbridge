const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(uploadsDir, 'modules');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Define allowed file types
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/zip',
        'application/x-rar-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Protect all upload routes
router.use(protect);

// @desc    Upload module files
// @route   POST /api/v1/upload/module-files
// @access  Private/Admin
router.post('/module-files', authorize('admin'), upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/modules/${file.filename}`,
            type: getFileType(file.mimetype)
        }));

        res.json({
            success: true,
            data: uploadedFiles,
            message: `${uploadedFiles.length} file(s) uploaded successfully`
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'File upload failed'
        });
    }
});

// @desc    Delete uploaded file
// @route   DELETE /api/v1/upload/module-files/:filename
// @access  Private/Admin
router.delete('/module-files/:filename', authorize('admin'), async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, 'modules', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file'
        });
    }
});

// @desc    Get file info
// @route   GET /api/v1/upload/module-files/:filename
// @access  Private
router.get('/module-files/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, 'modules', filename);

        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            res.json({
                success: true,
                data: {
                    filename,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

    } catch (error) {
        console.error('File info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get file info'
        });
    }
});

// Helper function to determine file type
function getFileType(mimetype) {
    const typeMap = {
        'application/pdf': 'pdf',
        'application/msword': 'document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
        'application/vnd.ms-powerpoint': 'presentation',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
        'application/vnd.ms-excel': 'spreadsheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
        'video/mp4': 'video',
        'video/avi': 'video',
        'video/quicktime': 'video',
        'audio/mpeg': 'audio',
        'audio/wav': 'audio',
        'image/jpeg': 'image',
        'image/png': 'image',
        'image/gif': 'image',
        'application/zip': 'archive',
        'application/x-rar-compressed': 'archive'
    };
    return typeMap[mimetype] || 'document';
}

module.exports = router;