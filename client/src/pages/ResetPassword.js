import React, { useState } from 'react';
import '../styles.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PasswordChecklist from 'react-password-checklist';
import api from '../api/api';

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token');

    const onChange = (event) => {
        const { name, value } = event.target;
        if (name === 'Password') { 
            setPassword(value); 
        }
        if (name === 'ConfirmPassword') { 
            setConfirmPassword(value); 
        }
    };

    const resetPassword = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!password || !confirmPassword) {
            setError('Please fill out all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const res = await api.post('users/reset-password', { token, newPassword: password });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        }
    };

    return (
        <div className="container py-5 h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card bg-dark text-white">
                        <div className="card-body p-3 text-center theme-custom">
                            <div className="mb-3">
                            <h2 className="fw-bold mb-2 text-uppercase">Reset Password</h2>
                                <p className="text-white-50">Enter your new password below.</p>

                                {/* Password input */}
                                <div className="form-outline form-white mb-3">
                                    <input
                                        type="password"
                                        name="Password"
                                        placeholder="New Password"
                                        value={password}
                                        onChange={onChange}
                                        className="form-control form-control-lg text-custom"
                                        style={{ fontSize: '16px', padding: '8px', width: '80%', margin: 'auto' }}
                                    />
                                </div>

                                {/* Confirm Password input */}
                                <div className="form-outline form-white mb-4">
                                    <input
                                        type="password"
                                        name="ConfirmPassword"
                                        placeholder="Re-Enter Password"
                                        value={confirmPassword}
                                        onChange={onChange}
                                        className="form-control form-control-lg text-custom"
                                        style={{ fontSize: '16px', padding: '8px', width: '80%', margin: 'auto' }}
                                    />
                            <PasswordChecklist
                                        rules={["minLength", "specialChar", "number", "capital", "match"]}
                                minLength={8}
                                value={password}
                                valueAgain={confirmPassword}
                                        onChange={(isValid) => {}}
                            />
                                </div>

                                {/* Error / Message */}
                            <div style={{ minHeight: '20px' }}>
                                {error && <p style={{ color: 'white' }}>{error}</p>}
                                {message && <p style={{ color: 'lightgreen' }}>{message}</p>}
                            </div>

                                {/* Reset Button */}
                            <button
                                className="btn btn-outline-light btn-lg px-5 theme-custom"
                                onClick={resetPassword}
                                type="submit"
                            >
                                Reset Password
                            </button>
                            </div>

                            <div>
                                <p className="mb-0">
                                    Remembered your password? <a href="/Login" className="text-white">Login</a>
                            </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
