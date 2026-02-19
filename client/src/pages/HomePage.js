import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';

// This file contains the details the user sees when they first login/register into bookmatcha
// The homepage displays the top rated books

export const HomePage = () => {
    const [topBooks, setTopBooks] = useState([]);
    const navigate = useNavigate();

    const fetchTopBooks = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}books/top-rated`
            );
            setTopBooks(response.data);
        } catch (error) {
        }
    };

    useEffect(() => {
        fetchTopBooks();
    }, []);

    return (
        <div className="page-container">

            <h1 className="title">
                Top Rated Books by bookmatcha Users
            </h1>

            <p className="subtitle">
                These are the top books users have been sipping on.
            </p>

            <div className="recommendations-grid">
                {topBooks.map(book => (
                    <div key={book.BookID} className="book-card" onClick={() => navigate(`/books/${book.BookID}`)} style={{ cursor: 'pointer'}}>

                        {book.ImageLink ? (
                            <img
                                src={book.ImageLink}
                                alt={`${book.Title} cover`}
                                className="book-cover"
                            />
                        ) : (
                            <div className="book-cover" />
                        )}

                        <div className="book-content">
                            <div>
                                <div className="book-title">{book.Title}</div>
                                <div className="book-author"> {book.Author}</div>
                                <div><span><StarRating rating={book.AverageRating || 0} readOnly /></span></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};