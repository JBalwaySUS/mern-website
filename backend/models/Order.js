const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    buyerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    item: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item',
        required: true 
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed'], 
        default: 'pending' 
    },
    otp: String
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
