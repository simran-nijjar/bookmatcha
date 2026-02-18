import React from 'react';
import '../styles.css';
import api from '../api/api';

export const VerifyEmailSent = () => {

    const resendEmail = async () => {
        const email = localStorage.getItem('pendingVerificationEmail');
        if (!email) return;

        try {
            await api.post('users/resend-verification', { email });
            alert('Verification email resent. Please check your inbox.');
        } catch (err) {
            alert('Failed to resend. Please try again later.');
        }
    };

    return (
        <div className="page-container">
            <h1 className="title">Check your email</h1>
            <p className="subtitle">We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.</p>

            <div className="auth-wrapper">
                <div className="auth-card">
                    <p style={{ textAlign: 'center' }}>Didn't receive an email?</p>
                    <button className="theme-custom w-100" onClick={resendEmail}>
                        Resend verification email
                    </button>
                    <div className="auth-links">
                        <p>Already verified? <a href="/login">Login</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};