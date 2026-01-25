const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const certificateController = require('../controllers/certificateController');

// Public routes
router.get('/verify/:code', certificateController.verifyCertificate);

// Protected routes (authenticated users)
router.use(protect);

router.post('/generate', certificateController.generateCertificate);
router.get('/my-certificates', certificateController.getMyCertificates);
router.get('/:id', certificateController.getCertificate);
router.get('/:id/download', certificateController.downloadCertificate);

// Admin routes
router.get('/stats', authorize('admin'), certificateController.getCertificateStats);
router.put('/:id/revoke', authorize('admin'), certificateController.revokeCertificate);

module.exports = router;
