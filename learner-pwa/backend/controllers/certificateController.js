const certificateService = require('../services/certificateService');
const path = require('path');
const Joi = require('joi');

/**
 * Generate certificate for completed module
 */
exports.generateCertificate = async (req, res) => {
    try {
        const schema = Joi.object({ moduleId: Joi.string().required() });
        const { value, error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        }
        const { moduleId } = value;
        const userId = req.user.id;

        const result = await certificateService.generateCertificate(userId, moduleId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Generate PDF
        await certificateService.generatePDF(result.certificate._id);

        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            data: result.certificate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get user's certificates
 */
exports.getMyCertificates = async (req, res) => {
    try {
        const userId = req.user.id;
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(20)
        });
        const { value } = schema.validate(req.query);
        const { page, limit } = value;

        const result = await certificateService.getUserCertificates(userId, { page, limit });

        res.json({
            success: true,
            data: result.certificates,
            pagination: result.pagination || { page, limit }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get specific certificate
 */
exports.getCertificate = async (req, res) => {
    try {
        const schema = Joi.object({ id: Joi.string().required() });
        const { value, error } = schema.validate(req.params);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        const { id } = value;
        const result = await certificateService.getCertificateByNumber(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({
            success: true,
            data: result.certificate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Verify certificate
 */
exports.verifyCertificate = async (req, res) => {
    try {
        const schema = Joi.object({ code: Joi.string().required() });
        const { value, error } = schema.validate(req.params);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        const { code } = value;
        const result = await certificateService.verifyCertificate(code);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({
            success: true,
            data: result.certificate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Download certificate PDF
 */
exports.downloadCertificate = async (req, res) => {
    try {
        const schema = Joi.object({ id: Joi.string().required() });
        const { value, error } = schema.validate(req.params);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        const { id } = value;
        const result = await certificateService.getCertificateByNumber(id);

        if (!result.success || !result.certificate.pdfUrl) {
            return res.status(404).json({
                success: false,
                message: 'Certificate PDF not found'
            });
        }

        const filePath = path.join(__dirname, '../../public', result.certificate.pdfUrl);
        res.download(filePath);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get certificate statistics (Admin)
 */
exports.getCertificateStats = async (req, res) => {
    try {
        const result = await certificateService.getCertificateStats();

        res.json({
            success: true,
            data: result.stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Revoke certificate (Admin)
 */
exports.revokeCertificate = async (req, res) => {
    try {
        const paramSchema = Joi.object({ id: Joi.string().required() });
        const bodySchema = Joi.object({ reason: Joi.string().min(3).required() });
        const pr = paramSchema.validate(req.params);
        if (pr.error) return res.status(400).json({ success: false, message: 'Validation error', details: pr.error.details });
        const br = bodySchema.validate(req.body);
        if (br.error) return res.status(400).json({ success: false, message: 'Validation error', details: br.error.details });
        const { id } = pr.value;
        const { reason } = br.value;

        const result = await certificateService.revokeCertificate(id, reason);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
