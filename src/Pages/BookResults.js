import React, { useState, useEffect } from 'react';
import '../styles.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
var config = require('../config');

// This file contains the details of the book results that the user searches for

export function BookResults({ results, onNextPage, onPrevPage, currentPage }) {
  const navigate = useNavigate();
  const [averageRatings, setAverageRatings] = useState({});

  useEffect(() => {
    const bookIDs = results.map(book => book.id);
    fetchAverageRatings(bookIDs);
  }, [results]);

  // When a book is selected, it will be inserted into the backend if it's not already inserted 
  const insertBook = async (book) => {
    try {
      const response = await axios.post(`${config.API_URL}insertbook`, {
        Name: book.volumeInfo.title,
        BookID: book.id,
        Author: book.volumeInfo.authors?.join(', '),
        ImageLink: book.volumeInfo.imageLinks.smallThumbnail,
        Categories: book.categories
      });
      
      // Successful book insertion will navigate to the book details page
      if (response.status === 200) {
        navigate(`/book/${book.id}`, { state: { book } });
      }
    } catch (error) {
      console.error('Error inserting book:', error);
    }
  };

  const fetchAverageRatings = async (bookIDs) => {
    try {
      const response = await axios.get(`${config.API_URL}fetchaverageratings`, {
        params: {BookIDs: bookIDs.join(",")}
      });
      const ratings = response.data.reduce((acc, item) => {
      acc[item.BookID] = item.averageRating;
      return acc;
    }, {});
    setAverageRatings(ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  return (
    <div>
      <h1 className="title">Search Results</h1>
      {results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <>
        {/* Display book thumbnail, title, and author */}
          <ul>
            {results.map((book, index) => (
              <li key={index} style={{ listStyleType: 'none', margin: '20px 0', border: '1px solid', display: 'flex', gap: '10px' }}>
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
                )}
                <div>
                  <button className="btn theme-custom" onClick={() => insertBook(book)}>
                    <strong>{book.volumeInfo.title}</strong>
                  </button>
                  <p><strong>By:</strong> {book.volumeInfo.authors?.join(', ')}</p>
                  <p><strong>Average Rating:</strong> {averageRatings[book.id] || 'No ratings'}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Previous and next page buttons */}
          <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
            <button className="btn theme-custom" onClick={() =>onPrevPage} disabled={currentPage === 1}>Previous</button>
            <button className="btn theme-custom" onClick={onNextPage}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
