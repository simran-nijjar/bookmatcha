import React, { useState } from 'react';
import '../styles.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PasswordChecklist from 'react-password-checklist';
import api from '../api/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  <div className="page-container">

    <h1 className="title">Reset Password</h1>
    <p className="subtitle">
      Choose a new password for your account.
    </p>

    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="password-wrapper">
            <input
                type={showPassword ? "text" : "password"}
                name="Password"
                placeholder="New Password"
                value={password}
                onChange={onChange}
                className="form-control mb-3"
            />
            <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
        </div>

        <div className="password-wrapper">
            <input
                type={showConfirmPassword ? "text" : "password"}
                name="ConfirmPassword"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={onChange}
                className="form-control mb-3"
            />
            <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
        </div>

        <div className="password-checklist-wrapper">
          <PasswordChecklist
            rules={["minLength", "specialChar", "number", "capital", "match"]}
            minLength={8}
            value={password}
            valueAgain={confirmPassword}
            messages={{specialChar: "Password has a special character."}}
          />
        </div>

        <div className="auth-message">
          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}
        </div>

        <button
          className="theme-custom auth-button"
          onClick={resetPassword}
        >
          Reset Password
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