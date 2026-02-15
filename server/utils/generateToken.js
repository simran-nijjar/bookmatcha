const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// Generate Access Token
const generateAccessToken = (user) => {
    const payload = { userId: user.userId };
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    const payload = { userId: user.userId };
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
};

module.exports = { generateAccessToken, generateRefreshToken };
