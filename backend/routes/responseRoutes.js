const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const authMiddleware = require('../middleware/auth');
const { validateResponse } = require('../middleware/validation');

// @route   POST /api/responses/:formId
router.post('/:formId', validateResponse, responseController.submitResponse);

// @route   GET /api/responses/:formId
router.get('/:formId', authMiddleware, responseController.getResponsesByForm);

// @route   DELETE /api/responses/:responseId
router.delete('/:responseId', authMiddleware, responseController.deleteResponse);

module.exports = router;
