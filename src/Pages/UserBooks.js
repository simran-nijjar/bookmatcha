import React, { useEffect, useState } from 'react';
import '../styles.css'
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
var config = require('../config');

// This page is the first page the user sees when they login or register
// Here the user can see all of the books they have reviewed

export const UserBooks = () => {
    const [reviews, setReviews] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        // Retrieve user info from local storage
        const savedUser = JSON.parse(localStorage.getItem('user'));
        
        if (savedUser) {
          fetchUserReviews(savedUser.email);
        }
    }, []);

    // Fetch all reviews the user has posted
    const fetchUserReviews = (reviewerID) => {
        axios.get(`${config.API_URL}fetchuserreviews`, {
            params: {ReviewerID: reviewerID}
        })
        .then((response) => {
            setReviews(response.data);
        })
        .catch((error) => {
            console.log("Error fetching user's reviews: ", error.response);
        });
    };

    // Method to handle deleting a user's review
    const handleDelete = (reviewID) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this review?");
        // Delete from backend
        if (confirmDelete) {
            axios.delete(`${config.API_URL}deletereview/${reviewID}`)
            .then((response) => {
                // Refresh user's reviews when deleted
                const savedUser = JSON.parse(localStorage.getItem('user'));
                fetchUserReviews(savedUser.email);
            })
            .catch((error) => {
                console.log("Error deleting review: ", error.response);
            });
        }
    };

    const handleEdit = (bookID) => {
      navigate(`/book/${bookID}`);
    }
    
    return (
        <div>
          <h1 className="title">Welcome to your books</h1>
          {reviews.length === 0 ? (
            <p className="subtitle">No books yet. Start searching and reviewing books!</p>
          ) : (
            <div>
              <h3 className="subtitle">Here are the books you've brewed.</h3>

              {/* User reviews table */}
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
                        <Link to={`/book/${review.BookID}`} className="link-custom">
                          {review.bookTitle}
                        </Link>
                      </td>
                      <td>{review.bookAuthor}</td>
                      <td>{review.averageRating}</td>
                      <td>{review.RATING}</td>
                      <td>{review.WrittenReview}</td>
                      <td>{new Date(review.ReviewDate).toDateString() + ' ' + new Date(review.ReviewDate).toLocaleTimeString()}</td>
                      <td>
                        <Tooltip title="Edit"><EditIcon onClick={() => handleEdit(review.BookID)} style={{ cursor: 'pointer' }}></EditIcon></Tooltip>
                        <Tooltip title="Delete"><DeleteIcon onClick={() => handleDelete(review.BookReviewID)} style={{ cursor: 'pointer' }}></DeleteIcon></Tooltip>
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