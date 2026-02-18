import React, { useRef, useState } from 'react';
import '../styles.css';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('pending');
    const hasRun = useRef(false);

    const handleVerify = async () => {
        if (hasRun.current) return;
        hasRun.current = true;

        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            return;
        }

        setStatus('verifying');
        api.post('users/verify-email', { token })
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    };

    return (
        <div className="page-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    {status === 'pending' && (
                        <>
                            <h1 className="title">Verify your email</h1>
                            <p className="subtitle">Click the button below to verify your account.</p>
                            <button className="theme-custom w-100" onClick={handleVerify}>
                                Verify Email
                            </button>
                        </>
                    )}
                    {status === 'verifying' && <p>Verifying your email...</p>}
                    {status === 'success' && (
                        <>
                            <h1 className="title">Email verified!</h1>
                            <p className="subtitle">Your account is now active.</p>
                            <a href="/login">
                                <button className="theme-custom w-100">Go to Login</button>
                            </a>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <h1 className="title">Verification failed</h1>
                            <p className="subtitle">This link is invalid or has expired.</p>
                            <a href="/verify-email-sent">
                                <button className="theme-custom w-100">Resend verification email</button>
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};