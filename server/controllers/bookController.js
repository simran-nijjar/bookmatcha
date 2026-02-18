const connection = require('../config/db');

// Insert a book into the database
exports.insertBook = (req, res) => {
    const { title, bookId, author, imageLink, genre, subGenre } = req.body;

    // Validate required fields
    if (!title || !bookId || !author) {
        return res.status(400).json({ message: "Title, BookID, and Author are required" });
    }

    const query = 'INSERT INTO books (name, book_id, author, image_link, genre, sub_genre) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [title, bookId, author, imageLink, genre, subGenre];

    connection.query(query, values, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                // do nothing
            } else {
                return res.status(500).json({ message: "Error inserting book" });
            }
        }
        return res.status(201).json({ message: "Book inserted successfully" });
    });
};

// Fetch books a user has rated 3 or higher
exports.fetchUsersHighlyRatedBooks = (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    const query = `
        SELECT b.book_id AS BookID, b.name AS Title, b.author AS Author, r.rating AS Rating
        FROM books b
        INNER JOIN reviews r ON r.book_id = b.book_id
        WHERE r.user_id = ? AND r.rating >= 3
    `;

    connection.query(query, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching user's books" });
        }
        return res.status(200).json(result);
    });
};

// Fetch recommended books for the user (books rated 3+ by others)
exports.getRecommendedBooks = (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    const query = `
        SELECT DISTINCT b.book_id AS BookID, b.name AS Title, b.author AS Author, r.rating AS Rating
        FROM books b
        INNER JOIN reviews r ON r.book_id = b.book_id
        WHERE r.rating >= 3 AND r.user_id != ?
    `;

    connection.query(query, [userId], (err, result) => {
        if (err) {
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
            AVG(r.rating) AS AverageRating,
            COUNT(r.rating) AS RatingCount
        FROM books b
        INNER JOIN reviews r ON r.book_id = b.book_id
        GROUP BY b.book_id
        HAVING AVG(r.rating) >= 3
        ORDER BY AverageRating DESC, RatingCount DESC
        LIMIT 9
    `;

    connection.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching top rated books" });
        }
        return res.status(200).json(result);
    });
};

// Get average rating for a list of BookIDs
exports.getAverageRating = (req, res) => {
    const { bookIds } = req.query;

    if (!bookIds) {
        return res.status(400).json({ message: "BookIDs are required" });
    }

    const bookIdsArray = bookIds.split(",");

    if (bookIdsArray.length === 0) {
        return res.status(400).json({ message: "BookIDs are required" });
    }

    const query = `
        SELECT book_id AS BookID, AVG(rating) AS AverageRating
        FROM reviews
        WHERE book_id IN (?)
        GROUP BY book_id
    `;

    connection.query(query, [bookIdsArray], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting average ratings" });
        }
        return res.status(200).json(result);
    });
};