const bcrypt = require("bcryptjs");
const connection = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const saltRounds = 12;

// Register user
exports.register = (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkEmailQuery, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error checking email" });
        }

        if (result.length > 0) {
            return res.status(409).json({ message: "Account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertQuery = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
        connection.query(insertQuery, [firstName, lastName, email, hashedPassword], (err, insertResult) => {
            if (err) {
                return res.status(500).json({ message: "Failed to register user" });
            }

            const userId = insertResult.insertId;
            const accessToken = generateAccessToken({ userId });
            const refreshToken = generateRefreshToken({ userId });

            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 3600000
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(201).json({ token: accessToken });
        });
    });
};

// User login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const query = 'SELECT * FROM users WHERE email = ?';
        connection.query(query, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error checking for user" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            }

            const accessToken = generateAccessToken({ userId: user.user_id });
            const refreshToken = generateRefreshToken({ userId: user.user_id });

            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 3600000
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({ token: accessToken });
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

// Refresh token endpoint
exports.refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    const jwt = require('jsonwebtoken');
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken({ userId: user.userId });
        res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000
        });

        return res.status(200).json({ token: newAccessToken });
    });
};

// Validate password
exports.validatePassword = (req, res) => {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!password) {
        return res.status(400).json({ message: "password is required" });
    }

    const query = 'SELECT * FROM users WHERE user_id = ?';
    connection.query(query, [userId], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking for user" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is not correct" });
        }

        return res.status(200).json({ message: "Password is valid" });
    });
};

// Update password
exports.updatePassword = (req, res) => {
    const userId = req.user.userId;
    const { newPassword } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
    }

    bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: "Error hashing password" });
        }

        const query = 'UPDATE users SET password = ? WHERE user_id = ?';
        connection.query(query, [hashedPassword, userId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error updating password" });
            }

            if (result.affectedRows > 0) {
                return res.status(200).json({ message: "Password updated successfully" });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        });
    });
};

// Get user information
exports.getUserInformation = (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    const query = 'SELECT * FROM users WHERE user_id = ?';
    connection.query(query, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting user information" });
        }

        if (result.length > 0) {
            const user = result[0];
            const formattedUser = {
                userId: user.user_id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                profilePic: user.profile_pic,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            };
            return res.status(200).json(formattedUser);
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    });
};

// Update first or last name
exports.updateUserInformation = (req, res) => {
    const userId = req.user.userId;
    const { firstName, lastName, profilePic } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    const fieldsToUpdate = [];
    const values = [];

    if (firstName) { fieldsToUpdate.push('first_name = ?'); values.push(firstName); }
    if (lastName) { fieldsToUpdate.push('last_name = ?'); values.push(lastName); }
    if (profilePic) { fieldsToUpdate.push('profile_pic = ?'); values.push(profilePic); }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ message: "At least one field to update must be provided" });
    }

    const query = `UPDATE users SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE user_id = ?`;
    values.push(userId);

    connection.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating user information" });
        }

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "User updated successfully" });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    });
};

// Send request to reset password
exports.requestPasswordReset = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "email is required" });
    }

    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking user" });
        }

        if (results.length === 0) {
            return res.status(200).end();
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = new Date(Date.now() + 3600000);

        const updateTokenQuery = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
        connection.query(updateTokenQuery, [resetToken, tokenExpiration, email], async (err) => {
            if (err) {
                return;
            }

            const resetUrl = `${process.env.FRONT_END_URL}/reset-password?token=${resetToken}`;
            const emailContent = `
                <h2>Bookmatcha Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your Bookmatcha account. Click the button below to reset your password:</p>
                <p style="text-align:center;">
                    <a href="${resetUrl}" style="
                        background-color: #1a73e8;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    ">Reset Password</a>
                </p>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Do not reply to this email. This email is not monitered.</p>
            `;

            try {
                await sendEmail({ to: email, subject: 'Bookmatcha Password Reset', html: emailContent });
                return res.status(200).end();
            } catch (error) {
                return res.status(500).json({ message: "Error sending reset email" });
            }
        });
    });
};

// Reset password
exports.resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "token and new password are required" });
    }

    const query = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?';
    connection.query(query, [token, new Date()], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const user = results[0];
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const updateQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?';
        connection.query(updateQuery, [hashedPassword, user.email], (err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to reset password" });
            }

            return res.status(200).json({ message: "Password has been reset successfully" });
        });
    });
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });

    return res.status(200).json({ message: "Logged out successfully" });
};
