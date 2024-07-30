import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
var config = require('../config');

// This file contains the book details when a user clicks a specific book
// Users can also add a review here and view other reviews for the book

export function BookDetails() {
    const { id } = useParams(); // Extract book ID from URL parameters
    const [book, setBook] = useState(null);
    const [bookID, setBookID] = useState('');
    const [writtenReview, setWrittenReview] = useState('');
    const [rating, setRating] = useState('');
    const [reviewerID, setReviewerID] = useState('');
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [reviewers, setReviewers] = useState({});
  
    // Fetch book details from the Google Books API
    const fetchBookDetails = useCallback(async (bookId) => {
      try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        setBook(response.data);
        setBookID(response.data.id);
        fetchReviews(response.data.id);
        fetchReviewers(response.data.id);
      } catch (error) {
        console.error('Error fetching book details:', error);
        setError('Failed to load book details.');
      }
    }, []);
  
    // Fetch all reviews for the specified book
    const fetchReviews = (bookId) => {
      axios.get(`${config.API_URL}fetchreviews`, {
        params: { BookID: bookId }
      })
      .then((response) => {
        setReviews(response.data);
      })
      .catch((error) => {
        console.log("Error fetching reviews:", error.response);
      });
    };
  
    // Fetch reviewers for the specified book
    const fetchReviewers = (bookId) => {
      axios.get(`${config.API_URL}fetchreviewername`, {
        params: { BookID: bookId }
      })
      .then((response) => {
        const reviewersMap = {};
        response.data.forEach((reviewer) => {
          reviewersMap[reviewer.ReviewerID] = `${reviewer.FirstName} ${reviewer.LastName}`;
        });
        setReviewers(reviewersMap);
      })
      .catch((error) => {
        console.log("Error fetching reviewers:", error.response);
      });
    };
  
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user'));
  
      // Fetch book details if not provided in the state
      if (!book && id) {
        fetchBookDetails(id);
      } else if (book) {
        setBookID(book.id);
        fetchReviews(book.id);
        fetchReviewers(book.id);
      }
  
      if (user) {
        setReviewerID(user.email);
      }
    }, [book, id, fetchBookDetails]);
  
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
  
    // Save review to the backend
    const saveReview = (event) => {
      event.preventDefault();
  
      if (!validateFields()) {
        return;
      }
      
      axios.post(`${config.API_URL}savereview`, {
        BookID: bookID,
        WrittenReview: writtenReview,
        Rating: rating,
        ReviewerID: reviewerID
      })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          console.log('Review saved successfully.');
          setError('Review saved successfully.');
          fetchReviews(bookID);
          fetchReviewers(bookID);
          setWrittenReview('');
          setRating('');
        }
      })
      .catch((error) => {
        console.log("Error saving review:", error.response);
        setError('Error saving review. Please try again later.');
      });
    };
  
    // Display loading message if book details are not yet available
    if (!book) {
      return <p>Loading book details...</p>;
    }

  return (
    <div>
      <h1>Book Details</h1>
      {book.volumeInfo?.imageLinks?.thumbnail && (
        <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
      )}
      <p><strong>{book.volumeInfo?.title || 'No Title Available'}</strong></p>
      <p><strong>By:</strong> {book.volumeInfo?.authors?.join(', ') || 'Unknown'}</p>
      <p><strong>Description:</strong> {book.volumeInfo?.description || 'No Description Available'}</p>
      <div>
        <hr />
        <h2>Reviews</h2>
        <form>
          <p>Write your review here:</p>

          {/* Written review input */}
          <textarea id="reviewTextBox" name="WrittenReview" value={writtenReview} onChange={onChange} rows="4" cols="100"></textarea>
          
          {/* Rating input */}
          <p>Give a rating:</p>
          <div className="btn-group btn-group-toggle" onChange={onChange} data-toggle="buttons">
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} className={`btn btn-secondary ${rating === num.toString() ? 'active' : ''}`}>
                <input type="radio" name="Rating" autoComplete="off" value={num} checked={rating === num.toString()} onChange={onChange} /> {num}
              </label>
            ))}
          </div>

          {/* Save review button */}
          <button className="btn btn-outline-dark" type="submit" onClick={saveReview}>Save Review</button>
        </form>

        {/* Update message */}
        <div style={{ minHeight: '20px' }}>
          {error && <p style={{ color: 'black' }}>{error}</p>}
        </div>
        <hr />
        <div>

        {/* Posted reviews table */}
          <h2>Posted Reviews</h2>
          <table className="table table-light table-striped">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date Posted</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.BookReviewID}>
                  <td>{reviewers[review.ReviewerID]}</td>
                  <td>{review.RATING}</td>
                  <td>{review.WrittenReview}</td>
                  <td>{new Date(review.ReviewDate).toDateString() + ' ' + new Date(review.ReviewDate).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
