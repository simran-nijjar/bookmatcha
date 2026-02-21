const connection = require('../config/db');
const xss = require('xss');

// Helper to sync a reviewed book to the read shelf
const syncToReadShelf = (userId, bookId) => {
    const getShelfQuery = `SELECT shelf_id FROM shelves WHERE user_id = ? AND slug = 'read'`;

    connection.query(getShelfQuery, [userId], (err, result) => {
        if (err || result.length === 0) {
            return;
        }

        const shelfId = result[0].shelf_id;

        const upsertQuery = `
            INSERT INTO user_books (user_id, book_id, shelf_id, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                shelf_id = IF(shelf_id = VALUES(shelf_id), shelf_id, shelf_id),
                updated_at = CURRENT_TIMESTAMP
        `;

        connection.query(upsertQuery, [userId, bookId, shelfId], (err) => {
            if (err) {
                // Do nothing
            }
        });
    });
};

// Add a review for a book
exports.addReview = (req, res) => {
    const userId = req.user.userId;
    const writtenReview = xss(req.body.writtenReview || '');
    const { bookId, rating } = req.body;

    // Validate input
    if (!bookId || !userId) {
        return res.status(400).json({ message: "bookId, and userId are required" });
    }

    if (!rating) {
        return res.status(400).json({ message: "rating is required"});
    }

    if (writtenReview.length > 2000){
        return res.status(400).json({ message: "Review cannot exceed 2000 characters"});
    }

    const query = 'INSERT INTO reviews (book_id, written_review, rating, user_id) VALUES (?, ?, ?, ?)';

    connection.query(query, [bookId, writtenReview, rating, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error saving review" });
        }
        syncToReadShelf(userId, bookId);

        return res.status(201).json({ message: "Review saved successfully" });
    });
};

// Update an existing review
exports.updateReview = (req, res) => {
    const userId = req.user.userId;
    const writtenReview = xss(req.body.writtenReview || '');
    const { bookId, rating } = req.body;

    if (!bookId || !rating || !userId) {
        return res.status(400).json({ message: "bookId, rating, and userId are required" });
    }

    const query = `
        UPDATE reviews
        SET written_review = ?, rating = ?, updated_at = CURRENT_TIMESTAMP
        WHERE book_id = ? AND user_id = ?
    `;

    connection.query(query, [writtenReview, rating, bookId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating review" });
        }
        syncToReadShelf(userId, bookId);

        return res.status(200).json({ message: "Review updated successfully" });
    });
};

// Get all reviews for a specific book
exports.getBookReviews = (req, res) => {
    const { bookId } = req.query;

    if (!bookId) {
        return res.status(400).json({ message: "bookId is required" });
    }

    const query = `
        SELECT 
            r.BookReviewID,
            r.written_review,
            r.rating,
            r.book_id,
            r.created_at,
            r.updated_at,
            r.spoiler_flag,
            b.name AS bookTitle,
            b.author AS bookAuthor,
            avg_ratings.average_rating,
            u.user_name
        FROM reviews r
        INNER JOIN books b ON r.book_id = b.book_id
        INNER JOIN users u ON r.user_id = u.user_id
        LEFT JOIN (
            SELECT book_id, AVG(rating) AS average_rating
            FROM reviews
            GROUP BY book_id
        ) AS avg_ratings ON r.book_id = avg_ratings.book_id
        WHERE r.book_id = ?;
    `;

    connection.query(query, [bookId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting reviews for bookId: " + bookId });
        }
        return res.status(200).json(result);
    });
};

// Get all reviews written by a user
exports.getUsersBookReviews = (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(401).json({ message: "userId is required" });
    }

    const query = `
        SELECT 
            r.BookReviewID,
            r.written_review,
            r.rating,
            r.book_id,
            r.created_at,
            r.updated_at,
            r.spoiler_flag,
            b.name AS bookTitle,
            b.author AS bookAuthor,
            avg_ratings.average_rating
        FROM reviews r
        INNER JOIN books b ON r.book_id = b.book_id
        LEFT JOIN (
            SELECT book_id, AVG(rating) AS average_rating
            FROM reviews
            GROUP BY book_id
        ) AS avg_ratings ON r.book_id = avg_ratings.book_id
        WHERE r.user_id = ?;
    `;

    connection.query(query, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting reviews written by user" });
        }
        return res.status(200).json(result);
    });
};

// Get a specific review for a book by a user
exports.getReviewForBookByUser = (req, res) => {
    const userId = req.user.userId;
    const { bookId } = req.query;

    if (!bookId || !userId) {
        return res.status(400).json({ message: "bookId and userId are required" });
    }

    const query = 'SELECT * FROM reviews WHERE book_id = ? AND user_id = ?';

    connection.query(query, [bookId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting review" });
        }
        return res.status(200).json(result);
    });
};

// Delete a review
exports.deleteReview = (req, res) => {
    const reviewID = req.params.id;

    const query = 'DELETE FROM reviews WHERE BookReviewID = ?';

    connection.query(query, [reviewID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting review" });
        }
        return res.status(200).json({ message: "Review deleted successfully" });
    });
};