const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9.-]+\.)?iiit\.ac\.in$/
    },
    age: { 
        type: Number, 
        min: 16,
        max: 100
    },
    contactNumber: { 
        type: String, 
        match: /^\d{10}$/
    },
    password: { 
        type: String,  
    },
    cart: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item' 
    }],
    sellerReviews: [{
        reviewer: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        rating: { 
            type: Number, 
            min: 1, 
            max: 5 
        },
        comment: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);