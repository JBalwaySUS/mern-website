const express = require('express');
const router = express.Router();
const { addToCart, removeFromCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.post('/', authMiddleware, addToCart);
router.delete('/', authMiddleware, removeFromCart);
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({email: req.user.userId}).populate('cart');
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.log(error);
    }
});

module.exports = router;