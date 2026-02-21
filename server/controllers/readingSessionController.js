const connection = require('../config/db');
const { MEDIA_TYPES } = require ('../constants/shelfConstants');

// Add reading session
exports.addReadingSession = (req, res) => {
    const userId = req.user.userId;
    const { bookId, mediaType, startDate, finishedDate } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!bookId) {
        return res.status(400).json({ message: "bookId is required"});
    }

    if (mediaType && !MEDIA_TYPES.includes(mediaType)) {
        return res.status(400).json({ message: 'Invalid media type' });
    }

    if (finishedDate && startDate && new Date(finishedDate) < new Date(startDate)) {
        return res.status(400).json({ message: 'Finished date cannot be before start date' });
    }

    const query = `INSERT INTO reading_sessions (user_id, book_id, media_type, start_date, finished_date) VALUES (?, ?, ?, ?, ?)`;

    connection.query(query, [userId, bookId, mediaType || null, startDate || null, finishedDate || null], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding reading session' });
        }
        return res.status(201).json({ message: 'Reading session added successfully', sessionId: result.insertId});
    });
};

// Get all reading sessions for the user
exports.getUserReadingSessions = (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    const query = `
        SELECT 
            rs.session_id,
            rs.book_id,
            rs.media_type,
            rs.start_date,
            rs.finished_date,
            rs.created_at,
            b.name AS bookTitle,
            b.author AS bookAuthor,
            b.image_link AS bookImage
        FROM reading_sessions rs
        INNER JOIN books b ON rs.book_id = b.book_id
        WHERE rs.user_id = ?
        ORDER BY rs.start_date DESC
    `;

    connection.query(query, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching reading sessions' });
        }
        return res.status(200).json(result);
    });
};

// Get all reading sessions for a specific book
exports.getReadingSessionsByBook = (req, res) => {
    const userId = req.user.userId;
    const { bookId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!bookId) {
        return res.status(400).json({ message: "bookId is required"});
    }

    const query = `
        SELECT 
            rs.session_id,
            rs.book_id,
            rs.media_type,
            rs.start_date,
            rs.finished_date,
            rs.created_at,
            b.name AS bookTitle,
            b.author AS bookAuthor
        FROM reading_sessions rs
        INNER JOIN books b ON rs.book_id = b.book_id
        WHERE rs.user_id = ? AND rs.book_id = ?
        ORDER BY rs.start_date DESC
    `;

    connection.query(query, [userId, bookId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching reading sessions for book' });
        }
        return res.status(200).json(result);
    });
};

// Update a reading session
exports.updateReadingSession = (req, res) => {
    const userId = req.user.userId;
    const { sessionId } = req.params;
    const { mediaType, startDate, finishedDate } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!sessionId) {
        return res.status(400).json({ message: 'sessionId is required' });
    }

    if (mediaType && !MEDIA_TYPES.includes(mediaType)) {
        return res.status(400).json({ message: 'Invalid media type' });
    }

    if (finishedDate && startDate && new Date(finishedDate) < new Date(startDate)) {
        return res.status(400).json({ message: 'Finished date cannot be before start date' });
    }

    const checkQuery = 'SELECT session_id FROM reading_sessions WHERE session_id = ? AND user_id = ?';
    connection.query(checkQuery, [sessionId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error finding reading session' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Reading session not found' });
        }

        const query = `UPDATE reading_sessions SET media_type = ?, start_date = ?, finished_date = ? WHERE session_id = ? AND user_id = ?`;

        connection.query(query, [mediaType || null, startDate || null, finishedDate || null, sessionId, userId], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating reading session' });
            }
            return res.status(200).json({ message: 'Reading session updated successfully' });
        });
    });
};

// Delete a reading session
exports.deleteReadingSession = (req, res) => {
    const userId = req.user.userId;
    const { sessionId } = req.params;;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!sessionId) {
        return res.status(400).json({ message: 'sessionId is required' });
    }

    const query = 'DELETE FROM reading_sessions WHERE session_id = ? AND user_id = ?';

    connection.query(query, [sessionId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting reading session' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reading session not found' });
        }
        return res.status(200).json({ message: 'Reading session deleted successfully' });
    });
};
