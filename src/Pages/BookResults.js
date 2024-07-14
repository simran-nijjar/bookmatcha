import React from 'react';

export function BookResults({ results, onNextPage, onPrevPage, currentPage }) {
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
                  <strong>{book.volumeInfo.title}</strong>
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
