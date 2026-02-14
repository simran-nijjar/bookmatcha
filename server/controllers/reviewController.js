const connection = require('../config/db');

// Add a review for a book
exports.addReview = (req, res) => {
    const { BookID, WrittenReview, Rating, ReviewerID } = req.body;

    // Validate input
    if (!BookID || !WrittenReview || !Rating || !ReviewerID) {
        return res.status(400).json({ message: "BookID, WrittenReview, Rating, and ReviewerID are required" });
    }

    const query = 'INSERT INTO reviews (book_id, written_review, rating, user_id) VALUES (?, ?, ?, ?)';

    connection.query(query, [BookID, WrittenReview, Rating, ReviewerID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error saving review" });
        }
        return res.status(201).json({ message: "Review saved successfully" });
    });
};

// Update an existing review
exports.updateReview = (req, res) => {
    const { BookID, WrittenReview, Rating, ReviewerID } = req.body;

    if (!BookID || !WrittenReview || !Rating || !ReviewerID) {
        return res.status(400).json({ message: "BookID, WrittenReview, Rating, and ReviewerID are required" });
    }

    const query = `
        UPDATE reviews
        SET written_review = ?, rating = ?, updated_at = CURRENT_TIMESTAMP
        WHERE book_id = ? AND user_id = ?
    `;

    connection.query(query, [WrittenReview, Rating, BookID, ReviewerID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating review" });
        }
        return res.status(200).json({ message: "Review updated successfully" });
    });
};

// Get all reviews for a specific book
exports.getBookReviews = (req, res) => {
    const book_id = req.query.BookID;

    if (!book_id) {
        return res.status(400).json({ message: "BookID is required" });
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
            r.user_id,
            u.first_name,
            u.last_name
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

    connection.query(query, [book_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting reviews for BookID: " + book_id });
        }
        return res.status(200).json(result);
    });
};

// Get all reviews written by a user
exports.getUsersBookReviews = (req, res) => {
    const user_id = req.query.ReviewerID;

    if (!user_id) {
        return res.status(400).json({ message: "ReviewerID is required" });
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

    connection.query(query, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting reviews written by user" });
        }
        return res.status(200).json(result);
    });
};

// Get a specific review for a book by a user
exports.getReviewForBookByUser = (req, res) => {
    const { BookID, ReviewerID } = req.query;

    if (!BookID || !ReviewerID) {
        return res.status(400).json({ message: "BookID and ReviewerID are required" });
    }

    const query = 'SELECT * FROM reviews WHERE book_id = ? AND user_id = ?';

    connection.query(query, [BookID, ReviewerID], (err, result) => {
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