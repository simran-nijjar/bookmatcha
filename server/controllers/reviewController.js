const connection = require('../config/db');

// Add review for a book
exports.addReview = (req, res) => {
    const { BookID, WrittenReview, Rating, ReviewerID } = req.body;

    if (!BookID, !WrittenReview, !Rating, !ReviewerID) {
        return res.status(400).json({ message: "BookID, WrittenReview, Rating, and ReviewerID are required"});
    }

    const query = 'INSERT INTO BookReview (BookID, WrittenReview, Rating, ReviewerID) VALUES (?, ?, ?, ?)';

    connection.query(query, [BookID, WrittenReview, Rating, ReviewerID], async (err, result) =>{
        if (err) {
            return res.status(500).json({ message: "Error saving review"});
        }
        return res.status(201).json({ message: "Review saved successfully"});
    });
};

// Update review for a book
exports.updateReview = (req, res) => {
    const { BookID, WrittenReview, Rating, ReviewerId} = req.body;

    const query = 'UPDATE BookReview SET WrittenReview = ?, Rating = ? WHERE BookID = ? AND ReviewerID = ?';

    connection.query(query, [WrittenReview, Rating, BookID, ReviewerID], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating review"});
        }
        return res.status(200).json({ message: "Review updated successfully"});
    });
};

// Get reviews for a book
exports.getBookReviews = (req, res) => {
    const { BookID } = req.query.BookID;

    if (!BookID) {
        return res.status(400).json({ message: "BookID is required"});
    }

    const query = `
        SELECT 
            BookReview.BookReviewID,
            BookReview.WrittenReview, 
            BookReview.RATING, 
            BookReview.BookID,
            BookReview.ReviewDate, 
            Book.Name AS bookTitle, 
            Book.Author AS bookAuthor,
            AvgRatings.averageRating,
            BookReview.ReviewerID,
            BookmatchaUser.FirstName,
            BookmatchaUser.LastName
        FROM BookReview
        INNER JOIN Book ON BookReview.BookID = Book.BookID
        INNER JOIN BookmatchaUser ON BookReview.ReviewerID = BookmatchaUser.Email
        INNER JOIN (
            SELECT 
                BookID,
                AVG(RATING) AS averageRating
                FROM BookReview
                GROUP BY BookID
            ) AS AvgRatings ON BookReview.BookID = AvgRatings.BookID
            WHERE BookReview.BookID = ?;`
    ;

    connection.query(query, BookID, async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting reviews for BookID: " + BookID});
        } 
        return res.status(200).send(result);
    });
};

// Delete review for a book
exports.deleteReview = (req, res) => {
    const reviewID = req.params.id;

    const query = 'DELETE FROM BookReview WHERE BookReviewID = ?';

    connection.query(query, reviewID, async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting review"});
        }
        return res.status(200).json({ message: "Review deleted successfully"});
    });
};

// Get reviews written by user
exports.getUsersBookReviews = (req, res) => {
    const reviewerID = req.query.ReviewerID;
    if (!reviewerID) {
        return res.status(400).json({ message: "ReviewerID is required"});
    }

    const query = `
        SELECT 
            BookReview.BookReviewID,
            BookReview.WrittenReview, 
            BookReview.RATING, 
            BookReview.BookID,
            BookReview.ReviewDate, 
            Book.Name AS bookTitle, 
            Book.Author AS bookAuthor,
            AvgRatings.averageRating
            FROM BookReview
            INNER JOIN BookmatchaUser ON BookReview.ReviewerID = BookmatchaUser.Email
            INNER JOIN Book ON BookReview.BookID = Book.BookID
            INNER JOIN (
            SELECT 
                BookID,
                AVG(RATING) AS averageRating
                FROM BookReview
                GROUP BY BookID
            ) AS AvgRatings ON BookReview.BookID = AvgRatings.BookID
            WHERE BookReview.ReviewerID=?;
    `;

    connection.query(query, reviewerID, async (err, result) => {
        if (err) {
            return res.status(500).json("Error getting reviews written by user");
        } 
        return res.status(200).send(result);
    });
};

// Get specfic review fora book by user
exports.getReviewForBookByUser = (req, res) => {
    const { BookID, ReviewerId } = req.query;

    if (!BookID || !ReviewerId) {
        return res.status(400).json({ message: "BookID and ReviewerID are required"});
    }

    const query = 'SELECT * FROM BookReview WHERE BookID=? AND ReviewerID=?';

    connection.query(query [BookID, ReviewerId], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting review"});
        }
        return res.status(200).send(result);
    });
};