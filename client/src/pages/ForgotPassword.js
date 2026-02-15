import React, { useState } from 'react';
import '../styles.css';
import axios from 'axios';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const onChange = (event) => {
        setEmail(event.target.value);
    };

    const requestPasswordReset = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (!email) {
            setError('Please enter your email.');
            return;
        }

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}users/request-password-reset`, { email });

            if (res.status === 200) {
                setMessage(
                    'If an account with this email exists, instructions to reset your password will be sent.'
                );
            }
        } catch {
            setError(
                'Something went wrong while trying to send reset instructions. Please try again later.'
            );
        }
    };

    return (
        <div className="container py-5 h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card bg-dark text-white">
                        <div className="card-body p-3 text-center theme-custom">
                            <h2 className="fw-bold mb-2 text-uppercase">Reset your password</h2>
                            <p className="text-white-50 mb-3">Enter your email below to receive reset instructions.</p>

                            <div className="form-outline form-white mb-3">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={onChange}
                                    className="form-control form-control-lg text-custom"
                                    style={{ fontSize: '16px', padding: '8px', width: '80%', margin: 'auto' }}
                                />
                            </div>

                            {/* Message / Error */}
                            <div style={{ minHeight: '20px' }}>
                                {message && <p style={{ color: 'lightgreen' }}>{message}</p>}
                                {error && <p style={{ color: 'red' }}>{error}</p>}
                            </div>

                            <button
                                className="btn btn-outline-light btn-lg px-5 theme-custom"
                                type="submit"
                                onClick={requestPasswordReset}
                            >
                                Reset
                            </button>

                            <p className="mt-3 mb-0">
                                Remembered your password? <a href="/login" className="text-white">Login</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};