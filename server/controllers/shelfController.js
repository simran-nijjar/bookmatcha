const connection = require('../config/db');
const xss = require('xss');
const { containsProfanity } = require('../utils/contentFilter');
const { SYSTEM_SHELVES } = require ('../constants/shelfConstants');

// Create system book shelves for a new user
exports.createSystemShelves = (userId, callback) => {
    if (!userId) {
        if (callback) {
            callback(new Error('userId is required'));
            return;
        }
    }

    const values = SYSTEM_SHELVES.map(shelf => [userId, shelf.name, shelf.slug, 'system']);

    const query = `INSERT IGNORE INTO shelves (user_id, name, slug, shelf_type) VALUES ?`;

    connection.query(query, [values], (err) => {
        if (err) {
            if (callback) {
                callback(err);
            }
            return;
        }
        if (callback) {
            callback(null);
        } 
    });
};

// Get all shelves for a user
exports.getUserShelves = (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    const query = `
        SELECT 
            s.shelf_id,
            s.name,
            s.slug,
            s.shelf_type,
            s.created_at,
            COUNT(ub.id) AS book_count
        FROM shelves s
        LEFT JOIN user_books ub ON s.shelf_id = ub.shelf_id
        WHERE s.user_id = ?
        GROUP BY s.shelf_id
        ORDER BY s.shelf_type ASC, s.created_at ASC
    `;

     connection.query(query, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user shelves' });
        }
        return res.status(200).json(result);
    });
};

// Create custom shelf
exports.createCustomShelf = (req, res) => {
    const userId = req.user.userId;
    const shelfName = xss(req.body.shelfName || '');

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!shelfName || shelfName.trim() === '') {
        return res.status(400).json({ message: "Shelf name is required" });
    }

    if (containsProfanity(shelfName)) {
        return res.status(400).json({ message: "Shelf name contains inappropriate language"});
    }

    if (shelfName.trim().length > 100) {
        return res.status(400).json({ message: "Shelf name cannot exceed 100 characters"});
    }

    const slug = shelfName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    if (!slug) {
        return res.status(400).json({ message: 'Invalid shelf name' });
    }

    const query = `INSERT INTO shelves (user_id, name, slug, shelf_type) VALUES (?, ?, ?, 'custom')`;

    connection.query(query, [userId, shelfName.trim(), slug], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'A shelf with that name already exists' });
            }
            return res.status(500).json({ message: 'Error creating shelf' });
        }
        return res.status(201).json({ message: 'Shelf created successfully' });
    });
};

// Delete a custom shelf
exports.deleteShelf = (req, res) => {
    const userId = req.user.userId;
    const { shelfId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!shelfId) {
        return res.status(400).json({ message: "shelfId is required" });
    }

    const checkQuery = `SELECT shelf_type FROM shelves WHERE shelf_id = ? AND user_id = ?`;

    connection.query(checkQuery, [shelfId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error finding shelf' });
        }
        if (result.length === 0) {
            return res.status(200).json({ message: 'Shelf not found' });
        }
        if (result[0].shelf_type === 'system') {
            return res.status(403).json({ message: 'System shelves cannot be deleted' });
        }

        const deleteQuery = 'DELETE FROM shelves WHERE shelf_id = ? AND user_id = ?';

        connection.query(deleteQuery, [shelfId, userId], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting shelf' });
            }
            return res.status(200).json({ message: 'Shelf deleted successfully' });
        });
    });
};

