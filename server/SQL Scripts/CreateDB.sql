-- create_db.sql
-- Bookmatcha Database

CREATE DATABASE IF NOT EXISTS Bookmatcha;
USE Bookmatcha;

-- --------------------------------------------------------
-- Table: books
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
    book_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) DEFAULT NULL,
    author VARCHAR(255) DEFAULT NULL,
    image_link TEXT DEFAULT NULL,
    genre VARCHAR(100) DEFAULT NULL,
    sub_genre VARCHAR(100) DEFAULT NULL,
    average_rating DECIMAL(2,1) DEFAULT NULL,
    PRIMARY KEY (book_id),
    UNIQUE KEY BookID (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT(11) NOT NULL AUTO_INCREMENT,
    user_name varchar(20) DEFAULT NOT NULL UNIQUE,
    first_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    profile_pic TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,
    reset_token VARCHAR(64) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY Email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: reviews
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    BookReviewID INT(11) NOT NULL AUTO_INCREMENT,
    book_id VARCHAR(50) NOT NULL,
    user_id INT(11) DEFAULT NULL,
    written_review TEXT DEFAULT NULL,
    rating DECIMAL(2,1) DEFAULT NULL,
    likes INT(11) DEFAULT 0,
    dislikes INT(11) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,
    spoiler_flag TINYINT(1) DEFAULT 0,
    PRIMARY KEY (BookReviewID),
    UNIQUE KEY UniqueReview (book_id, user_id),
    KEY fk_reviews_user (user_id),
    CONSTRAINT fk_reviews_book FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
