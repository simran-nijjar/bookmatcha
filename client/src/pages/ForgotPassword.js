import React, { useState } from 'react';
import '../styles.css';
import api from '../api/api';

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
      const res = await api.post('users/request-password-reset', { email });

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
    <div className="page-container">
      <h1 className="title">Reset Your Password</h1>
      <p className="subtitle">
        Enter your email below to receive instructions to reset your password.
      </p>

      <div className="auth-wrapper">
        <div className="auth-card">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={onChange}
            className="auth-input"
          />

          <div className="auth-message">
            {message && <p className="success-text">{message}</p>}
            {error && <p className="error-text">{error}</p>}
          </div>

          <button
            className="theme-custom auth-button"
            onClick={requestPasswordReset}
          >
            Reset
          </button>

          <div className="auth-links">
            <p>
              Remembered your password? <a href="/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};