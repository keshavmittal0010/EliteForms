const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const authMiddleware = require('../middleware/auth');
const { validateForm } = require('../middleware/validation');

// @route   GET /api/forms/dashboard/stats
router.get('/dashboard/stats', authMiddleware, formController.getDashboardStats);

// @route   POST /api/forms
router.post('/', authMiddleware, validateForm, formController.createForm);

// @route   GET /api/forms
router.get('/', authMiddleware, formController.getForms);

// @route   GET /api/forms/:id
router.get('/:id', formController.getFormById);

// @route   PUT /api/forms/:id
router.put('/:id', authMiddleware, validateForm, formController.updateForm);

// @route   DELETE /api/forms/:id
router.delete('/:id', authMiddleware, formController.deleteForm);

// @route   POST /api/forms/:id/duplicate
router.post('/:id/duplicate', authMiddleware, formController.duplicateForm);

module.exports = router;
