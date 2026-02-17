const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_SECRET = process.env.ACCESS_SECRET;

module.exports = function (req, res, next) {
    let token;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Access token expired or invalid" });
    }
};
