const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const secretKey = crypto.randomBytes(64).toString('hex');

// Method to generate token for user
const generateToken = (user) => {
    const payload = {
        user_id: user.user_id
    };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

module.exports = generateToken;