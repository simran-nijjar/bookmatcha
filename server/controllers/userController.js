const bcrypt = require("bcryptjs");
const connection = require('../config/db');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const saltRounds = 12;

// Register user
exports.register = (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
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
        connection.query(insertQuery, [first_name, last_name, email, hashedPassword], (err, insertResult) => {
            if (err) {
                return res.status(500).json({ message: "Failed to register user" });
            }

            const user_id = insertResult.insertId;
            const token = generateToken({ user_id });

            return res.status(201).json({ message: "User registered successfully", token });
        });
    });
};

// User login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
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

            const token = generateToken({ user_id: user.user_id });
            return res.status(200).json({ message: "User logged in successfully", token });
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

// Validate password
exports.validatePassword = (req, res) => {
    const { password } = req.body;
    const user_id = req.body?.user_id || req.query?.user_id;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const query = 'SELECT * FROM users WHERE user_id = ?';
    connection.query(query, [user_id], async (err, results) => {
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
    const { newPassword } = req.body;
    const user_id = req.body?.user_id || req.query?.user_id;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
    }

    bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: "Error hashing password" });
        }

        const query = 'UPDATE users SET password = ? WHERE user_id = ?';
        connection.query(query, [hashedPassword, user_id], (err, result) => {
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
    const user_id = req.body?.user_id || req.query?.user_id;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    const query = 'SELECT * FROM users WHERE user_id = ?';
    connection.query(query, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error getting user information" });
        }

        if (results.length > 0) {
            return res.status(200).json(results[0]);
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    });
};

// Update first or last name
exports.updateUserInformation = (req, res) => {
    const user_id = req.body?.user_id || req.query?.user_id;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    const { first_name, last_name, profile_pic } = req.body;

    const fieldsToUpdate = [];
    const values = [];

    if (first_name) { fieldsToUpdate.push('first_name = ?'); values.push(first_name); }
    if (last_name) { fieldsToUpdate.push('last_name = ?'); values.push(last_name); }
    if (profile_pic) { fieldsToUpdate.push('profile_pic = ?'); values.push(profile_pic); }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ message: "At least one field to update must be provided" });
    }

    const query = `UPDATE users SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE user_id = ?`;
    values.push(user_id);

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
        return res.status(400).json({ message: "Email is required" });
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
        return res.status(400).json({ message: "Token and new password are required" });
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
