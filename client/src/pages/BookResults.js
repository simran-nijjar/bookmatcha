import React, { useState, useEffect } from 'react';
import '../styles.css'
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import StarRating from '../components/StarRating';

// This file contains the details of the book results that the user searches for

export function BookResults({ results, onNextPage, onPrevPage, currentPage }) {
  const navigate = useNavigate();
  const [averageRatings, setAverageRatings] = useState({});

  useEffect(() => {
    const bookIds = results.map(book => book.id);
    fetchAverageRatings(bookIds);
  }, [results]);

  // When a book is selected, it will be inserted into the backend if it's not already inserted
  const insertBook = async (book) => {
    try {
      const isbn = book.volumeInfo.industryIdentifiers?.find(
            id => id.type === 'ISBN_13'
        )?.identifier || book.volumeInfo.industryIdentifiers?.find(
            id => id.type === 'ISBN_10'
        )?.identifier || null;

        const response = await api.post('books/insertbook', {
            title: book.volumeInfo.title,
            bookId: book.id,
            author: book.volumeInfo.authors?.join(', ') || 'Unknown',
            imageLink: book.volumeInfo.imageLinks?.thumbnail || '',
            isbn,
            genre: book.volumeInfo.categories?.[0]
              ? book.volumeInfo.categories[0].split('/')[1]?.trim() || 'Unknown'
              : 'Unknown',
            subGenre: book.volumeInfo.categories?.[0]
              ? book.volumeInfo.categories
                  .map(c => c.split('/')[2]?.trim())
                  .filter(Boolean)
                  .join(',') || 'Unknown'
            : 'Unknown'
        });
      // Successful book insertion will navigate to the book details page
      if (response.status === 200 || response.status === 201) {
        navigate(`/books/${book.id}`, { state: { book } });
      }
    } catch { }
  };

  const fetchAverageRatings = async (bookIds) => {
    try {
      const response = await api.get('books/average-rating', {
        params: { bookIds: bookIds.join(",") }
      });
      const ratings = response.data.reduce((acc, item) => {
        acc[item.BookID] = item.AverageRating;
        return acc;
      }, {});
      setAverageRatings(ratings);
    } catch { }
  };

  return (
    <div className="page-container">
      <h1 className="title">Search Results</h1>
      {results.length === 0 ? (
        <p className="empty-message">No results found</p>
      ) : (
        <>
          {/* Display book thumbnail, title, and author */}
          <div className="recommendations-grid">
            {results.map((book, index) => (
              <div key={index} className="book-card" onClick={() => insertBook(book)} style={{ cursor: 'pointer'}}>

                {book.volumeInfo.imageLinks?.thumbnail ? (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail}
                    alt={book.volumeInfo.title}
                    className="book-cover"
                  />
                ) : (
                  <div className="book-cover" />
                )}

                <div className="book-content">
                  <div>
                    <div className="book-title">{book.volumeInfo.title}</div>
                    <div className="book-author">By: {book.volumeInfo.authors?.join(', ') || 'Unknown'}</div>
                    <div><span><StarRating rating={averageRatings[book.id] || 0} readOnly /></span>
                      <div>{Number(averageRatings[book.id] || 0) > 0 ? Number(averageRatings[book.id]).toFixed(2) + '/5' : 'No ratings'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Previous and next page buttons */}
          <div className="pagination">
            <button
              className="theme-custom"
              onClick={onPrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="theme-custom"
              onClick={onNextPage}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}