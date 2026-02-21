import React, { useEffect, useState, useCallback } from 'react';
import '../styles.css';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import StarRating from '../components/StarRating';
import { ShelfSelector } from '../components/ShelfSelector';
import { REVIEW_SORT_OPTIONS } from '../constants/sortConstants';

export function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [bookId, setBookId] = useState('');
    const [writtenReview, setWrittenReview] = useState('');
    const [rating, setRating] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(null);
    const [existingReview, setExistingReview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [shelfEntry, setShelfEntry] = useState(null);
    const [sortBy, setSortBy] = useState('newest');

    const fetchBookDetails = useCallback(async (bookId) => {
        try {
            const response = await api.get(`google-books/books/${bookId}`);
            setBook(response.data);
            setBookId(response.data.id);
            fetchReviews(response.data.id);
        } catch {
            setError('Failed to load book details.');
        }
    }, []);

    const fetchReviews = async (bookId) => {
        try {
            const res = await api.get('reviews', { params: { bookId } });
            setReviews(res.data);
            const ratings = res.data.map(r => Number(r.rating)).filter(r => !isNaN(r) && r > 0);
            const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
            setAverageRating(avg !== null ? parseFloat(avg.toFixed(2)) : 0);
        } catch {
            setError('Failed to fetch reviews. Please try again later.');
        }
    };

    const fetchExistingReview = async (bookId) => {
        try {
            const res = await api.get('reviews/books/user', { params: { bookId } });
            setIsLoggedIn(true);
            if (res.data.length > 0) {
                setExistingReview(res.data[0]);
                setWrittenReview(res.data[0].written_review || '');
                setRating(res.data[0].rating || 0);
            }
        } catch {
            setIsLoggedIn(false);
        }
    };

    const fetchShelfEntry = useCallback(async (bookId) => {
        try {
            const res = await api.get(`user-books/${bookId}`);
            setShelfEntry(res.data);
        } catch {
            setShelfEntry(null);
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchBookDetails(id);
            fetchExistingReview(id);
            fetchShelfEntry(id);
        }
    }, [id, fetchBookDetails, fetchShelfEntry]);

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name === 'WrittenReview') setWrittenReview(value);
    };

    const saveRating = async (newRating) => {
        if (submitting) {
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            if (existingReview) {
                await api.put('reviews', {
                    bookId,
                    writtenReview: writtenReview|| '',
                    rating: newRating
                });
            } else {
                await api.post('reviews', {
                    bookId,
                    writtenReview: writtenReview,
                    rating: newRating
                });
            }
            setRating(newRating);
            fetchReviews(bookId);
            fetchExistingReview(bookId);
            fetchShelfEntry(bookId);
        } catch (err) {
            var message = err.response?.data?.message;
            if (message.includes('rating')) {
                setError('You must give the book a rating');
            } else {
                setError('Error saving rating. Please try again later.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const saveReview = async (e) => {
        e.preventDefault();
        if (submitting) {
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            if (existingReview) {
                await api.put('reviews', { bookId, writtenReview, rating });
            } else {
                await api.post('reviews', { bookId, writtenReview, rating });
            }
            fetchReviews(bookId);
            fetchExistingReview(bookId);
            fetchShelfEntry(bookId);
        } catch (err) {
            var message = err.response?.data?.message;
            if (message.includes('rating')) {
                setError('You must give the book a rating.');
            } else if (message.includes('cannot exceed')) {
                setError('Review cannot exceed 2000 characters');
            } else {
                setError('Error saving rating. Please try again later.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatDescription = (raw) => {
        if (!raw) return <p>No description available.</p>;
        const paragraphs = raw.split(/<br\s*\/?>/i).filter(p => p.trim() !== '');
        return paragraphs.map((p, idx) => (
            <p key={idx} style={{ marginBottom: '12px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: p }} />
        ));
    };

    if (!book) { 
        return <p className="empty-message">Loading book details...</p>;
    }

    const shortDescription =
        book.volumeInfo?.description?.slice(0, 300) +
        (book.volumeInfo?.description?.length > 300 ? '...' : '');

    const writtenReviews = reviews.filter(r => r.written_review && r.written_review.trim() !== '');
    const ratingCount = reviews.filter(r => r.rating > 0).length;

    const sortedReviews = [...writtenReviews].sort((a, b) => {
        switch (sortBy) {
            case 'newest':  
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':  
                return new Date(a.created_at) - new Date(b.created_at);
            case 'highest': 
                return b.rating - a.rating;
            case 'lowest':  
                return a.rating - b.rating;
            default:        
                return 0;
        }
    });

   return (
    <div className="page-container">

        {/* TOP SECTION */}
        <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap',}}>

            {/* LEFT COLUMN — cover, shelf selector, rating */}
            <div style={{ width: '200px', flex: '0 0 200px',}}>
                {book.volumeInfo?.imageLinks?.thumbnail ? (
                    <img
                        src={book.volumeInfo.imageLinks.thumbnail}
                        alt={book.volumeInfo.title}
                        style={{ width: '200px', borderRadius: '4px', display: 'block' }}
                    />
                ) : (
                    <div style={{ width: '200px', height: '300px', backgroundColor: '#ccc', borderRadius: '4px' }} />
                )}

                {/* Shelf selector — desktop only, hidden on mobile */}
                {isLoggedIn && (
                    <div className="desktop-only" style={{ marginTop: '12px', textAlign: 'center' }}>
                        <ShelfSelector
                            bookId={bookId}
                            initialEntry={shelfEntry}
                            onUpdate={() => fetchShelfEntry(bookId)}
                        />
                    </div>
                )}

                {/* Rating */}
                {isLoggedIn && (
                    <div className="desktop-only" style={{ marginTop: '12px', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                        <strong>{rating > 0 ? 'Your rating:' : 'Rate this book'}</strong>
                        <StarRating rating={rating} setRating={saveRating} />
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ flex: 1, minWidth: '250px' }}>
                <h1 className="title" style={{ textAlign: 'center', marginTop: '0' }}>
                    {book.volumeInfo?.title || 'No Title Available'}
                </h1>
                <h3 className="subtitle" style={{ textAlign: 'center', marginBottom: '10px' }}>
                    {book.volumeInfo?.authors?.join(', ') || 'Unknown Author'}
                </h3>

                {/* Community rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', justifyContent: 'center' }}>
                    <StarRating rating={averageRating || 0} readOnly />
                    <strong>{averageRating !== null ? averageRating.toFixed(2) : '0.00'}</strong>
                    <span style={{ color: '#6b7d6d', fontSize: '15px' }}>
                        {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'} &bull; {writtenReviews.length} {writtenReviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                </div>

                {/* Shelf selector — mobile only, shown in right column flow */}
                {isLoggedIn && (
                    <div className="mobile-only" style={{ marginBottom: '12px', textAlign: 'center' }}>
                        <ShelfSelector
                            bookId={bookId}
                            initialEntry={shelfEntry}
                            onUpdate={() => fetchShelfEntry(bookId)}
                        />
                    </div>
                )}

                {/* Description */}
                <div style={{
                    backgroundColor: '#fffdf7',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '10px',
                }}>
                    {showFullDescription
                        ? formatDescription(book.volumeInfo?.description)
                        : formatDescription(shortDescription)
                    }
                    {book.volumeInfo?.description?.length > 300 && (
                    <div style ={{ textAlign: 'center', marginTop: '4px'}}>
                        <button
                            className="theme-custom"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            style={{
                                    background: '#dfe8dc',
                                    border: 'none',
                                    color: '#2f3e32',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    padding: '5px 14px',
                                    borderRadius: '20px',
                                    fontFamily: 'inherit',
                                    transition: '0.2s',
                                    marginTop: '4px',
                                }}                        >
                            {showFullDescription ? 'Show Less' : 'Read More'}
                        </button>
                    </div>
                    )}
                </div>
            </div>
        </div>

        <hr />

        {/* REVIEW SECTION */}
        {isLoggedIn && (
            <>
                <h2 className="title">Write a Review</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#44624a' }}>
                        {rating > 0 ? 'Your rating:' : 'Rate this book:'}
                    </span>
                    <StarRating rating={rating} setRating={saveRating} />
                </div>
                <form onSubmit={saveReview}>
                    <textarea
                        className="auth-input"
                        name="WrittenReview"
                        value={writtenReview}
                        onChange={onChange}
                        rows="6"
                        maxLength={2000}
                        placeholder="Write a review (optional)"
                    />
                    <div style={{
                        textAlign: 'right',
                        fontSize: '13px',
                        color: writtenReview.length > 1800 ? '#c0392b' : '#6b7d6d',
                        marginTop: '4px'
                    }}>
                        {writtenReview.length}/2000
                    </div> 
                    <div style={{textAlign: 'center'}}>
                        <button className="theme-custom" type="submit" style={{ marginTop: '10px' }}>
                            {existingReview ? 'Update Review' : 'Save Review'}
                        </button>
                    </div>
                </form>
                {error && <p className="error-text">{error}</p>}
                <hr />
            </>
        )}

        {/* POSTED REVIEWS */}
        <h2 className="title">Posted Reviews</h2>
            {sortedReviews.length > 0 && (
            <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                        backgroundColor: '#dfe8dc',
                        color: '#2f3e32',
                        border: 'solid',
                        borderWidth: 'thin',
                        padding: '7px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        appearance: 'auto',
                    }}
                >
                    <option value="" disabled>Sort by</option>
                    {REVIEW_SORT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        <div className="reviews-grid">
            {sortedReviews.length === 0 ? (
                <p className="empty-message">No written reviews yet.</p>
            ) : (
                sortedReviews.map((review) => (
                    <div className="review-card" key={review.book_review_id}>
                        <div className="review-header">
                            <strong>{review.user_name}</strong>
                            <StarRating rating={review.rating || 0} readOnly />
                        </div>
                        <p className="review-text">{review.written_review}</p>
                        <div className="review-date">
                            {new Date(review.created_at).toDateString()}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
}