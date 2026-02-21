import React, { useEffect, useState, useCallback } from 'react';
import '../styles.css';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import StarRating from '../components/StarRating';

export const UserReview = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [book, setBook]               = useState(null);
    const [writtenReview, setWrittenReview] = useState('');
    const [rating, setRating]           = useState(0);
    const [existingReview, setExistingReview] = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [error, setError]             = useState('');
    const [success, setSuccess]         = useState('');

    const fetchBook = useCallback(async () => {
        try {
            const res = await api.get(`google-books/books/${bookId}`);
            setBook(res.data);
        } catch {
            setError('Failed to load book details.');
        }
    }, [bookId]);

    const fetchExistingReview = useCallback(async () => {
        try {
            const res = await api.get('reviews/books/user', { params: { bookId } });
            if (res.data.length > 0) {
                setExistingReview(res.data[0]);
                setWrittenReview(res.data[0].written_review || '');
                setRating(res.data[0].rating || 0);
            }
        } catch {
            setError('Failed to load your review.');
        }
    }, [bookId]);

    useEffect(() => {
        fetchBook();
        fetchExistingReview();
    }, [fetchBook, fetchExistingReview]);

    const saveRating = async (newRating) => {
        if (submitting) return;
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            if (existingReview) {
                await api.put('reviews', {
                    bookId,
                    writtenReview: existingReview.written_review || '',
                    rating: newRating
                });
            } else {
                await api.post('reviews', {
                    bookId,
                    writtenReview: '',
                    rating: newRating
                });
            }
            setRating(newRating);
            fetchExistingReview();
        } catch {
            setError('Error saving rating. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const saveReview = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            if (existingReview) {
                await api.put('reviews', { bookId, writtenReview, rating });
            } else {
                await api.post('reviews', { bookId, writtenReview, rating });
            }
            setSuccess('Review saved successfully!');
            fetchExistingReview();
        } catch (err) {
            const message = err.response?.data?.message || '';
            if (message.includes('rating')) {
                setError('Please add a rating before saving your review.');
            } else if (message.includes('cannot exceed')) {
                setError('Review cannot exceed 2000 characters.');
            } else {
                setError('Error saving review. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container">

            {/* Back button */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => navigate(-1)}
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
                    ← Back
                </button>
            </div>

            {/* Book header */}
            {book && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
                    {book.volumeInfo?.imageLinks?.thumbnail ? (
                        <img
                            src={book.volumeInfo.imageLinks.thumbnail}
                            alt={book.volumeInfo.title}
                            style={{ width: '80px', borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.12)', flexShrink: 0 }}
                        />
                    ) : (
                        <div style={{ width: '80px', height: '120px', backgroundColor: '#dfe8dc', borderRadius: '6px', flexShrink: 0 }} />
                    )}
                    <div>
                        <h1 className="title" style={{ textAlign: 'left', marginTop: 0, fontSize: '22px' }}>
                            {book.volumeInfo?.title}
                        </h1>
                        <h3 className="subtitle" style={{ textAlign: 'left', marginBottom: '10px' }}>
                            {book.volumeInfo?.authors?.join(', ')}
                        </h3>
                    </div>
                </div>
            )}

            {/* Rating */}
            <div style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#44624a', fontSize: '15px' }}>
                    {rating > 0 ? 'Your rating:' : 'Rate this book:'}
                </strong>
                <div style={{ marginTop: '6px' }}>
                    <StarRating rating={rating} setRating={saveRating} />
                </div>
            </div>

            {/* Review form */}
            <h2 className="title" style={{ textAlign: 'left', fontSize: '20px' }}>
                {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </h2>

            <form onSubmit={saveReview}>
                <textarea
                    className="auth-input"
                    value={writtenReview}
                    onChange={e => setWrittenReview(e.target.value)}
                    rows="8"
                    maxLength={2000}
                    placeholder="Write your review here..."
                />
                <div style={{
                    textAlign: 'right',
                    fontSize: '13px',
                    color: writtenReview.length > 1800 ? '#c0392b' : '#6b7d6d',
                    marginTop: '4px',
                }}>
                    {writtenReview.length}/2000
                </div>
                <button
                    className="theme-custom"
                    type="submit"
                    disabled={submitting}
                    style={{ marginTop: '12px' }}
                >
                    {submitting ? 'Saving...' : existingReview ? 'Update Review' : 'Save Review'}
                </button>
            </form>

            {error   && <p className="error-text"   style={{ marginTop: '10px' }}>{error}</p>}
            {success && <p className="success-text" style={{ marginTop: '10px' }}>{success}</p>}
        </div>
    );
};