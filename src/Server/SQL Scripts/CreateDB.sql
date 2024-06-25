CREATE DATABASE MyLibraryApp;
USE MyLibraryApp;

CREATE TABLE User (
    Name CHAR(50) NOT NULL,
    Email CHAR(320) NOT NULL,
    Password CHAR(50) NOT NULL,
    PRIMARY KEY (Email)
);

CREATE TABLE Book (
    Name CHAR (100) NOT NULL,
    BookID CHAR (50) NOT NULL,
    Author CHAR (100) NOT NULL,
    PRIMARY KEY (BookID)
);