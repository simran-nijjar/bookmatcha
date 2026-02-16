import React, { useState } from 'react';
import '../styles.css';
import { useNavigate } from "react-router-dom";
import api from '../api/api';

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

    // Method to handle login
    const login = async (event) => {
        event.preventDefault();
        
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            const res = await api.post('users/login', { email, password });

            if (res.status === 200) {
                const token = res.data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('isLoggedIn', 'true');

                setError('Logged in successfully.');
                onLogin?.();
                navigate("/homepage");
            }
        } catch (err) {
            if (err.response?.status === 400) {
                setError('The email and password you entered do not match our records.');
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
          type="email"
          name="Email"
          placeholder="Email"
          value={email}
          onChange={onChange}
          className="form-control mb-3"
        />

        <input
          type="password"
          name="Password"
          placeholder="Password"
          value={password}
          onChange={onChange}
          className="form-control mb-3"
        />

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
          <p>
            Forgot password? <a href="/forgotpassword">Reset</a>
          </p>
          <p>
            Don’t have an account? <a href="/register">Register</a>
          </p>
        </div>

      </div>
    </div>

  </div>
);

};