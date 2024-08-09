import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { MDBCard, MDBCardTitle, MDBCardText, MDBCardBody, MDBCardImage, MDBRow, MDBCol} from 'mdb-react-ui-kit';
import '../styles.css';
var config = require('../config');

export const HomePage = () => {
    const [topBooks, setTopBooks] = useState([]);

    const fetchTopBooks = async () => {
        try {
            const response = await axios.get(`${config.API_URL}fetchtopuserratedbooks`);
            setTopBooks(response.data);
        } catch (error) {
            console.error("Error fetching top books", error);
        }
    }

    useEffect(() => {
        fetchTopBooks();
    }, []);

    return (
        <div>
            <h1 className="title">Top Rated Books by bookmatcha users</h1>
        </div>
    )
};