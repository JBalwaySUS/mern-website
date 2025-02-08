const { body, validationResult } = require('express-validator');
const supportedCategories = require('../config/default.json').supportedCategories;

const validateRegistration = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email')
    .matches(/^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9.-]+\.)?iiit\.ac\.in$/)
        .withMessage('Only IIIT emails allowed'),
    body('age').isInt({ min: 16, max: 100 }).withMessage('Invalid age'),
    body('contactNumber').isMobilePhone('any').withMessage('Invalid contact number'),
    body('password').isLength({ min: 4 }).withMessage('Password must be at least 6 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateItem = [
    body('name').notEmpty().withMessage('Item name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(supportedCategories).withMessage('Invalid category'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateRegistration,
    validateItem
};