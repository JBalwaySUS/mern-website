const User = require('../models/User');
const Item = require('../models/Item');

exports.addToCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const user = await User.findOne({email: req.user.userId});

        // Check if item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user is the seller of the item
        if (item.sellerId.toString() === user._id.toString()) {
            return res.status(402).json({ message: 'You cannot add your own item to the cart' });
        }

        // Check if item already in cart
        if (user.cart.includes(itemId)) {
            return res.status(400).json({ message: 'Item already in cart' });
        }

        user.cart.push(itemId);
        await user.save();

        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
        console.log(error.message);
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const user = await User.findOne({email: req.user.userId});
        user.cart = user.cart.filter(id => id.toString() !== itemId);
        await user.save();

        res.json(user.cart);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error removing from cart', error: error.message });
    }
};