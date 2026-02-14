const bcrypt = require("bcryptjs");
const connection = require('../config/db');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const saltRounds = 12;

// Register user
exports.register = (req, res) => {
    const { FirstName, LastName, Email, Password } = req.body;

    if (!FirstName || !LastName || !Email || !Password) {
        return res.status(400).json({ message: "FirstName, LastName, Email, and Password are all required"});
    }

    const checkEmailQuery = 'SELECT * FROM BookmatchaUser WHERE Email = ?';

    connection.query(checkEmailQuery, [Email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking email"});
        }
        if (results.length > 0) {
            return res.status(409).json({ message: "Account with this email already exists"});
        }

        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const query = 'INSERT INTO BookmatchaUser (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)';

        connection.query(query, [FirstName, LastName, Email, hashedPassword], (err) => {
            if (err)
            {
                return res.status(500).send("Failed to register user");
            }

            const token = generateToken({ email: Email });
            return res.status(201).json({ message: "User registered successfully", token})
        });
    });
};

// User login
exports.login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        if (!Email || !Password) {
            return res.status(400).json({ message: "Email and Password are required"});
        }

        const query = 'SELECT * FROM BookmatchaUser WHERE Email =?';

        connection.query(query, [Email], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error checking for user"});
            }
            if (result.length == 0){
                return res.status(404).json({ message: "User not found"});
            }

            const user = result[0]
            const isMatch = await bcrypt.compare(Password, user.Password);

            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            }

            const token = generateToken(user);
            return res.status(200).json({ message: "User logged in successfully", token});
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

// Validate password
exports.validatePassword = (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ message: "Email and password are required"});
    }

    const query = 'SELECT * FROM BookmatchaUser WHERE Email =?';

    connection.query(query, [Email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking for user"});
        }
        if (results.length == 0) {
            return res.status(404).json({ message: "User not found"});
        }

        const user = results[0];
        await bcrypt.compare(Password, user.Password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: "Error comparing passwords"});
            }
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is not correct"});
            }
            return res.status(200).json({ message: "Password is valid"});
        });
    });
}

// Update password
exports.updatePassword = (req, res) => {
    const { NewPassword, Email } = req.body;

    if (!NewPassword || !Email) {
        return res.status(400).json({ message: "New Password and Email is required"});
    }
    
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            return res.status(500).json({ message: "Error generating salt"});
        }

        bcrypt.hash(NewPassword, salt, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ message: "Error hashing password"});
            }

            const query = 'UPDATE BookmatchaUser SET Password=? WHERE Email =?';

            values = [hashedPassword, Email];

            connection.query(query, values, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Error updating password"});
                } else if (result.affectedRows > 0) {
                    return res.status(200).json({ message: "Password updated successfully"});
                } 
                return res.status(404).json({ message: "User not found"});
            });
        });
    });
}

// Get user information
exports.getUserInformation = (req, res) => {
    const Email = req.query.Email;

    if (!Email) {
        return res.status(400).json({ message: "Email is required"});
    }

    const query = 'SELECT * FROM BookmatchaUser WHERE Email = ?';

    connection.query(query, [Email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting user information"});
        } 
        
        if (result.length > 0) {
            return res.status(200).send(result[0]); 
        }
        return res.status(404).json({ message: "User not found"});
    });
};

// Update first or last name
exports.updateUserInformation = (req, res) => {
    const { Email, FirstName, LastName } = req.body;

    if (!Email) {
        return res.status(400).json({ message: "Email is required"});
    }

    const fieldsToUpdate = [];
    const values = [];

    if (FirstName) {
        fieldsToUpdate.push('FirstName = ?');
        values.push(FirstName);
    }

    if (LastName) {
        fieldsToUpdate.push('LastName = ?');
        values.push(LastName);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).send("At least one field to update must be provided");
    }
    
    const query = `UPDATE BookmatchaUser SET ${fieldsToUpdate.join(', ')} WHERE Email = ?`;
    values.push(Email);
    
     connection.query(query, values, async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating first name"});
        } else if (result.affectedRows > 0) {
            return res.status(200).json({ message: "User updated successfully"});
        } 
    });
};

// Send request to reset password
exports.requestPasswordReset = (req, res) => {
    const { Email } = req.body;

    if (!Email) {
        return res.status(400).json({ message: "Email is required"});
    }

    const checkUserQuery = 'SELECT * FROM BookmatchaUser WHERE Email = ?';

    connection.query(checkUserQuery, [Email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting user information"});
        } 
        
        if (result.length == 0) {
           return res.status(200);
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = new Date(Date.now() + 3600000);

        const updateTokenQuery = 'UPDATE BookmatchaUser SET ResetToken = ?, ResetTokenExpiry = ? WHERE Email = ?';
        connection.query(updateTokenQuery, [resetToken, tokenExpiration, Email], async (err) => {
            if (err) {
                console.error("Error saving reset token:", err);
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
            <p>Do not reply to this email. This inbox is not monitored.</p>
            <hr />
            <p style="font-size: 12px; color: #888;">© 2026 Bookmatcha. All rights reserved.</p>
            `;


            try {
                await sendEmail({
                    to: Email,
                    subject: 'Bookmatcha Password Reset',
                    html: emailContent
                });
                return res.status(200);
            } catch (error) {
                return res.status(500).json({ message: "Error sending reset email"});
            }
        });
    });
}

// Reset password
exports.resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    const query = 'SELECT * FROM BookmatchaUser WHERE ResetToken = ? AND ResetTokenExpiry > ?';
    connection.query(query, [token, new Date()], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (result.length === 0) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const user = result[0];
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const updateQuery = 'UPDATE BookmatchaUser SET Password = ?, ResetToken = NULL, ResetTokenExpiry = NULL WHERE Email = ?';
        connection.query(updateQuery, [hashedPassword, user.Email], (err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to reset password" });
            }

            return res.status(200).json({ message: "Password has been reset successfully" });
        });
    });
};
