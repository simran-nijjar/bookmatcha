import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
var config = require('../config');

// This file contains the form the user sees when they login and the login processes

export const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = (event) => {
        const { name, value } = event.target;
        if (name === 'Email') {
            setEmail(value);
        } else if (name === 'Password') {
            setPassword(value);
        }
    };

    const login = (event) => {
        event.preventDefault();
        
        axios.post(config.API_URL + 'login', {
            "Email": email,
            "Password": password
        })
        .then((res) => {
            console.log(res);
            if (res.status === 200) {
                // Handle successful login
                localStorage.setItem('token', res.data.token);
                setError('Logged in.');
                onLogin();
                navigate("/UserAccount");
            }
        })
        .catch((error) => {
            console.log(error.response);
            if (error.response && error.response.status === 400) {
                setError('The email and password you entered do not match our records. Please try again.');
            } else {
                setError('Login failed. Please try again later.');
            }
        });
    };

    return (
        <div className="container py-5 h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card bg-dark text-white">
                        <div className="card-body p-5 text-center">
                            <div className="mb-md-5 mt-md-4 pb-5">
                                <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
                                <p className="text-white-50">Welcome back to My Library!</p>

                                {/*Email input*/}
                                <div className="form-outline form-white mb-3">
                                    <input type="Email" name="Email" placeholder='Email' onChange={onChange} className="form-control form-control-lg" />
                                </div>

                                {/*Password input*/}
                                <div className="form-outline form-white mb-4">
                                    <input type="Password" name="Password" placeholder='Password' onChange={onChange} className="form-control form-control-lg" />
                                {/* Error message */}
                                <div style={{ minHeight: '20px' }}>
                                    {error && <p style={{ color: 'white' }}>{error}</p>}
                                </div>
                                </div>
                                <button className="btn btn-outline-light btn-lg px-5" type="submit" onClick={login}>Login</button>
                            </div>
                            <div>
                                <p className="mb-0">Don't have an account? <a href="/Register" className="text-blue-50">Register</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
