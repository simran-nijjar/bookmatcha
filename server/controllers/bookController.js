const connection = require('../config/db');

// Insert book
exports.insertBook = (req, res) => {
    const { Name, BookID, Author, ImageLink, Genre, SubGenre } = req.body;
    const query = 'INSERT INTO Book (Name, BookID, Author, ImageLink, Genre, Sub_Genre) VALUES (?, ?, ?, ?, ?, ?)';

    const values = [Name, BookID, Author, ImageLink, Genre, SubGenre];
    connection.query(query, values, async(err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(204).json({ message: "Book already exists in the database"});
            } else {
                return res.status(500).json({ message: "Error inserting book"});
            }
        }
        return res.status(201).json({ message: "Book inserted successfully"});
    });
};

// Get user's reviewed books with a rating of 3 or greater
exports.fetchUsersHighlyRatedBooks = (req, res) => {
    const ReviewerID = req.query.ReviewerID;
    if (!ReviewerID) {
        return res.status(400).json({ message: "ReviewerID is missing"});
    }

    const query = `SELECT Book.BookID, Book.Name, Book.Author, BookReview.RATING FROM BOOK
                   INNER JOIN BookReview ON BookReview.BookID = Book.BookID
                   WHERE BookReview.ReviewerID=? AND BookReview.RATING >= 3`;

    connection.query(query, [ReviewerID], async(err, result) => {
        if (err) {
            return res.status(500).json({message: "Error fetching books"});
        }
        return res.status(200).send(result);
    });
};

// Get recommended books for user
exports.getRecommendedBooks = (req, res) => {
    const ReviewerID = req.query.ReviewerID;
    if (!ReviewerID) {
        return res.status(400).json({ message: "ReviewerID is missing"});
    }

    const query = `SELECT DISTINCT b.BookID, b.Name, b.Author, br.RATING
                   FROM Book b
                   INNER JOIN BookReview br ON b.BookID = br.BookID
                   WHERE br.RATING >= 3
                   AND br.ReviewerID !=?`;

    connection.query(query, [ReviewerID], async(err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting recommended books"});
        }
        return res.status(200).send(result);
    });
};

// Get top rated books
exports.getTopRatedBooks = async (req, res) => {
    const query = `SELECT 
                    Book.BookID,
                    Book.Name,
                    Book.Author,
                    Book.ImageLink,
                    AVG(BookReview.RATING) AS AvgRating
                    FROM Book
                    INNER JOIN BookReview ON BookReview.BookID = Book.BookID
                    GROUP BY Book.BookID
                    HAVING AVG(BookReview.RATING) >= 4
                    ORDER BY AvgRating DESC
                    LIMIT 5`
                ;
    
    connection.query(query, async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching top rated books"});
        }
        return res.status(200).send(result);
    })
}

// Get average rating for given BookID(s)
exports.getAverageRating = (req, res) => {
    const bookIDs = req.query.BookIDs.split(",");

    if (bookIDs.length == 0) {
        return res.status(400).json({ message: "BookID(s) is required"});
    }

    const query = 'SELECT BookID, AVG(RATING) AS averageRating FROM BookReview WHERE BookID IN (?) GROUP BY BookID';
    connection.query(query, [bookIDs], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error getting average rating"});
        }
        return res.status(200).send(result);
    });
};
