import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
          console.log("savedUser: ", savedUser);
        }
    }, []);

    const fetchUserReviews = (reviewerID) => {
        axios.get(`${config.API_URL}fetchuserreviews`, {
            params: {ReviewerID: reviewerID}
        })
        .then((response) => {
            console.log("Fetched user reviews: ", response.data); 
            setReviews(response.data);
        })
        .catch((error) => {
            console.log("Error fetching user's reviews: ", error.response);
        });
    };

    return (
        <div>
          <h1>Welcome to Your Library</h1>
          {reviews.length === 0 ? (
            <p>No books in your library yet. Start reviewing books to add them to your library!</p>
          ) : (
            <div>
              <h3>Your Reviewed Books</h3>
              <table className="table table-light table-striped">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Date Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.BookReviewID}>
                      <td>{review.bookTitle}</td>
                      <td>{review.bookAuthor}</td>
                      <td>{review.RATING}</td>
                      <td>{review.WrittenReview}</td>
                      <td>{new Date(review.ReviewDate).toDateString() + ' ' + new Date(review.ReviewDate).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    );
}