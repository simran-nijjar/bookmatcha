import { useState, useEffect } from 'react';
import '../styles.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

// This file contains the book recommendations page which recommends user books based on what they have in their library

// Number of results per page
const maxResults = 20;

export const BookRecommendations = () => {
  const [usersBooks, setUsersBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId;
      } catch {}
    }

    if (userId) {
      fetchUsersBooks(userId);
    }
  }, []);

  useEffect(() => {
    if (usersBooks.length > 0) {
      getRecommendations();
    }
  }, [usersBooks, currentPage]);

  // Fetch books that the user has reviewed and rated
  const fetchUsersBooks = async (userId) => {
    try {
      const response = await api.get('books/users', { params: { userId } });
      setUsersBooks(response.data);
    } catch (error) {
      setError('Error fetching user books.');
    }
  };

  // Extract authors and saved book IDs from user's books
  const extractAuthors = () => {
    const authors = new Set();
    const savedBookIds = new Set();

    usersBooks.forEach(book => {
      if (book.Author) {
        authors.add(book.Author.trim());
      }
      savedBookIds.add(book.bookId);
    });

    return { authors: Array.from(authors), savedBookIds: Array.from(savedBookIds) };
  };

  // Get recommendations from Google Books
  const getRecommendations = async () => {
    try {
      const { authors, savedBookIds } = extractAuthors();
      const startIndex = (currentPage - 1) * maxResults;
      const googleBooks = await fetchBooksFromGoogle(authors, startIndex);

      const filteredBooks = googleBooks
        .filter(book => !savedBookIds.includes(book.id))
        .map(book => ({
          book_id: book.id,
          title: book.volumeInfo.title || 'Untitled',
          author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
          image_link: book.volumeInfo.imageLinks?.smallThumbnail || ''
        }));

      const bookIDs = filteredBooks.map(book => book.book_id);
      const averageRatings = await fetchAverageRatings(bookIDs);

      const recommendedBooksWithRatings = filteredBooks.map(book => {
        const rating = averageRatings.find(r => r.book_id === book.book_id);
        return { ...book, average_rating: rating?.average_rating || 'No rating' };
      });

      setRecommendedBooks(recommendedBooksWithRatings);
    } catch (error) {
      setError('Error fetching recommendations.');
    }
  };

  // Fetch books from Google Books API via backend proxy
  const fetchBooksFromGoogle = async (authors, startIndex = 0) => {
    const authorQuery = authors.map(author => `inauthor:${author}`).join(' OR ');
    if (!authorQuery) {
      return [];
    }
    try {
      const res = await api.get('google-books/search', { params: { query: authorQuery, startIndex } });
      return res.data.items || [];
    } catch {
      return [];
    }
  };

  const handleNextPage = () => setCurrentPage(prev => prev + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

  // Fetch average ratings from backend
  const fetchAverageRatings = async (bookIds) => {
    if (!bookIds || bookIds.length === 0){
      return [];
    }

    try {
      const response = await api.get('books/average-rating', { params: { bookIds: bookIds.join(',') } });
      return response.data;
    } catch {
      setError('Error fetching average ratings.');
      return [];
    }
  };

  const insertBook = async (book) => {
    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId;
      } catch {}
    }

    if (!userId) {
      return;
    }

    try {
      const bookDetails = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.book_id}`);
      await api.post('books/insertbook', {
        title: book.title,
        bookId: book.book_id,
        author: book.author || 'Unknown',
        imageLink: book.image_link || '',
        genre: bookDetails.data.volumeInfo?.categories?.[0]
          ? bookDetails.data.volumeInfo.categories[0].split('/')[1] || 'Unknown'
          : 'Unknown',
        subGenre: bookDetails.data.volumeInfo?.categories?.[0]
          ? bookDetails.data.volumeInfo.categories
              .map(category => category.split('/')[2])
              .filter(Boolean)
              .join(',') || 'Unknown'
          : 'Unknown',
        userId
      });

      navigate(`/book/${book.book_id}`, { state: { book } });
    } catch (error) {
      console.error('Error inserting book:', error);
    }
  };

  return (
    <div>
      <h1 className="title">Book Recommendations</h1>
      {error ? (
        <p className="subtitle">{error}</p>
      ) : recommendedBooks.length === 0 ? (
        <p className="subtitle">Search and add more books to your library to get book recommendations.</p>
      ) : (
        <div>
          <p className="subtitle">Here are some books we've matcha-ed for you.</p>
          <table className="table table-striped table-custom">
            <thead className="text-custom">
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Author</th>
                <th>Average Rating</th>
              </tr>
            </thead>
            <tbody className="text-custom">
              {recommendedBooks.map(book => (
                <tr key={book.book_id}>
                  <td>
                    {book.image_link ? (
                      <img
                        src={book.image_link}
                        alt={`${book.title} cover`}
                        style={{ maxWidth: '100px', maxHeight: '150px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="text-custom">No Image Available</div>
                    )}
                  </td>
                  <td>
                    <button
                      className="link-custom"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      onClick={() => insertBook(book)}
                    >
                      {book.title}
                    </button>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.average_rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button className="btn theme-custom" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
            <button className="btn theme-custom" onClick={handleNextPage}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
};