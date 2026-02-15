import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const onChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
            setEmail(value);
        }
    };

    const requestPasswordReset = async (event) => {
        event.preventDefault();
        setMessage('');

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}users/request-password-reset`, {
                email: email
            });

            if (res.status === 200) {
                setMessage('If an account with this email exists, instructions to reset your password will be sent.');
            }

        } catch (error) {
            setMessage('Something went wrong while trying to send reset instructions. Please try again later.');
        }
    };
    
    return (
        <div className="container py-5 h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card bg-dark text-white">
                        <div className="card-body p-3 text-center theme-custom">
                            <div className="mb-3">
                                <h2 className="fw-bold mb-2 text-uppercase">Reset your password</h2>
                                <p className="text-white-50">Enter your email</p>

                                {/*Email input*/}
                                <div className="form-outline form-white mb-3">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder='Email'
                                        value={email}
                                        onChange={onChange}
                                        className="form-control form-control-lg text-custom"
                                        style={{ fontSize: '16px', padding: '8px', width: '80%', margin: 'auto' }}
                                    />
                                </div>
                                
                                {/* Message */}
                                <div style={{ minHeight: '20px' }}>
                                    {message && <p style={{ color: 'white' }}>{message}</p>}
                                </div>

                                {/* Reset button */}
                                <button
                                    className="btn btn-outline-light btn-lg px-5 theme-custom"
                                    type="submit"
                                    onClick={requestPasswordReset}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};