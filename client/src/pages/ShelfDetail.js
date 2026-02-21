import React, { useEffect, useState, useCallback } from 'react';
import '../styles.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import StarRating from '../components/StarRating';

const MEDIA_TYPE_LABELS = {
    print:     'Print',
    ebook:     'E-Book',
    audiobook: 'Audiobook',
};

export const ShelfDetail = () => {
    const { shelfSlug } = useParams();
    const navigate = useNavigate();
    const [books, setBooks]         = useState([]);
    const [shelfName, setShelfName] = useState('');
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(true);

    const fetchShelfBooks = useCallback(async () => {
        try {
            const res = await api.get(`user-books/shelf/${shelfSlug}`);
            setBooks(res.data);
            if (res.data.length > 0) {
                setShelfName(res.data[0].shelfName);
            } else {
                const shelvesRes = await api.get('shelves');
                const shelf = shelvesRes.data.find(s => s.slug === shelfSlug);
                if (shelf) setShelfName(shelf.name);
            }
            setError('');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Please log in to view your books.');
            } else {
                setError('Error fetching shelf. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    }, [shelfSlug]);

    useEffect(() => {
        fetchShelfBooks();
    }, [fetchShelfBooks]);

    const handleRemoveBook = async (bookId) => {
        const confirm = window.confirm('Remove this book from the shelf?');
        if (!confirm) return;
        try {
            await api.delete(`user-books/${bookId}`);
            fetchShelfBooks();
        } catch {
            setError('Error removing book. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="page-container">

            {/* Header */}
            <h1 className="title">{shelfName}</h1>
            <p className="subtitle">
                {books.length} {books.length === 1 ? 'book' : 'books'}
            </p>

            {/* Back button */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/shelf')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#44624a',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    ← Back to My Books
                </button>
            </div>

            {error ? (
                <p className="error-text">{error}</p>
            ) : books.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <p className="empty-message">No books on this shelf yet.</p>
                    <Link
                        to="/search"
                        className="theme-custom"
                        style={{ display: 'inline-block', marginTop: '12px', textDecoration: 'none' }}
                    >
                        Find books to add
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {books.map(book => (
                        <div
                            key={book.book_id}
                            className="book-card"
                            style={{ alignItems: 'flex-start' }}
                        >
                            {/* Cover */}
                            {book.bookImage ? (
                                <img
                                    src={book.bookImage}
                                    alt={book.bookTitle}
                                    className="book-cover"
                                />
                            ) : (
                                <div className="book-cover" style={{ backgroundColor: '#dfe8dc' }} />
                            )}

                            {/* Book info */}
                            <div className="book-content" style={{ flex: 1 }}>
                                <div>
                                    <Link
                                        to={`/books/${book.book_id}`}
                                        className="book-title"
                                    >
                                        {book.bookTitle}
                                    </Link>

                                    <div className="book-author">
                                        {book.bookAuthor}
                                    </div>

                                    {/* Metadata badges */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
                                        {book.media_type && (
                                            <span className="rating-badge">
                                                {MEDIA_TYPE_LABELS[book.media_type] || book.media_type}
                                            </span>
                                        )}
                                        {book.start_date && (
                                            <span className="rating-badge">
                                                Started {formatDate(book.start_date)}
                                            </span>
                                        )}
                                        {book.finished_date && (
                                            <span className="rating-badge">
                                                Finished {formatDate(book.finished_date)}
                                            </span>
                                        )}
                                        {shelfSlug === 'want_to_read' && (
                                            <span className="rating-badge">
                                                Added {formatDate(book.created_at)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    {book.rating > 0 && (
                                        <div style={{ marginBottom: '6px' }}>
                                            <StarRating rating={book.rating} readOnly />
                                        </div>
                                    )}

                                    {/* Written review preview */}
                                    {book.written_review && (
                                        <p className="user-review">
                                            {book.written_review.length > 120
                                                ? `${book.written_review.slice(0, 120)}...`
                                                : book.written_review
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '10px'}}>
                                    {/* Edit/View review — only on read shelf */}
                                    {shelfSlug === 'read' && (
                                        <button
                                            onClick={() => navigate(`/review/${book.book_id}`)}
                                            className="theme-custom"
                                            style={{ fontSize: '13px', padding: '5px 14px', whiteSpace: 'nowrap' }}
                                        >
                                            {book.written_review ? 'Edit Review' : 'Write Review'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate(`/books/${book.book_id}`)}
                                        style={{
                                            background: '#dfe8dc',
                                            border: 'none',
                                            color: '#2f3e32',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            padding: '5px 14px',
                                            borderRadius: '20px',
                                            fontFamily: 'inherit',
                                            transition: '0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        View Book
                                    </button>

                                    <button
                                        onClick={() => handleRemoveBook(book.book_id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#c0392b',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            padding: '5px 0',
                                            fontFamily: 'inherit',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};