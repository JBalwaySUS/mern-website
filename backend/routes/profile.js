const express = require('express');
const router = express.Router();
const { 
    getProfile, 
    updateProfile, 
    getOrderHistory, 
    addSellerReview 
} = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');
const Review = require('../models/Review');

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.get('/orders', authMiddleware, getOrderHistory);
router.post('/reviews', authMiddleware, addSellerReview);
router.get('/reviews/:sellerId',  async (req, res) => {
    try {
        const reviews = await Review.find({ seller: req.params.sellerId }).populate('reviewer', 'firstName lastName email contactNumber');
        res.json(reviews);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;