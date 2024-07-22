import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
var config = require('../config');


export function BookResults({ results, onNextPage, onPrevPage, currentPage }) {
  const navigate = useNavigate();

  const insertBook = async (book) => {
    try {
      const response = await axios.post(`${config.API_URL}insertbook`, {
        Name: book.volumeInfo.title,
        BookID: book.id,
        Author: book.volumeInfo.authors?.join(', ')
      });

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
          <div>
            <button onClick={onPrevPage} disabled={currentPage === 1}>Previous</button>
            <button onClick={onNextPage}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
