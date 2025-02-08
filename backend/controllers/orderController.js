const Order = require('../models/Order');
const Item = require('../models/Item');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.placeOrder = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.userId }).populate('cart');

        const orders = [];
        for (const item of user.cart) {
            const newOrder = new Order({
                buyerId: user._id,
                item: item._id,
                status: 'pending',
                totalAmount: item.price,
            });

            const order = await newOrder.save();
            orders.push(order);
        }

        // Clear user's cart
        user.cart = [];
        await user.save();

        res.status(201).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error placing order', error: error.message });
    }
};

exports.verifyOrder = async (req, res) => {
    try {
        const { orderId, otp } = req.body;
        const order = await Order.findById(orderId);

        const isValidOTP = await bcrypt.compare(otp, order.otp);
        if (!isValidOTP) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        order.status = 'completed';
        await order.save();

        res.json({ message: 'Order verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying order', error: error.message });
        console.error(error);
    }
};