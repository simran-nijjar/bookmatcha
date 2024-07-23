import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
var config = require('../config');

// This file contains the book details when user clicks a specific book

export function BookDetails() {
  const location = useLocation();
  const book = location.state?.book;
  const [bookID, setBookID] = useState('');
  const [writtenReview, setWrittenReview] = useState('');
  const [rating, setRating] = useState('');
  const [reviewerID, setReviewerID] = useState('');
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
      // Retrieve user info from local storage
      const user = JSON.parse(localStorage.getItem('user'));

      if (book) {
            setBookID(book.id);
            // Fetch all reviews for book
            axios.get(`${config.API_URL}fetchreviews`, {
                params: {BookID: book.id}
            })
            .then((response) => {
                setReviews(response.data);
            })
            .catch((error) => {
                console.log("Error fetching reviews: ", error.response);
            })
      } else if (!book) {
          return <p>Book not found or data is not available.</p>;
      }

      if (user) {
          setReviewerID(user.email);
      }
  }, [book]);

  const onChange = (event) => {
      const { name, value } = event.target;
      if (name === 'WrittenReview') {
          setWrittenReview(value);
      } else if (name === 'Rating') { 
          setRating(value);
      }
  }

  const validateFields = () => {
      if (!writtenReview.trim() || !rating.trim()) {
          setError('Please fill out all fields before saving review.');
          return false;
      }
      return true;
  }

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
          }
      })
      .catch((error) => {
          console.log("Error saving review: ", error.response);
          setError('Error saving review. Please try again later.');
      });
  }

  return (
      <div>
          <h1>Book Details</h1>
          {book.volumeInfo.imageLinks?.thumbnail && (
              <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
          )}
          <p><strong>{book.volumeInfo.title}</strong></p>
          <p><strong>By:</strong> {book.volumeInfo.authors?.join(', ')}</p>
          <p><strong>Description:</strong> {book.volumeInfo.description}</p>
          <div>
          <hr></hr>
              <h2>Reviews</h2>
              <form>
                  <p>Write your review here: </p>
                  <textarea id="reviewTextBox" name="WrittenReview" value={writtenReview} onChange={onChange} rows="4" cols="100"></textarea>

                  <p>Give a rating: </p>
                  <div className="btn-group btn-group-toggle" onChange={onChange} data-toggle="buttons">
                      <label className={`btn btn-secondary ${rating === '1'}`}>
                          <input type="radio" name="Rating" id="rating1" autoComplete="off" value="1" checked={rating === '1'} onChange={onChange}/> 1
                      </label>
                      <label className={`btn btn-secondary ${rating === '2'}`}>
                          <input type="radio" name="Rating" id="rating2" autoComplete="off" value="2" checked={rating === '2'} onChange={onChange}/> 2
                      </label>
                      <label className={`btn btn-secondary ${rating === '3'}`}>
                          <input type="radio" name="Rating" id="rating3" autoComplete="off" value="3" checked={rating === '3'} onChange={onChange}/> 3
                      </label>
                      <label className={`btn btn-secondary ${rating === '4'}`}>
                          <input type="radio" name="Rating" id="rating4" autoComplete="off" value="4" checked={rating === '4'} onChange={onChange}/> 4
                      </label>
                      <label className={`btn btn-secondary ${rating === '5'}`}>
                          <input type="radio" name="Rating" id="rating5" autoComplete="off" value="5" checked={rating === '5'} onChange={onChange}/> 5
                      </label>
                  </div>
                  <button className="btn btn-outline-dark" type="submit" onClick={saveReview}>Save Review</button>
              </form>
              <div style={{ minHeight: '20px' }}>
                  {error && <p style={{ color: 'black' }}>{error}</p>}
              </div>
              <hr></hr>
              <div>
                <h2>Posted Reviews</h2>
                <table className="table table-light table-striped">
                <thead>
                    <tr>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Date Posted</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                        <tr key={review.BookReviewID}>
                        <td>{review.RATING}</td>
                        <td>{review.WrittenReview}</td>
                        <td>{new Date(review.ReviewDate).toDateString() + ' ' + new Date(review.ReviewDate).toLocaleTimeString() }</td>
                        </tr>
                    ))}
                </tbody>
                </table>
              </div>
          </div>


      </div>
  );
}