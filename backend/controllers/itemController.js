const Item = require('../models/Item');
const User = require('../models/User');
const Order = require('../models/Order');

exports.createItem = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;

        const user = await User.findOne({ email: req.user.userId })
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newItem = new Item({
            name,
            price,
            description,
            category,
            sellerId: user._id
        });

        const item = await newItem.save();
        res.status(201).json(item);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error creating item', error: error.message });
    }
};

exports.searchItems = async (req, res) => {
    try {
        const { query, categories } = req.query;
        
        let filter = {};
        
        // If search query exists
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        // If categories exist
        if (categories && categories.length) {
            filter.category = { $in: categories };
        }

        // Get items that are part of completed orders
        const completedOrders = await Order.find({ status: 'completed' }).select('item');
        const completedItemIds = completedOrders.map(order => order.item);

        // Exclude items that are part of completed orders
        filter._id = { $nin: completedItemIds };

        const items = await Item.find(filter).populate('sellerId', 'firstName lastName');
        res.json(items);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error searching items', error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('sellerId');
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the user is the seller of the item
        if (item.sellerId.email !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this item' });
        }

        await item.deleteOne();
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
};