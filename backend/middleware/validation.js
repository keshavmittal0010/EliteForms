const { body, validationResult } = require('express-validator');

// Middleware to check validation results and return errors if found
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateForm = [
  body('title').trim().notEmpty().withMessage('Form title is required'),
  body('fields').isArray().withMessage('Fields must be an array'),
  body('fields.*.id').notEmpty().withMessage('Field ID is required'),
  body('fields.*.type')
    .isIn(['text', 'email', 'number', 'dropdown', 'radio', 'checkbox', 'textarea', 'date'])
    .withMessage('Field type must be a valid type'),
  body('fields.*.label').trim().notEmpty().withMessage('Field label is required'),
  handleValidationErrors,
];

const validateResponse = [
  body('answers').isObject().withMessage('Answers must be an object map of field ID to value'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForm,
  validateResponse,
};
