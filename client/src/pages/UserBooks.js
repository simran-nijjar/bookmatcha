import React, { useEffect, useState } from 'react';
import '../styles.css';
import { Link, useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';
import StarRating from '../components/StarRating';

// This page is the first page the user sees when they login or register
// Here the user can see all of the books they have reviewed

export const UserBooks = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserReviews();
    }, []);

    const fetchUserReviews = async (userId) => {
        try {
            const response = await api.get('reviews/user');
            setReviews(response.data);
            setError('');
        } catch (err) {
            if (err.response?.status === 401){
                setError('User not logged in. Please login to view your books');
            } else {
                setError('Error fetching your reviews. Please try again later.');
            }
        }
    };

    const handleDelete = async (reviewID) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this review?"
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`reviews/${reviewID}`);
            const token = localStorage.getItem('token');
            if (!token) return;
            const decoded = jwtDecode(token);
            fetchUserReviews(decoded.userId);
        } catch {
            setError('Error deleting review. Please try again later.');
        }
    };

    const handleEdit = (bookID) => {
        navigate(`/book/${bookID}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="page-container">

            <h1 className="title">Your Reading Shelf</h1>

            {error ? (
                <p className="subtitle error-text">{error}</p>
            ) : reviews.length === 0 ? (
                <p className="subtitle">
                    No books yet. Start searching and reviewing books!
                </p>
            ) : (
                <>
                    <p className="subtitle">
                        Here are the books you've brewed.
                    </p>

                    <div className="recommendations-grid">
                        {reviews.map((review) => (
                            <div
                                key={review.BookReviewID}
                                className="book-card"
                            >
                                <div className="book-content">

                                    <div>

                                        <Link
                                            to={`/book/${review.book_id}`}
                                            className="book-title"
                                        >
                                            {review.bookTitle}
                                        </Link>

                                        <div className="book-author">
                                            {review.bookAuthor}
                                        </div>

                                        <div>
                                            <span><StarRating rating={review.rating || 0} readOnly /></span>
                                        </div>

                                        <div className="rating-badge">
                                            Your Rating: {review.rating}/5
                                        </div>

                                        <div className="user-review">
                                            {review.written_review}
                                        </div>

                                        <div className="review-date">
                                            Reviewed on {formatDate(review.created_at)}
                                        </div>

                                    </div>

                                    <div className="review-actions">
                                        <Tooltip title="Edit">
                                            <EditIcon
                                                onClick={() =>
                                                    handleEdit(review.book_id)
                                                }
                                                className="icon-button"
                                            />
                                        </Tooltip>

                                        <Tooltip title="Delete">
                                            <DeleteIcon
                                                onClick={() =>
                                                    handleDelete(
                                                        review.BookReviewID
                                                    )
                                                }
                                                className="icon-button delete"
                                            />
                                        </Tooltip>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};