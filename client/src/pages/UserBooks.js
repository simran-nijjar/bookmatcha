import React, { useEffect, useState } from 'react';
import '../styles.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { jwtDecode } from 'jwt-decode'; // fixed import

// This page is the first page the user sees when they login or register
// Here the user can see all of the books they have reviewed

export const UserBooks = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in. Please login to view your books.');
            return;
        }

        let decoded;
        try {
            decoded = jwtDecode(token);
        } catch {
            setError('Invalid session. Please login again.');
            return;
        }

        fetchUserReviews(decoded.userId, token);
    }, []);

    // Fetch all reviews the user has posted
    const fetchUserReviews = async (userId, token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}reviews/user`, {
                params: { userId },
                headers: { Authorization: `Bearer ${token}` } // send token for verification
            });
            setReviews(response.data);
            setError('');
        } catch {
            setError('Error fetching your reviews. Please try again later.');
        }
    };

    // Method to handle deleting a user's review
    const handleDelete = async (reviewID) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this review?");
        if (!confirmDelete) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        let decoded;
        try { decoded = jwtDecode(token); } catch { return; }

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}reviews/${reviewID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserReviews(decoded.userId, token);
        } catch {
            setError('Error deleting review. Please try again later.');
        }
    };

    const handleEdit = (bookID) => {
        navigate(`/book/${bookID}`);
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.toDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <div>
            <h1 className="title">Welcome to your books</h1>
            {error ? (
                <p className="subtitle" style={{ color: 'red' }}>{error}</p>
            ) : reviews.length === 0 ? (
                <p className="subtitle">No books yet. Start searching and reviewing books!</p>
            ) : (
                <div>
                    <h3 className="subtitle">Here are the books you've brewed.</h3>

                    <table className="table body table-striped table-custom">
                        <thead className="text-custom">
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Average Rating</th>
                                <th>Your Rating</th>
                                <th>Review</th>
                                <th>Date Posted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-custom">
                            {reviews.map((review) => (
                                <tr key={review.BookReviewID}>
                                    <td>
                                        <Link to={`/book/${review.book_id}`} className="link-custom">
                                            {review.bookTitle}
                                        </Link>
                                    </td>
                                    <td>{review.bookAuthor}</td>
                                    <td>{review.average_rating}</td>
                                    <td>{review.rating}</td>
                                    <td>{review.written_review}</td>
                                    <td>{formatDateTime(review.created_at)}</td>
                                    <td>
                                        <Tooltip title="Edit">
                                            <EditIcon
                                                onClick={() => handleEdit(review.book_id)}
                                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <DeleteIcon
                                                onClick={() => handleDelete(review.BookReviewID)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};