import React, { useEffect, useState, useCallback } from 'react';
import '../styles.css';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';
import StarRating from '../components/StarRating';

// Book details page: user can write/update their review and see reviews from others
export function BookDetails() {
    const { id } = useParams(); // Book ID from URL
    const [book, setBook] = useState(null);
    const [bookId, setBookId] = useState('');
    const [writtenReview, setWrittenReview] = useState('');
    const [rating, setRating] = useState(0);
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(null);
    const [existingReview, setExistingReview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Helper: fetch logged-in user ID from token
    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded.userId;
        } catch {
            return null;
        }
    };

    // Fetch book details from Google Books API
    const fetchBookDetails = useCallback(async (bookId) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
            const data = await response.json();
            setBook(data);
            setBookId(data.id);
            fetchReviews(data.id);
        } catch {
            setError('Failed to load book details.');
        }
    }, []);

    // Fetch all reviews for this book
    const fetchReviews = async (bookId) => {
        try {
            const res = await api.get('reviews', { params: { bookId } });
            setReviews(res.data);
            setAverageRating(res.data.length > 0 ? res.data[0].average_rating : null);
        } catch {
            setError('Failed to fetch reviews. Please try again later.');
        }
    };

    // Fetch logged-in user's review
    const fetchExistingReview = async (bookId, userId) => {
        if (!userId) return;
        try {
            const res = await api.get('reviews/book/user', { params: { bookId, userId } });
            if (res.data.length > 0) {
                setExistingReview(res.data[0]);
                setWrittenReview(res.data[0].written_review);
                setRating(res.data[0].rating);
            }
        } catch {
            setError('Failed to get your review. Please try again later.');
        }
    };

    // On mount: fetch book details and user review
    useEffect(() => {
        const currentUserId = getUserIdFromToken();
        setUserId(currentUserId);

        if (id) {
            fetchBookDetails(id);
            if (currentUserId) {
                fetchExistingReview(id, currentUserId);
            }
        }
    }, [id, fetchBookDetails]);

    // Form changes
    const onChange = (e) => {
        const { name, value } = e.target;
        if (name === 'WrittenReview') {
            setWrittenReview(value);
        }
        else if (name === 'Rating') {
            setRating(value);
        }
    };

    // Validate review fields
    const validateFields = () => {
        if (!writtenReview.trim()) {
            setError('Please fill out all fields before saving review.');
            return false;
        }
        return true;
    };

    // Save new review
    const saveReview = async (e) => {
        e.preventDefault();
        if (!validateFields() || !userId || submitting) {
            return;
        }
        
        setSubmitting(true);

        try {
            const res = await api.post('reviews', { bookId, writtenReview, rating, userId });
            if (res.status === 201) {
                fetchReviews(bookId);
                fetchExistingReview(bookId, userId);
            }
        } catch {
            setError('Error saving review. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    // Update existing review
    const updateReview = async (e) => {
        e.preventDefault();
        if (!validateFields() || !userId) return;

        try {
            const res = await api.put('reviews', { bookId, writtenReview, rating, userId });
            if (res.status === 200) {
                fetchReviews(bookId);
                fetchExistingReview(bookId, userId);
            }
        } catch {
            setError('Error updating review. Please try again later.');
        }
    };

    if (!book) return <p className="empty-message">Loading book details...</p>;

    return (
        <div className="page-container">

            <div className="book-card">
                {book.volumeInfo?.imageLinks?.thumbnail ? (
                    <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} className="book-cover" />
                ) : (
                    <div className="book-cover" />
                )}

                <div className="book-content">
                    <h1 className="title">{book.volumeInfo?.title || 'No Title Available'}</h1>
                    <div className="book-author">
                        By: {book.volumeInfo?.authors?.join(', ') || 'Unknown'}
                    </div>
                    <p><strong>Description:</strong></p>
                    <div dangerouslySetInnerHTML={{ __html: book.volumeInfo?.description || 'No Description Available' }} />

                    <p><strong>Genre:</strong> {book.volumeInfo?.categories?.[0] ? book.volumeInfo.categories[0].split('/')[1] : 'Unknown'}</p>
                    <p><strong>Sub-genre:</strong> {book.volumeInfo?.categories?.[0] ? book.volumeInfo.categories.map(c => c.split('/')[2]).filter(Boolean).join(',') : 'Unknown'}</p>

                    <div className="rating-badge">
                        Average Rating: {averageRating !== null ? averageRating.toFixed(2) : 'No ratings yet'}
                    </div>
                    <p><strong>Total Reviews:</strong> {reviews.length}</p>
                </div>
            </div>

            <hr />

            <h2 className="title">Reviews</h2>
            <form>
                {!existingReview ? <p className="subtitle">Write your review here:</p> : <p className="subtitle">Update your review here:</p>}

                <textarea
                    className="auth-input"
                    name="WrittenReview"
                    value={writtenReview}
                    onChange={onChange}
                    rows="8"
                />

                <div className="auth-wrapper" style={{ marginTop: '15px' }}>
                    <div className="auth-wrapper" style={{ marginTop: '15px' }}>
                        <p className="subtitle">Give a rating:</p>
                            <StarRating rating={rating || 0} setRating={setRating} />
                    </div>
                    {!existingReview ? (
                        <button className="theme-custom" type="submit" onClick={saveReview} style={{ marginTop: '15px' }}>Save Review</button>
                    ) : (
                        <button className="theme-custom" type="submit" onClick={updateReview} style={{ marginTop: '15px' }}>Update Review</button>
                    )}
                </div>
            </form>

            {error && <p className="error-text" style={{ marginTop: '10px' }}>{error}</p>}

            <hr />

            <h2 className="title">Posted Reviews</h2>
            <div className="reviews-grid">
                {reviews.length === 0 ? (
                    <p className="empty-message">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <div className="review-card" key={review.book_review_id}>
                            <div className="review-header">
                                <strong>{review.username}</strong>
                                <span className="review-rating">Rating: {review.rating}</span>
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