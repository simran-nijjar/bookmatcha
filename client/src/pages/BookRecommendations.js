import React, { useState, useEffect, useCallback } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import StarRating from '../components/StarRating';

// This file contains the book recommendations page which recommends user books based on what they have in their library
const maxResults = 20;

export const BookRecommendations = () => {
  const [usersBooks, setUsersBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [averageRatings, setAverageRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user's books from backend
  useEffect(() => {
    fetchUsersBooks();
  }, []);

  useEffect(() => {
    if (usersBooks.length > 0) {
      getRecommendations();
    }
  }, [usersBooks, currentPage]);

  const fetchUsersBooks = async () => {
    try {
      const response = await api.get('books/users');
      setUsersBooks(response.data);
    } catch {
      setError('Error fetching user books.');
    }
  };

  // Extract authors and saved book IDs from user's library
  // Get the highest rated book for each author and then sort the authors set from highest to lowest rating
  const extractAuthors = () => {
    const authorRatings = {};
    const savedBookIds = new Set();

    usersBooks.forEach(book => {
        savedBookIds.add(book.bookId);
        if (book.Author) {
            const author = book.Author.trim();
            if (!authorRatings[author] || book.Rating > authorRatings[author]) {
                authorRatings[author] = book.Rating;
            }
        }
    });

    // Sort authors by their highest rated book
    const authors = Object.entries(authorRatings)
        .sort((a, b) => b[1] - a[1])
        .map(([author]) => author);
    return { authors, savedBookIds: Array.from(savedBookIds) };
  };

  // Fetch recommended books from Google Books
  const getRecommendations = useCallback (async () => {
    setLoading(true);
    try {
      const { authors, savedBookIds } = extractAuthors();
      const topAuthors = authors.slice(0, 5);
      const startIndex = (currentPage - 1) * maxResults;
      const googleBooks = await fetchBooksFromGoogle(topAuthors, startIndex);

      const filteredBooks = googleBooks
      .filter(book => !savedBookIds.includes(book.id))
      .slice(0, 30)
      .map(book => ({
          book_id: book.id,
          title: book.volumeInfo.title || 'Untitled',
          author: book.volumeInfo.authors?.join(', ') || 'Unknown',
          image_link: book.volumeInfo.imageLinks?.smallThumbnail || '',
          isbn: book.volumeInfo.industryIdentifiers?.find(
              id => id.type === 'ISBN_13'
          )?.identifier || book.volumeInfo.industryIdentifiers?.find(
              id => id.type === 'ISBN_10'
          )?.identifier || null
      }));

      const bookIDs = filteredBooks.map(book => book.book_id);
      await fetchAverageRatings(bookIDs);

      setRecommendedBooks(filteredBooks);
    } catch {
      setError('Error fetching recommendations.');
    } finally {
      setLoading(false);
    }
  }, [usersBooks, currentPage]);

   const fetchBooksFromGoogle = async (authors, startIndex = 0) => {
    if (!authors || authors.length === 0) {
      return [];
    }

    const results = await Promise.allSettled(
      authors.map(author => api.get('google-books/search', { params: { query: author, startIndex }}))
    );

    const allResults = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.data.items) {
        allResults.push(...result.value.data.items);
      }
    });

    // Remove duplicates
    const seen = new Set();
    const uniqueResults = allResults.filter(book => {
      if (seen.has(book.id)) return false;
      seen.add(book.id);
      return true;
    });
    return uniqueResults;
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
    try {
     const response = await api.post('books/insertbook', {
            title: book.title,
            bookId: book.book_id,
            author: book.author || 'Unknown',
            imageLink: book.image_link || '',
            isbn: book.isbn || null
        });

      if (response.status === 200 || response.status === 201) {
        navigate(`/books/${book.book_id}`, { state: { book } });
      }
    } catch { }
  };

  const handleNextPage = () => setCurrentPage(prev => prev + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

  return (
    <div className="page-container">
      <h1 className="title">Book Recommendations</h1>

      {error ? (
        <p className="subtitle">{error}</p>
      ) : loading? (
          <div className="loading-container">
                <div className="loading-spinner" />
                <p className="subtitle">Finding your recommendations...</p>
            </div>
      ) : recommendedBooks.length === 0 ? (
        <p className="empty-message">
          Search and add more books to your library to get recommendations.
        </p>
      ) : (
        <>
          <p className="subtitle">Here are some books we've matcha-ed for you.</p>

          <div className="recommendations-grid">
            {recommendedBooks.map(book => (
              <div key={book.book_id} className="book-card" onClick={() => insertBook(book)} style={{ cursor: 'pointer'}}>

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
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{book.author}</div>
                    <div><span><StarRating rating={averageRatings[book.book_id] || 0} readOnly /></span></div>
                    <div> { averageRatings[book.bookId] >= 0 ? averageRatings[book.book_id] + '/5' : 'No ratings'}</div>
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