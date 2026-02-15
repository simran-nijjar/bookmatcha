import React, { useState, useEffect } from 'react';
import '../styles.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!savedUser?.userId){
      return;
    }
    try {
      const bookDetails = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.id}`);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}books/insertbook`, {
        title: book.volumeInfo.title,
        bookId: book.id,
        author: book.volumeInfo.authors?.join(', ') || 'Unknown',
        imageLink: book.volumeInfo.imageLinks?.smallThumbnail || '',
        genre: bookDetails.data.volumeInfo?.categories?.[0]
          ? bookDetails.data.volumeInfo.categories[0].split('/')[1] || 'Unknown'
          : 'Unknown',
        subGenre: bookDetails.data.volumeInfo?.categories?.[0]
          ? bookDetails.data.volumeInfo.categories
              .map(category => category.split('/')[2])
              .filter(Boolean)
              .join(',') || 'Unknown'
          : 'Unknown',
        userId: savedUser.userId
      });
      
      // Successful book insertion will navigate to the book details page
      if (response.status === 200 || response.status === 201) {
        navigate(`/book/${book.id}`, { state: { book } });
      }
    } catch { }
  };

  const fetchAverageRatings = async (bookIds) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}books/average-rating`, {
        params: { bookIds: bookIds.join(",") }
      });
      const ratings = response.data.reduce((acc, item) => {
        acc[item.book_id] = item.average_rating;
        return acc;
      }, {});
      setAverageRatings(ratings);
    } catch { }
  };

  return (
    <div>
      <h1 className="title">Search Results</h1>
      {results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <>
          {/* Display book thumbnail, title, and author */}
          <div style={{ justifyContent: 'center', display: 'flex' }}>
            <ul style={{ maxWidth: '600px', justifyContent: 'center' }}>
              {results.map((book, index) => (
                <li key={index} style={{ listStyleType: 'none', margin: '20px 0', border: '2px solid', borderRadius: '8px', display: 'flex', gap: '10px' }}>
                  {book.volumeInfo.imageLinks?.thumbnail && (
                    <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
                  )}
                  <div>
                    <br />
                    <button className="btn theme-custom" onClick={() => insertBook(book)}>
                      <strong>{book.volumeInfo.title}</strong>
                    </button>
                    <p><strong>By:</strong> {book.volumeInfo.authors?.join(', ') || 'Unknown'}</p>
                    <p><strong>Average Rating:</strong> {averageRatings[book.id] || 'No ratings'}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Previous and next page buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button className="btn theme-custom" onClick={onPrevPage} disabled={currentPage === 1}>Previous</button>
            <button className="btn theme-custom" onClick={onNextPage}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}