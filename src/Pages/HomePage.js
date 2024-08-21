import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MDBCard, MDBCardTitle, MDBCardText, MDBCardBody, MDBCardImage, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import '../styles.css';
import { Link } from 'react-router-dom';
var config = require('../config');

export const HomePage = () => {
    const [topBooks, setTopBooks] = useState([]);

    const fetchTopBooks = async () => {
        try {
            const response = await axios.get(`${config.API_URL}fetchtopuserratedbooks`);
            setTopBooks(response.data);
            console.log("response.data ", response.data);
        } catch (error) {
            console.error("Error fetching top books", error);
        }
    };

    useEffect(() => {
        fetchTopBooks();
    }, []);

return (
        <div>
            <h1 className="title">Top Rated Books by Bookmatcha Users</h1>
            {topBooks.map(book => (
                <MDBRow key={book.BookID} className="justify-content-center mb-4">
                    <MDBCol md='12'>
                        <MDBCard className="card-custom" style={{ maxWidth: '540px' }}>
                            <MDBRow className='g-0'>
                                <MDBCol md='8' lg='6' xl='4' >
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
                </MDBRow>
            ))}
        </div>
    );
};

