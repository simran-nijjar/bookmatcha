import React from 'react';

export function BookResults({ results }) {
  return (
    <div>
      <h1>Book Results</h1>
      {results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <ul>
          {results.map((book, index) => (
            <li key={index}>
              {book.volumeInfo.title} by {book.volumeInfo.authors && book.volumeInfo.authors.join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
