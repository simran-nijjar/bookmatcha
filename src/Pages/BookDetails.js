import React from 'react';
import { useLocation } from 'react-router-dom';

export function BookDetails() {
  const location = useLocation();
  const book = location.state?.book;

  if (!book) {
    return <p>Book not found or data is not available...</p>;
  }

  return (
    <div>
      <h1>Book Details</h1>
      {book.volumeInfo.imageLinks?.thumbnail && (
        <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
      )}
      <p><strong>{book.volumeInfo.title}</strong></p>
      <p><strong>By:</strong> {book.volumeInfo.authors?.join(', ')}</p>
      <p><strong>Description:</strong> {book.volumeInfo.description}</p>
    </div>
  );
}
