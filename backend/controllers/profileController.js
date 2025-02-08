const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Order = require('../models/Order');
const Item = require('../models/Item');
const Review = require('../models/Review');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findOne({email: req.user.userId})
            .select('-password')
            .populate('cart');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, contactNumber, age, newPassword } = req.body;

        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (contactNumber) updateFields.contactNumber = contactNumber;
        if (age) updateFields.age = age;

        let user = await User.findOne({ email: req.user.userId });

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(newPassword, salt);
        }

        user = await User.findByIdAndUpdate(
            user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
        const boughtOrders = await Order.find({ buyerId: req.user.id })
            .populate('items');
        
        const soldItems = await Item.find({ sellerId: req.user.id });
        const soldOrders = await Order.find({ 
            items: { $in: soldItems.map(item => item._id) } 
        }).populate('items');

        res.json({
            bought: boughtOrders,
            sold: soldOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order history', error: error.message });
    }
};

exports.addSellerReview = async (req, res) => {
    try {
        const { sellerId, rating, comment } = req.body;

        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        const reviewer = await User.findOne({ email: req.user.userId });
        const review = new Review({
            seller: sellerId,
            reviewer: reviewer._id,
            rating: rating,
            comment: comment
        });

        await review.save();

        seller.sellerReviews.push(review._id);
        await seller.save();

        res.status(201).json(review);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
};