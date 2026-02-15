import React, { useEffect, useState, useCallback } from 'react';
import '../styles.css';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

// Book details page: user can write/update their review and see reviews from others
export function BookDetails() {
    const { id } = useParams(); // Book ID from URL
    const [book, setBook] = useState(null);
    const [bookId, setBookId] = useState('');
    const [writtenReview, setWrittenReview] = useState('');
    const [rating, setRating] = useState('');
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(null);
    const [existingReview, setExistingReview] = useState(null);

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
                setRating(res.data[0].rating.toString());
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
        if (name === 'WrittenReview') setWrittenReview(value);
        else if (name === 'Rating') setRating(value);
    };

    // Validate review fields
    const validateFields = () => {
        if (!writtenReview.trim() || !rating.trim()) {
            setError('Please fill out all fields before saving review.');
            return false;
        }
        return true;
    };

    // Save new review
    const saveReview = async (e) => {
        e.preventDefault();
        if (!validateFields() || !userId) return;

        try {
            const res = await api.post('reviews', { bookId, writtenReview, rating, userId });
            if (res.status === 200) {
                setError('Review saved successfully.');
                fetchReviews(bookId);
                fetchExistingReview(bookId, userId);
            }
        } catch {
            setError('Error saving review. Please try again later.');
        }
    };

    // Update existing review
    const updateReview = async (e) => {
        e.preventDefault();
        if (!validateFields() || !userId) return;

        try {
            const res = await api.put('reviews', { bookId, writtenReview, rating, userId });
            if (res.status === 200) {
                setError('Review updated successfully.');
                fetchReviews(bookId);
                fetchExistingReview(bookId, userId);
            }
        } catch {
            setError('Error updating review. Please try again later.');
        }
    };

    if (!book) return <p>Loading book details...</p>;

    return (
        <div>
            <h1 className="title">{book.volumeInfo?.title || 'No Title Available'}</h1>

            <div style={{ textAlign: 'center' }}>
                {book.volumeInfo?.imageLinks?.thumbnail && (
                    <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
                )}
            </div>

            <p style={{ textAlign: 'center' }}><strong>By:</strong> {book.volumeInfo?.authors?.join(', ') || 'Unknown'}</p>
            <p style={{ textAlign: 'center' }}><strong>Description:</strong></p>
            <div
                style={{ textAlign: 'center' }}
                dangerouslySetInnerHTML={{ __html: book.volumeInfo?.description || 'No Description Available' }}
            />

            <p><strong>Genre:</strong> {book.volumeInfo?.categories?.[0] ? book.volumeInfo.categories[0].split('/')[1] : 'Unknown'}</p>
            <p><strong>Sub-genre:</strong> {book.volumeInfo?.categories?.[0] ? book.volumeInfo.categories.map(c => c.split('/')[2]).filter(Boolean).join(',') : 'Unknown'}</p>

            <p><strong>Average Rating:</strong> {averageRating !== null ? averageRating.toFixed(2) : 'No ratings yet'}</p>
            <p><strong>Total Reviews:</strong> {reviews.length}</p>

            <hr />

            <h2 className="title">Reviews</h2>
            <form>
                {!existingReview ? <p className="subtitle">Write your review here:</p> : <p className="subtitle">Update your review here:</p>}

                <textarea
                    className="text-custom"
                    style={{ display: 'block', margin: 'auto', width: '50%', maxWidth: '600px' }}
                    name="WrittenReview"
                    value={writtenReview}
                    onChange={onChange}
                    rows="8"
                    cols="100"
                />

                <center>
                    <p className="text-custom">Give a rating:</p>
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <label key={num} className={`btn btn-secondary theme-custom ${rating === num.toString() ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="Rating"
                                    value={num}
                                    checked={rating === num.toString()}
                                    onChange={onChange}
                                /> {num}
                            </label>
                        ))}
                    </div>

                    {!existingReview ? (
                        <button className="btn text-custom button-custom" type="submit" onClick={saveReview}>Save Review</button>
                    ) : (
                        <button className="btn text-custom button-custom" type="submit" onClick={updateReview}>Update Review</button>
                    )}
                </center>
            </form>

            <div className="text-custom"><p>{error}</p></div>
            <hr />

            <h2 className="title">Posted Reviews</h2>
            <table className="table table-striped table-custom">
                <thead className="text-custom">
                    <tr>
                        <th>Reviewer</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Date Posted</th>
                    </tr>
                </thead>
                <tbody className="text-custom">
                    {reviews.map(review => (
                        <tr key={review.book_review_id}>
                            <td>{review.first_name + ' ' + review.last_name}</td>
                            <td>{review.rating}</td>
                            <td>{review.written_review}</td>
                            <td>{new Date(review.created_at).toDateString() + ' ' + new Date(review.created_at).toLocaleTimeString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}