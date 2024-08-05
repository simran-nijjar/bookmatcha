import React, { useEffect, useState } from 'react';
import '../styles.css'
import axios from 'axios';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
var config = require('../config');

// This page is the first page the user sees when they login or register
// Here the user can see all of the books they have reviewed

export const HomePage = () => {
    const [reviews, setReviews] = useState([]);
    
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
    
    return (
        <div>
          <h1 className="title">Welcome to your books</h1>
          {reviews.length === 0 ? (
            <p className="subtitle">No books yet. Start reviewing books!</p>
          ) : (
            <div>
              <h3 className="subtitle">Here are your reviews</h3>

              {/* User reviews table */}
              <table className="table body table-striped table-custom">
                <thead className="text-custom">
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Rating</th>
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
                      <td>{review.RATING}</td>
                      <td>{review.WrittenReview}</td>
                      <td>{new Date(review.ReviewDate).toDateString() + ' ' + new Date(review.ReviewDate).toLocaleTimeString()}</td>
                      <td className="centered">
                        <DeleteIcon onClick={() => handleDelete(review.BookReviewID)} style={{ cursor: 'pointer' }}></DeleteIcon>
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