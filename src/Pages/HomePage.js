import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MDBCard, MDBCardTitle, MDBCardText, MDBCardBody, MDBCardImage, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import '../styles.css';
import { Link } from 'react-router-dom';

// This file contains the details the user sees when they first login/register into bookmatcha
// The homepage displays the top rated books

export const HomePage = () => {
    const [topBooks, setTopBooks] = useState([]);

    // Fetch the top books rated on bookmatcha
    const fetchTopBooks = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}fetchtopuserratedbooks`);
            setTopBooks(response.data);
        } catch (error) {
            console.error("Error fetching top books", error);
        }
    };

    useEffect(() => {
        fetchTopBooks();
    }, []);

return (
        <div>
            <h1 className="title">Top Rated Books by bookmatcha Users</h1>
            <p className="subtitle">These are the top books users have been sipping on.</p>
            <MDBRow className="justify-content-center mb-4">
            {topBooks.map(book => (
                <MDBCol key={book.BookID} md = '4' lg = '4' className="justify-content-center mb-4">
                    <MDBCard className="card-custom" style={{ maxWidth: '540px' }}>
                            <MDBRow className='g-0'>
                                <MDBCol md='12' lg='6' xl='4' >
                                    <MDBCardImage
                                        src={book.ImageLink}
                                        alt={book.Name}
                                        fluid
                                    />
                                </MDBCol>
                                <MDBCol md='8'>
                                    <MDBCardBody>
                                        <MDBCardTitle>
                                            <Link to={`/book/${book.BookID}`} className="link-custom text-custom">
                                                {book.Name}
                                            </Link>
                                        </MDBCardTitle>
                                        <MDBCardText className="text-custom">
                                            By: {book.Author}
                                        </MDBCardText>
                                        <MDBCardText className="text-custom">
                                            Average Rating: {book.AvgRating}
                                        </MDBCardText>
                                    </MDBCardBody>
                                </MDBCol>
                            </MDBRow>
                        </MDBCard>
                </MDBCol>
            ))}
            </MDBRow>
        </div>
    );
};

