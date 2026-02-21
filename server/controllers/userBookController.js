const connection = require('../config/db');
const { MEDIA_TYPES } = require ('../constants/shelfConstants');

// Insert/update (upsert) a book into a user's shelf
exports.upsertUserBook = (req, res) => {
    const userId = req.user.userId;
    const { bookId, shelfId, mediaType, startDate, finishedDate } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!bookId || !shelfId) {
        return res.status(400).json({ message: "bookId and shelfId are required"});
    }

    if (mediaType && !MEDIA_TYPES.includes(mediaType)) {
        return res.status(400).json({ message: "Invalid media type"});
    }

    const checkShelfQuery = 'SELECT shelf_id FROM shelves WHERE shelf_id = ? AND user_id = ?';
    connection.query(checkShelfQuery, [shelfId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error verifying shelf' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Shelf not found' });
        }

        const query = `
            INSERT INTO user_books (user_id, book_id, shelf_id, media_type, start_date, finished_date, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                shelf_id = VALUES(shelf_id),
                media_type = VALUES(media_type),
                start_date = VALUES(start_date),
                finished_date = VALUES(finished_date),
                updated_at = CURRENT_TIMESTAMP
        `;
        connection.query(query, [userId, bookId, shelfId, mediaType || null, startDate || null,finishedDate || null], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error saving book to shelf' });
            }
            return res.status(200).json({ message: 'Book shelf updated successfully' });
        });
    });
};

// Get all of the user's books on all of the shelves
exports.getUserBooks = (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    const query = `
        SELECT 
            ub.id,
            ub.book_id,
            ub.shelf_id,
            ub.media_type,
            ub.start_date,
            ub.finished_date,
            ub.created_at,
            ub.updated_at,
            b.name AS bookTitle,
            b.author AS bookAuthor,
            b.image_link AS bookImage,
            s.name AS shelfName,
            s.slug AS shelfSlug,
            r.rating,
            r.written_review
        FROM user_books ub
        INNER JOIN books b ON ub.book_id = b.book_id
        INNER JOIN shelves s ON ub.shelf_id = s.shelf_id
        LEFT JOIN reviews r ON ub.book_id = r.book_id AND r.user_id = ?
        WHERE ub.user_id = ?
        ORDER BY s.created_at ASC, ub.updated_at DESC
    `;

    connection.query(query, [userId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user books' });
        }
        return res.status(200).json(result);
    });
};

// Get books on a specific shelf
exports.getBooksByShelf = (req, res) => {
    const userId = req.user.userId;
    const { shelfSlug }= req.params;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!shelfSlug) {
        return res.status(400).json({ message: "shelfSlug is required"});
    }

    const query = `
        SELECT 
            ub.id,
            ub.book_id,
            ub.shelf_id,
            ub.media_type,
            ub.start_date,
            ub.finished_date,
            ub.created_at,
            ub.updated_at,
            b.name AS bookTitle,
            b.author AS bookAuthor,
            b.image_link AS bookImage,
            s.name AS shelfName,
            s.slug AS shelfSlug,
            r.rating,
            r.written_review
        FROM user_books ub
        INNER JOIN books b ON ub.book_id = b.book_id
        INNER JOIN shelves s ON ub.shelf_id = s.shelf_id
        LEFT JOIN reviews r ON ub.book_id = r.book_id AND r.user_id = ?
        WHERE ub.user_id = ? AND s.slug = ?
        ORDER BY ub.updated_at DESC
    `;

    connection.query(query, [userId, userId, shelfSlug], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching shelf books' });
        }
        return res.status(200).json(result);
    });
};


// Get a book's shelf for a user
exports.getShelfByBookId = (req, res) => {
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
            ub.id,
            ub.book_id,
            ub.shelf_id,
            ub.media_type,
            ub.start_date,
            ub.finished_date,
            ub.created_at,
            ub.updated_at,
            s.name AS shelfName,
            s.slug AS shelfSlug
        FROM user_books ub
        INNER JOIN shelves s ON ub.shelf_id = s.shelf_id
        WHERE ub.user_id = ? AND ub.book_id = ?
    `;

    connection.query(query, [userId, bookId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching book shelf entry' });
        }
        return res.status(200).json(result.length > 0 ? result[0] : null);
    });
};

// Remove a book from a user's shelf
exports.removeBookFromShelf = (req, res) => {
    const userId = req.user.userId;
    const { bookId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    if (!bookId) {
        return res.status(400).json({ message: "bookId is required"});
    }

        const query = 'DELETE FROM user_books WHERE user_id = ? AND book_id = ?';

    connection.query(query, [userId, bookId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error removing book from shelf' });
        }
        return res.status(200).json({ message: 'Book removed from shelf successfully' });
    });
};