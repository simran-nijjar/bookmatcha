import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
var config = require('../config');

// This file contains the book recommendations page which recommends user books based on what they have in their library

// Number of results per page
const maxResults = 20;

export const BookRecommendations = () => {
    const [usersBooks, setUsersBooks] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));

        if (savedUser) {
            fetchUsersBooks(savedUser.email);
        }
    }, []);

    useEffect(() => {
        if (usersBooks.length > 0) {
            getRecommendations();
        }
    }, [usersBooks, currentPage]);

    const fetchUsersBooks = async (reviewerID) => {
        try {
            const response = await axios.get(`${config.API_URL}fetchusersbooks`, {
                params: { ReviewerID: reviewerID }
            });
            setUsersBooks(response.data);
        } catch (error) {
            console.log("Error fetching user's books: ", error.response);
            setError('Error fetching user books.');
        }
    };

    const extractAuthors = () => {
        const authors = new Set();
        const savedBookIDs = new Set();

        usersBooks.forEach(book => {
            if (book.Author) {
                authors.add(book.Author.trim());
            }
            savedBookIDs.add(book.BookID);
        });

        return { authors: Array.from(authors), savedBookIDs: Array.from(savedBookIDs) };
    };

    const getRecommendations = async () => {
        try {
            const { authors, savedBookIDs } = extractAuthors();
            const googleBooks = await fetchBooksFromGoogle(authors, (currentPage - 1) * maxResults);

            const filteredBooks = googleBooks
                .filter(book => !savedBookIDs.includes(book.id))
                .map(book => ({
                    BookID: book.id,
                    Title: book.volumeInfo.title,
                    Author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
                    Genre: book.volumeInfo.categories ? book.volumeInfo.categories.join(', ') : 'Unknown'
                }));

            setRecommendedBooks(filteredBooks);
        } catch (error) {
            console.error('Error in recommendation logic:', error);
            setError('Error fetching recommendations.');
        }
    };

    const fetchBooksFromGoogle = async (authors, startIndex = 0) => {
        const authorQuery = authors.map(author => `inauthor:${author}`).join(' OR ');
        const query = `${authorQuery}`;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&key=${config.API_KEY}&maxResults=${maxResults}`;

        try {
            const response = await fetch(url);
            const result = await response.json();
            return result.items;
        } catch (error) {
            console.error('Error fetching books from Google Books API:', error);
            return [];
        }
    };

    const handleNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <div>
            <h1>Book Recommendations</h1>
            {error ? (
                <p>{error}</p>
            ) : recommendedBooks.length === 0 ? (
                <p>Add more books to your library to get book recommendations.</p>
            ) : (
                <div>
                    <p>Here are some recommendations based off of what is in your library.</p>
                    <h3>Your Recommended Books</h3>
                    <table className="table table-light table-striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Genre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recommendedBooks.map((book) => (
                                <tr key={book.BookID}>
                                    <td>
                                        <Link to={`/book/${book.BookID}`}>
                                            {book.Title}
                                        </Link>
                                    </td>
                                    <td>{book.Author}</td>
                                    <td>{book.Genre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                        <button onClick={handleNextPage}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
