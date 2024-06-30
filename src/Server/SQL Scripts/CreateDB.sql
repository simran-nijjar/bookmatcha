CREATE DATABASE MyLibraryApp;
USE MyLibraryApp;

CREATE TABLE MyLibraryAppUser(
    FirstName CHAR(50) NOT NULL,
    LastName CHAR(50) NOT NULL,
    Email CHAR(255) NOT NULL UNIQUE,
    Password CHAR(100) NOT NULL,
    PRIMARY KEY (Email)
);

CREATE TABLE Book (
    Name CHAR(100) NOT NULL,
    BookID CHAR(50) NOT NULL UNIQUE,
    Author CHAR(100) NOT NULL,
    PRIMARY KEY (BookID)
);

CREATE TABLE BookReview (
    BookReviewID INT NOT NULL AUTO_INCREMENT UNIQUE,
    BookID CHAR(50) NOT NULL UNIQUE,
    WrittenReview TEXT (500),
    RATING INT NOT NULL,
    ReviewerID CHAR(255) NOT NULL UNIQUE,
    ReviewerName CHAR(50) NOT NULL,
    PRIMARY KEY (BookReviewID),
    FOREIGN KEY (BookID) REFERENCES Book(BookID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ReviewerID) REFERENCES MyLibraryAppUser(Email) ON UPDATE CASCADE ON DELETE CASCADE
);