import React, { useEffect, useState, useCallback } from 'react';
import '../styles.css';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';
import StarRating from '../components/StarRating';

export function BookDetails() {
    const { id } = useParams();
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
    const [showFullDescription, setShowFullDescription] = useState(false);

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

    const fetchReviews = async (bookId) => {
        try {
            const res = await api.get('reviews', { params: { bookId } });
            setReviews(res.data);

            const ratings = res.data
                .map(r => r.rating)
                .filter(r => r > 0);

            const avg =
                ratings.length > 0
                    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                    : null;

            setAverageRating(avg);
        } catch {
            setError('Failed to fetch reviews. Please try again later.');
        }
    };

    const fetchExistingReview = async (bookId, userId) => {
        if (!userId) return;
        try {
            const res = await api.get('reviews/book/user', { params: { bookId, userId } });
            if (res.data.length > 0) {
                setExistingReview(res.data[0]);
                setWrittenReview(res.data[0].written_review || '');
                setRating(res.data[0].rating || 0);
            }
        } catch {
            setError('Failed to get your review. Please try again later.');
        }
    };

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

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name === 'WrittenReview') {
            setWrittenReview(value);
        }
    };

    const saveRating = async (newRating) => {
        if (!userId || submitting) return;
        setSubmitting(true);
        try {
            if (existingReview) {
                await api.put('reviews', {
                    bookId,
                    writtenReview: existingReview.written_review || '',
                    rating: newRating,
                    userId
                });
            } else {
                await api.post('reviews', {
                    bookId,
                    writtenReview: '',
                    rating: newRating,
                    userId
                });
            }
            setRating(newRating);
            fetchReviews(bookId);
            fetchExistingReview(bookId, userId);
        } catch {
            setError('Error saving rating. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    const saveReview = async (e) => {
        e.preventDefault();
        if (!userId || submitting) {
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            if (existingReview) {
                await api.put('reviews', { bookId, writtenReview, rating, userId });
            } else {
                await api.post('reviews', { bookId, writtenReview, rating, userId });
            }
            fetchReviews(bookId);
            fetchExistingReview(bookId, userId);
        } catch {
            setError('Error saving review. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDescription = (raw) => {
        if (!raw) return <p>No description available.</p>;

        const paragraphs = raw
            .split(/<br\s*\/?>/i)
            .filter(p => p.trim() !== '');

        return paragraphs.map((p, idx) => (
            <p
                key={idx}
                style={{ marginBottom: '12px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: p }}
            />
        ));
    };

    if (!book) return <p className="empty-message">Loading book details...</p>;

    const shortDescription =
        book.volumeInfo?.description?.slice(0, 300) +
        (book.volumeInfo?.description?.length > 300 ? '...' : '');

    const writtenReviews = reviews.filter(
        r => r.written_review && r.written_review.trim() !== ''
    );

    const ratingCount = reviews.filter(r => r.rating > 0).length;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start', marginBottom: '20px' }}>
                
                {/* LEFT COLUMN */}
                <div style={{ minWidth: '200px' }}>
                    {book.volumeInfo?.imageLinks?.thumbnail ? (
                        <img
                            src={book.volumeInfo.imageLinks.thumbnail}
                            alt={book.volumeInfo.title}
                            style={{ width: '200px', borderRadius: '4px' }}
                        />
                    ) : (
                        <div style={{ width: '200px', height: '300px', backgroundColor: '#ccc', borderRadius: '4px' }} />
                    )}

                    {userId && (
                        <div style={{ marginTop: '15px' }}>
                            <strong>Your Rating:</strong>
                            <StarRating rating={rating} setRating={saveRating} />
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ flex: 1 }}>
                    <h1 className="title">{book.volumeInfo?.title || 'No Title Available'}</h1>
                    <h3 className="subtitle">
                        {book.volumeInfo?.authors?.join(', ') || 'Unknown Author'}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <StarRating rating={averageRating || 0} readOnly />
                        <strong>{averageRating ? averageRating.toFixed(2) : '0'}</strong>
                        <span>
                            {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
                        </span>
                        <span>
                            {writtenReviews.length} {writtenReviews.length === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>

                    <div>
                        {showFullDescription
                            ? formatDescription(book.volumeInfo?.description)
                            : formatDescription(shortDescription)
                        }
                        {book.volumeInfo?.description?.length > 300 && (
                            <button
                                className="theme-custom"
                                onClick={() => setShowFullDescription(!showFullDescription)}
                            >
                                {showFullDescription ? 'Show Less' : 'Read More'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <hr />

            <h2 className="title">Write a Review</h2>
            <form onSubmit={saveReview}>
                <textarea
                    className="auth-input"
                    name="WrittenReview"
                    value={writtenReview}
                    onChange={onChange}
                    rows="6"
                    placeholder="Write a review (optional)"
                />
                <button className="theme-custom" type="submit" style={{ marginTop: '10px' }}>
                    {existingReview ? 'Update Review' : 'Save Review'}
                </button>
            </form>

            {error && <p className="error-text">{error}</p>}

            <hr />

            <h2 className="title">Posted Reviews</h2>
            <div className="reviews-grid">
                {writtenReviews.length === 0 ? (
                    <p className="empty-message">No written reviews yet.</p>
                ) : (
                    writtenReviews.map((review) => (
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