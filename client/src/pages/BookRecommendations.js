import React, { useState, useEffect } from 'react';
import '../styles.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

// This file contains the book recommendations page which recommends user books based on what they have in their library
const maxResults = 20;

export const BookRecommendations = () => {
  const [usersBooks, setUsersBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [averageRatings, setAverageRatings] = useState({});
  const navigate = useNavigate();

  // Fetch user's books from backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId;
      } catch {}
    }

    if (userId) {
      fetchUsersBooks(userId);
    }
  }, []);

  useEffect(() => {
    if (usersBooks.length > 0) {
      getRecommendations();
    }
  }, [usersBooks, currentPage]);

  const fetchUsersBooks = async (userId) => {
    try {
      const response = await api.get('books/users', { params: { userId } });
      setUsersBooks(response.data);
    } catch {
      setError('Error fetching user books.');
    }
  };

  // Extract authors and saved book IDs from user's library
  const extractAuthors = () => {
    const authors = new Set();
    const savedBookIds = new Set();

    usersBooks.forEach(book => {
      if (book.Author) {
        authors.add(book.Author.trim());
      }
      savedBookIds.add(book.bookId);
    });

    return { authors: Array.from(authors), savedBookIds: Array.from(savedBookIds) };
  };

  // Fetch recommended books from Google Books
  const getRecommendations = async () => {
    try {
      const { authors, savedBookIds } = extractAuthors();
      const startIndex = (currentPage - 1) * maxResults;
      const googleBooks = await fetchBooksFromGoogle(authors, startIndex);

      const filteredBooks = googleBooks
        .filter(book => !savedBookIds.includes(book.id))
        .map(book => ({
          book_id: book.id,
          title: book.volumeInfo.title || 'Untitled',
          author: book.volumeInfo.authors?.join(', ') || 'Unknown',
          image_link: book.volumeInfo.imageLinks?.smallThumbnail || ''
        }));

      const bookIDs = filteredBooks.map(book => book.book_id);
      await fetchAverageRatings(bookIDs);

      setRecommendedBooks(filteredBooks);
    } catch {
      setError('Error fetching recommendations.');
    }
  };

  const fetchBooksFromGoogle = async (authors, startIndex = 0) => {
    const authorQuery = authors.map(author => `inauthor:${author}`).join(' OR ');
    if (!authorQuery) return [];
    try {
      const res = await api.get('google-books/search', { params: { query: authorQuery, startIndex } });
      return res.data.items || [];
    } catch {
      return [];
    }
  };

  const fetchAverageRatings = async (bookIds) => {
    if (!bookIds || bookIds.length === 0){
      return [];
    }

    try {
      const response = await api.get('books/average-rating', { params: { bookIds: bookIds.join(',') } });
      const ratingsMap = response.data.reduce((acc, item) => {
        acc[item.book_id] = item.average_rating;
        return acc;
      }, {});
      setAverageRatings(ratingsMap);
    } catch {
      setError('Error fetching average ratings.');
    }
  };

  const insertBook = async (book) => {
    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId;
      } catch {}
    }
    if (!userId) return;

    try {
      const bookDetails = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.book_id}`);
      const response = await api.post('books/insertbook', {
        title: book.title,
        bookId: book.book_id,
        author: book.author || 'Unknown',
        imageLink: book.image_link || '',
        genre: bookDetails.data.volumeInfo?.categories?.[0]
          ? bookDetails.data.volumeInfo.categories[0].split('/')[1] || 'Unknown'
          : 'Unknown',
        subGenre: bookDetails.data.volumeInfo?.categories?.[0]
          ? bookDetails.data.volumeInfo.categories
              .map(c => c.split('/')[2])
              .filter(Boolean)
              .join(',') || 'Unknown'
          : 'Unknown',
        userId
      });

      if (response.status === 200 || response.status === 201) {
        navigate(`/book/${book.book_id}`, { state: { book } });
      }
    } catch (error) {
      console.error('Error inserting book:', error);
    }
  };

  const handleNextPage = () => setCurrentPage(prev => prev + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

  return (
    <div className="page-container">
      <h1 className="title">Book Recommendations</h1>

      {error ? (
        <p className="subtitle">{error}</p>
      ) : recommendedBooks.length === 0 ? (
        <p className="empty-message">
          Search and add more books to your library to get recommendations.
        </p>
      ) : (
        <>
          <p className="subtitle">Here are some books we've matcha-ed for you.</p>

          <div className="recommendations-grid">
            {recommendedBooks.map(book => (
              <div key={book.book_id} className="book-card">

                {book.image_link ? (
                  <img
                    src={book.image_link}
                    alt={`${book.title} cover`}
                    className="book-cover"
                  />
                ) : (
                  <div className="book-cover" />
                )}

                <div className="book-content">
                  <div>
                    <div
                      className="book-title"
                      onClick={() => insertBook(book)}
                    >
                      {book.title}
                    </div>

                    <div className="book-author">
                      {book.author}
                    </div>

                    <div className="rating-badge">
                      Average Rating: {averageRatings[book.book_id] || 'No ratings'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              className="theme-custom"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="theme-custom"
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};