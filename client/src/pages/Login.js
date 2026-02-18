import React, { useState } from 'react';
import '../styles.css';
import { useNavigate } from "react-router-dom";
import api from '../api/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";

// This file contains the form the user sees when they login and the login processes

export const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const onChange = (event) => {
        const { name, value } = event.target;
        if (name === 'Username') {
            setUsername(value.includes('@') ? value : value.toLowerCase());
        } else if (name === 'Password') {
            setPassword(value);
        }
    };

    // Method to handle login
    const login = async (event) => {
        event.preventDefault();

        if (!username || !password) {
            setError('Please enter both username or email and password.');
            return;
        }
        if (username.includes('@')) {
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
            if (!emailRegex.test(username)) {
                setError('Please enter a valid email address.');
                return;
            }
        }
        try {
            const res = await api.post('users/login', { username, password });

            if (res.status === 200) {
                onLogin?.();
                navigate("/home");
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Please verify your email before logging in. Check your inbox.');
            } else if (err.response?.status === 404) {
                setError('The username and password you entered do not match our records.');
            } else {
                setError('Login failed. Please try again later.');
            }
        }
    };

    return (
        <div className="page-container">

            <h1 className="title">Login</h1>
            <p className="subtitle">Welcome back to bookmatcha</p>

            <div className="auth-wrapper">
                <div className="auth-card">

                    <input
                        type="text"
                        name="Username"
                        placeholder="Username or Email"
                        value={username}
                        onChange={onChange}
                        className="form-control mb-3"
                    />

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="Password"
                            placeholder="Password"
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

                    <div className="auth-message">
                        {error && <p>{error}</p>}
                    </div>

                    <button
                        className="theme-custom w-100"
                        onClick={login}
                    >
                        Login
                    </button>

                    <div className="auth-links">
                        <p>Forgot password? <a href="/forgot-password">Reset</a></p>
                        <p>Don't have an account? <a href="/register">Register</a></p>
                    </div>

                </div>
            </div>

        </div>
    );
};