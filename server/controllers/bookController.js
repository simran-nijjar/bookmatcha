const connection = require('../config/db');

// Insert a book into the database
exports.insertBook = (req, res) => {
    const { title, book_id: BookID, author, image_link, genre, sub_genre } = req.body;

    // Validate required fields
    if (!title || !BookID || !author) {
        return res.status(400).json({ message: "Title, BookID, and Author are required" });
    }

    const query = 'INSERT INTO books (name, book_id, author, image_link, genre, sub_genre) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [title, BookID, author, image_link, genre, sub_genre];

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error("Error inserting book:", err);
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(200).json({ message: "Book already exists in the database" });
            } else {
                return res.status(500).json({ message: "Error inserting book" });
            }
        }
        return res.status(201).json({ message: "Book inserted successfully" });
    });
};

// Fetch books a user has rated 3 or higher
exports.fetchUsersHighlyRatedBooks = (req, res) => {
    const ReviewerID = req.query.ReviewerID;

    if (!ReviewerID) {
        return res.status(400).json({ message: "ReviewerID is required" });
    }

    const query = `
        SELECT b.book_id AS BookID, b.name AS Title, b.author AS Author, r.rating AS Rating
        FROM books b
        INNER JOIN reviews r ON r.book_id = b.book_id
        WHERE r.user_id = ? AND r.rating >= 3
    `;

    connection.query(query, [ReviewerID], (err, result) => {
        if (err) {
            console.error("Error fetching user's books:", err);
            return res.status(500).json({ message: "Error fetching user's books" });
        }
        return res.status(200).json(result);
    });
};

// Fetch recommended books for the user (books rated 3+ by others)
exports.getRecommendedBooks = (req, res) => {
    const ReviewerID = req.query.ReviewerID;

    if (!ReviewerID) {
        return res.status(400).json({ message: "ReviewerID is required" });
    }

    const query = `
        SELECT DISTINCT b.book_id AS BookID, b.name AS Title, b.author AS Author, r.rating AS Rating
        FROM books b
        INNER JOIN reviews r ON r.book_id = b.book_id
        WHERE r.rating >= 3 AND r.user_id != ?
    `;

    connection.query(query, [ReviewerID], (err, result) => {
        if (err) {
            console.error("Error fetching recommended books:", err);
            return res.status(500).json({ message: "Error fetching recommended books" });
        }
        return res.status(200).json(result);
    });
};

// Fetch top rated books (average rating >= 3)
exports.getTopRatedBooks = (req, res) => {
    const query = `
        SELECT 
            b.book_id AS BookID,
            b.name AS Title,
            b.author AS Author,
            b.image_link AS ImageLink,
            AVG(r.rating) AS AverageRating
        FROM books b
        INNER JOIN reviews r ON r.book_id = b.book_id
        GROUP BY b.book_id
        HAVING AVG(r.rating) >= 3
        ORDER BY AverageRating DESC
        LIMIT 5
    `;

    connection.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching top rated books:", err);
            return res.status(500).json({ message: "Error fetching top rated books" });
        }
        return res.status(200).json(result);
    });
};

// Get average rating for a list of BookIDs
exports.getAverageRating = (req, res) => {
    if (!req.query.BookIDs) {
        return res.status(400).json({ message: "BookIDs are required" });
    }

    const BookIDs = req.query.BookIDs.split(",");

    if (BookIDs.length === 0) {
        return res.status(400).json({ message: "BookIDs are required" });
    }

    const query = `
        SELECT book_id AS BookID, AVG(rating) AS AverageRating
        FROM reviews
        WHERE book_id IN (?)
        GROUP BY book_id
    `;

    connection.query(query, [BookIDs], (err, result) => {
        if (err) {
            console.error("Error fetching average ratings:", err);
            return res.status(500).json({ message: "Error getting average ratings" });
        }
        return res.status(200).json(result);
    });
};