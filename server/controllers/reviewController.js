const connection = require('../config/db');

// Add a review for a book
exports.addReview = (req, res) => {
    const { bookId, writtenReview, rating, userId } = req.body;

    // Validate input
    if (!bookId || !rating || !userId) {
        return res.status(400).json({ message: "bookId, rating, and userId are required" });
    }

    const query = 'INSERT INTO reviews (book_id, written_review, rating, user_id) VALUES (?, ?, ?, ?)';

    connection.query(query, [bookId, writtenReview, rating, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error saving review" });
        }
        return res.status(201).json({ message: "Review saved successfully" });
    });
};

// Update an existing review
exports.updateReview = (req, res) => {
    const { bookId, writtenReview, rating, userId } = req.body;

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
    const { bookId, userId } = req.query;

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