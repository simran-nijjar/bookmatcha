import React, { useState, useEffect } from 'react';
import '../styles.css'
import axios from 'axios';
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
    const token = localStorage.getItem('token');
    let userId = ''
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId;
      } catch {}
    }
    if (!userId){
      return;
    }
    try {
      const bookDetails = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.id}`);
      const response = await api.post('books/insertbook', {
        title: book.volumeInfo.title,
        bookId: book.id,
        author: book.volumeInfo.authors?.join(', ') || 'Unknown',
        imageLink: book.volumeInfo.imageLinks?.thumbnail || '',
        genre: bookDetails.data.volumeInfo?.categories?.[0]
          ? bookDetails.data.volumeInfo.categories[0].split('/')[1] || 'Unknown'
          : 'Unknown',
        subGenre: bookDetails.data.volumeInfo?.categories?.[0]
          ? bookDetails.data.volumeInfo.categories
              .map(category => category.split('/')[2])
              .filter(Boolean)
              .join(',') || 'Unknown'
          : 'Unknown',
        userId: userId
      });
      
      // Successful book insertion will navigate to the book details page
      if (response.status === 200 || response.status === 201) {
        navigate(`/book/${book.id}`, { state: { book } });
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
              <div key={index} className="book-card">

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
                    <div
                      className="book-title"
                      onClick={() => insertBook(book)}
                    >
                      {book.volumeInfo.title}
                    </div>
                    <div className="book-author">
                      By: {book.volumeInfo.authors?.join(', ') || 'Unknown'}
                    </div>
                    <div>
                      <span><StarRating rating={averageRatings[book.id] || 0} readOnly /></span>
                    <div>
                      {Number(averageRatings[book.id] || 0) > 0 ? Number(averageRatings[book.id]).toFixed(2) + '/5' : 'No ratings'}
                    </div></div>
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