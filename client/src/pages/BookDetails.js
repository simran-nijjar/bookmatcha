import React, { useEffect, useState, useCallback } from 'react';
import '../styles.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// This file contains the details of each book when a user selects it
// Here the user can write a review, update their review, and look at reviews posted by other users

export function BookDetails() {
    const { id } = useParams(); // Extract book Id from URL parameters
    const [book, setBook] = useState(null); // Store book details from Google Books API
    const [bookId, setBookId] = useState(''); // Store book Id for backend API calls
    const [writtenReview, setWrittenReview] = useState(''); // Store user's written review
    const [rating, setRating] = useState(''); // Store user's rating (1-5)
    const [userId, setUserId] = useState(''); // Logged-in user Id
    const [error, setError] = useState(''); // Error or success messages
    const [reviews, setReviews] = useState([]); // List of reviews for this book
    const [averageRating, setAverageRating] = useState(null); // Average rating for the book
    const [existingReview, setExistingReview] = useState(null); // Review by logged-in user

    // Fetch book details from the Google Books API
    const fetchBookDetails = useCallback(async (bookId) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
            setBook(response.data);
            setBookId(response.data.id);
            fetchReviews(response.data.id); // Fetch reviews for this book after fetching details
        } catch (error) {
            setError('Failed to load book details.');
        }
    }, []);

    // Fetch all reviews for the specified book
    const fetchReviews = (bookId) => {
        axios.get(`${process.env.REACT_APP_API_URL}reviews`, {
            params: { bookId }
        }).then((response) => {
            setReviews(response.data);
            if (response.data.length > 0) {
                setAverageRating(response.data[0].average_rating);
            } else {
                setAverageRating(null);
            }
        }).catch(() => {
            setError("Failed to fetch reviews. Please try again later.");
        });
    };

    // Fetch the existing review for the logged-in user
    const fetchExistingReview = (bookId, userId) => {
        axios.get(`${process.env.REACT_APP_API_URL}reviews/book/user`, {
            params: { bookId, userId }
        }).then((response) => {
            if (response.data.length > 0) {
                setExistingReview(response.data[0]);
                setWrittenReview(response.data[0].written_review);
                setRating(response.data[0].rating.toString());
            }
        }).catch(() => {
            setError("Failed to get your review. Please try again later.");
        });
    };

    // On component mount, fetch user info and book details
    useEffect(() => {
        const token = localStorage.getItem('token');
        let currentUserId = '';
        if (token) {
            const decoded = jwtDecode(token);
            currentUserId = decoded.userId;
            setUserId(currentUserId);
        }

        if (id) {
            fetchBookDetails(id);

            if (currentUserId) {
                fetchExistingReview(id, currentUserId);
            }
        }
    }, [id, fetchBookDetails]);

    // Handle form field changes
    const onChange = (event) => {
        const { name, value } = event.target;
        if (name === 'WrittenReview') {
            setWrittenReview(value);
        } else if (name === 'Rating') {
            setRating(value);
        }
    };

    // Validate review fields
    const validateFields = () => {
        if (!writtenReview.trim() || !rating.trim()) {
            setError('Please fill out all fields before saving review.');
            return false;
        }
        return true;
    };

    // Save a new review
    const saveReview = async (event) => {
        event.preventDefault();
        if (!validateFields()) return;

        try {
            const result = await axios.post(`${process.env.REACT_APP_API_URL}reviews`, {
                bookId,
                writtenReview,
                rating,
                userId
            });
            if (result.status === 200) {
                setError('Review saved successfully.');
                fetchReviews(bookId);
                fetchExistingReview(bookId, userId);
            }
        } catch {
            setError('Error saving review. Please try again later.');
        }
    };

    // Update an existing review
    const updateReview = async (event) => {
        event.preventDefault();

        if (!validateFields()) {
            return;
        }
        try {
            const result = await axios.put(`${process.env.REACT_APP_API_URL}reviews`, {
                bookId,
                writtenReview,
                rating,
                userId
            });
            if (result.status === 200) {
                setError('Review updated successfully.');
                fetchReviews(bookId);
                fetchExistingReview(bookId, userId);
            }
        } catch {
            setError('Error updating review. Please try again later.');
        }
    };

    // Display loading message if book details are not yet available
    if (!book) {
        return <p>Loading book details...</p>;
    }

    return (
        <div>
            <h1 className="title">{book.volumeInfo?.title || 'No Title Available'}</h1>

            {/* Book cover */}
            <div style={{ textAlign: 'center' }}>
                {book.volumeInfo?.imageLinks?.thumbnail && (
                    <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
                )}
            </div>

            {/* Book author */}
            <p style={{ textAlign: 'center' }}><strong>By:</strong> {book.volumeInfo?.authors?.join(', ') || 'Unknown'}</p>

            {/* Book description */}
            <p style={{ textAlign: 'center' }}><strong>Description:</strong></p>
            <div
                style={{ textAlign: 'center' }}
                dangerouslySetInnerHTML={{ __html: book.volumeInfo?.description || 'No Description Available' }}
            />

            {/* Book genre and sub-genre */}
            <p><strong>Genre:</strong> {book.volumeInfo?.categories?.[0] ? book.volumeInfo.categories[0].split('/')[1] : 'Unknown'}</p>
            <p><strong>Sub-genre:</strong> {book.volumeInfo?.categories?.[0] ? book.volumeInfo.categories.map(category => category.split('/')[2]).filter(Boolean).join(',') : 'Unknown'}</p>

            {/* Book ratings */}
            <p><strong>Average Rating:</strong> {averageRating !== null ? averageRating.toFixed(2) : 'No ratings yet'}</p>
            <p><strong>Total Reviews:</strong> {reviews.length}</p>

            <div>
                <hr />

                {/* User review form */}
                <h2 className="title">Reviews</h2>
                <form>
                    {!existingReview ? (
                        <p className="subtitle">Write your review here:</p>
                    ) : (
                        <p className="subtitle">Update your review here:</p>
                    )}

                    <textarea
                        className="text-custom"
                        style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '50%', maxWidth: '600px' }}
                        id="reviewTextBox"
                        name="WrittenReview"
                        value={writtenReview}
                        onChange={onChange}
                        rows="8"
                        cols="100"
                    ></textarea>

                    {/* Rating selection */}
                    <center>
                        <p className="text-custom">Give a rating:</p>
                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <label key={num} className={`btn btn-secondary theme-custom ${rating === num.toString() ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="Rating"
                                        autoComplete="off"
                                        value={num}
                                        checked={rating === num.toString()}
                                        onChange={onChange}
                                    /> {num}
                                </label>
                            ))}
                        </div>

                        {/* Save or update button */}
                        {!existingReview ? (
                            <button className="btn text-custom button-custom" type="submit" onClick={saveReview}>Save Review</button>
                        ) : (
                            <button className="btn text-custom button-custom" type="submit" onClick={updateReview}>Update Review</button>
                        )}
                    </center>
                </form>

                {/* Error / success messages */}
                <div className="text-custom"><p>{error}</p></div>
                <hr />

                {/* Display reviews from other users */}
                <div>
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
                            {reviews.map((review) => (
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
            </div>
        </div>
    );
}