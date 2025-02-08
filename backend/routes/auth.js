const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.get('/me', authMiddleware, (req, res) => {
    new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email: req.user.userId });
            resolve(user);
        } catch (error) {
            reject(error);
        }
    })
    .then(user => res.json(user))
    .catch(error => res.status(500).json({ error: error.message }));
});

module.exports = router;