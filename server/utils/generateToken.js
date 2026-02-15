const jwt = require('jsonwebtoken');
require('dotenv').config();

// Method to generate token for user
const generateToken = (user) => {
    const payload = {
        userId: user.userId
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = generateToken;