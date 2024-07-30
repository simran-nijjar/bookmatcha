import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
var config = require('../config');

// This file contains the details of the book results that the user searches for

export function BookResults({ results, onNextPage, onPrevPage, currentPage }) {
  const navigate = useNavigate();

  // When a book is selected, it will be inserted into the backend if it's not already inserted 
  const insertBook = async (book) => {
    try {
      const response = await axios.post(`${config.API_URL}insertbook`, {
        Name: book.volumeInfo.title,
        BookID: book.id,
        Author: book.volumeInfo.authors?.join(', ')
      });
      
      // Successful book insertion will navigate to the book details page
      if (response.status === 200) {
        console.log('Book inserted successfully or already exists in the database');
        navigate(`/book/${book.id}`, { state: { book } });
      }
    } catch (error) {
      console.error('Error inserting book:', error);
    }
  };

  return (
    <div>
      <h1>Book Results</h1>
      {results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <>
        {/* Display book thumbnail, title, and author */}
          <ul>
            {results.map((book, index) => (
              <li key={index} style={{ listStyleType: 'none', margin: '20px 0', border: '1px solid' }}>
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
                )}
                <div>
                  <button onClick={() => insertBook(book)}>
                    <strong>{book.volumeInfo.title}</strong>
                  </button>
                  <p><strong>By:</strong> {book.volumeInfo.authors?.join(', ')}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Previous and next page buttons */}
          <div>
            <button onClick={onPrevPage} disabled={currentPage === 1}>Previous</button>
            <button onClick={onNextPage}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
