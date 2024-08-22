import React, { useEffect, useState, useCallback } from 'react';
import '../styles.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
var config = require('../config');

export function BookDetails() {
    const { id } = useParams(); // Extract book ID from URL parameters
    const [book, setBook] = useState(null);
    const [bookID, setBookID] = useState('');
    const [writtenReview, setWrittenReview] = useState('');
    const [rating, setRating] = useState('');
    const [reviewerID, setReviewerID] = useState('');
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(null);
    const [existingReview, setExistingReview] = useState(null);

    // Fetch book details from the Google Books API
    const fetchBookDetails = useCallback(async (bookId) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
            setBook(response.data);
            setBookID(response.data.id);
            fetchReviews(response.data.id);
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
            if (response.data.length > 0) {
                setAverageRating(response.data[0].averageRating);
            } else {
                setAverageRating(null);
            }
        })
        .catch((error) => {
            console.log("Error fetching reviews:", error.response);
        });
    };

    // Fetch the existing review for the logged-in user
    const fetchExistingReview = (bookId, reviewerId) => {
        axios.get(`${config.API_URL}fetchuserexistingreview`, {
            params: { BookID: bookId, ReviewerID: reviewerId }
        })
        .then((response) => {
            if (response.data.length > 0) {
                setExistingReview(response.data);
                setWrittenReview(response.data[0].WrittenReview);
                setRating(response.data[0].RATING.toString());
            }
        })
        .catch((error) => {
          console.log("Error fetching existing review: ", error);
        });
    };

    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (user) {
          setReviewerID(user.email);
      }

      if (id) {
          fetchBookDetails(id);
          if (user) {
              fetchExistingReview(id, user.email);
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

    // Save or update review
    const saveReview = async (event) => {
      event.preventDefault();
  
      if (!validateFields()) {
          return;
      }
      try {
          const result = await axios.post(`${config.API_URL}savereview`, {
              BookID: bookID,
              WrittenReview: writtenReview,
              Rating: rating,
              ReviewerID: reviewerID
          });
          if (result.status === 200) {
              setError('Review saved successfully.');
              fetchReviews(bookID);
              fetchExistingReview(bookID, reviewerID);
          }
      } catch (error) {
          console.log("Error saving review:", error.response ? error.response.data : error.message);
          setError('Error saving review. Please try again later.');
      }
  };

  const updateReview = async (event) => {
    event.preventDefault();

    if (!validateFields()) {
        return;
    }
    try {
        const result = await axios.put(`${config.API_URL}updatereview`, {
            BookID: bookID,
            WrittenReview: writtenReview,
            Rating: rating,
            ReviewerID: reviewerID
        });
        if (result.status === 200) {
            setError('Review updated successfully.');
            fetchReviews(bookID);
            fetchExistingReview(bookID, reviewerID);
        }
    } catch (error) {
        console.log("Error updating review:", error.response ? error.response.data : error.message);
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
            {book.volumeInfo?.imageLinks?.thumbnail && (
                <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
            )}
            <p><strong>By:</strong> {book.volumeInfo?.authors?.join(', ') || 'Unknown'}</p>
            <p><strong>Description:</strong> {book.volumeInfo?.description || 'No Description Available'}</p>
            <p><strong>Average Rating:</strong> {averageRating !== null ? averageRating.toFixed(2) : 'No ratings yet'}</p>
            <p><strong>Total Reviews:</strong> {reviews.length}</p>
            <div>
                <hr />
                <h2 className="title">Reviews</h2>
                <form>
                  {!existingReview ? (
                    <p className="subtitle">Write your review here:</p>
                  ): (
                    <p className="subtitle">Update your review here:</p>
                  )}

                    {/* Written review input */}
                    <textarea className="text-custom" style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '50%', maxWidth: '600px'}} id="reviewTextBox" name="WrittenReview" value={writtenReview} onChange={onChange} rows="8" cols="100" placeholder={writtenReview}>{writtenReview}</textarea>
                    
                    {/* Rating input */}
                    <center><p className="text-custom">Give a rating:</p>
                    <div className="btn-group btn-group-toggle" onChange={onChange} data-toggle="buttons">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <label key={num} className={`btn btn-secondary theme-custom ${rating === num.toString() ? 'active' : ''}`}>
                                <input type="radio" name="Rating" autoComplete="off" value={num} placeholder={rating} checked={rating === num.toString()} onChange={onChange} /> {num}
                            </label>
                        ))}
                    </div>

                    {/* Save review button */}
                    {!existingReview ? (
                      <button className="btn text-custom button-custom" type="submit" onClick={saveReview}>Save Review</button>
                    ): (
                      <button className="btn text-custom button-custom" type="submit" onClick={updateReview}>Update Review</button>
                    )}
                    </center>
                </form>

                {/* Update message */}
                <div className="text-custom"><p>{error}</p>
                </div>
                <hr />
                <div>

                {/* Posted reviews table */}
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
                                <tr key={review.BookReviewID}>
                                    <td>{review.FirstName + ' ' + review.LastName}</td>
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
