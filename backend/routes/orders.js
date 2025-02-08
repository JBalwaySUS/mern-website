const express = require('express');
const router = express.Router();
const { placeOrder, verifyOrder } = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Item = require('../models/Item');
const bcrypt = require('bcryptjs');

router.post('/', authMiddleware, placeOrder);
router.post('/verify', authMiddleware, verifyOrder);
router.get('/deliveritems', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.userId });
        const orders = await Order.find({ 
            item: { $in: await Item.find({ sellerId: user._id }).select('_id') }
        }).populate('item').populate('buyerId', 'firstName lastName email contactNumber');
        res.json(orders);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/pendingorders', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.userId });
        const orders = await Order.find({
            buyerId: user._id,
            status: 'pending'
        })
        .populate({
            path: 'item',
            populate: { path: 'sellerId', select: 'firstName lastName email contactNumber' } // Populate sellerId inside item
        })
        .populate('buyerId', 'firstName lastName email contactNumber');

        // Generate a 6 digit OTP for each order
        const otps = {};
        await Promise.all(orders.map(async (order) => {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(otp, salt);
            otps[order._id] = otp;
            order.otpHash = hash;
        }));

        // Store the hash in the corresponding order database
        await Promise.all(orders.map(order => 
            Order.updateOne(
            { _id: order._id },
            { $set: { otp: order.otpHash } }
            )
        ));

        // Send the unhashed OTPs to the frontend
        res.json({ orders, otps });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/boughtitems', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.userId });
        const orders = await Order.find({ 
            buyerId: user._id,
            status: 'completed'
        })
        .populate({
            path: 'item',
            populate: { path: 'sellerId', select: 'firstName lastName email contactNumber' } // Populate sellerId inside item
        })
        .populate('buyerId', 'firstName lastName email contactNumber');
        res.json(orders);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/solditems', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.userId });
        const items = await Item.find({ sellerId: user._id });
        const orders = await Order.find({ 
            item: { $in: items.map(item => item._id) },
            status: 'completed'
        }).populate({
            path: 'item',
            populate: { path: 'sellerId', select: 'firstName lastName email contactNumber' } // Populate sellerId inside item
        })
        .populate('buyerId', 'firstName lastName email contactNumber');
        res.json(orders);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/:orderId', authMiddleware, async (req, res) => {
    try {
      const { orderId } = req.params;
      const user = await User.findOne({ email: req.user.userId });
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Check if user is buyer or seller
      if (order.buyerId.toString() !== user._id.toString() && 
          !(await Item.findOne({ sellerId: user._id, _id: order.item }))) {
        return res.status(403).json({ message: 'Not authorized to cancel this order' });
      }
  
      await order.deleteOne();
      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
  });

module.exports = router;