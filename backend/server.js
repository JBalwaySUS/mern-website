const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cas = require('./middleware/cas');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));
app.use(express.json());

app.use(session({
    secret: process.env.EXPRESS_SESSION_KEY,
    resave: false,
    saveUninitialized: true
}));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/support', require('./routes/support'));

app.get('/auth/cas', cas.bounce, async (req, res) => {
    try {
        let user = await User.findOne({ email: req.session[cas.session_name] });
        
        if (!user) {
            // Create new user if doesn't exist
            user = new User({
                email: req.session.cas_user,
                firstName: req.session.cas_userinfo.firstname || '',
                lastName: req.session.cas_userinfo.lastname || '',
                contactNumber: ''
            });
            await user.save();
        }

        // Generate JWT token
        const payload = { userId: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Redirect to frontend with token
        res.redirect(`${process.env.CORS_ORIGIN}/login?token=${token}`);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/auth/cas/logout', cas.logout);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;