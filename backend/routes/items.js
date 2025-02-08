const express = require('express');
const router = express.Router();
const { createItem, searchItems, deleteItem } = require('../controllers/itemController');
const authMiddleware = require('../middleware/auth');
const { validateItem } = require('../middleware/validation');
const Item = require('../models/Item');
const User = require('../models/User');

router.post('/', authMiddleware, validateItem, createItem);
router.get('/search', searchItems);
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const user = await User.findById(item.sellerId).select('firstName lastName email contactNumber');
        item.sellerId = user;
        res.json(item);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;