import React, { useState } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
import PasswordChecklist from "react-password-checklist";
import api from '../api/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const Register = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const onChange = (event) => {
        const { name, value } = event.target;
        if (name === 'Username') {
            setUsername(value.toLowerCase());
        } else if (name === 'Email') {
            setEmail(value);
        } else if (name === 'Password') {
            setPassword(value);
        } else if (name === 'ConfirmPassword') {
            setConfirmPassword(value);
        }
    };

  // Check if email is of valid format
    const validateEmail = (email) => {
        const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        return regex.test(String(email).toLowerCase());
    };

  // Check if password meets the requirements
  // Length 8-100, must include at least one number, one special character, and one capital letter
    const validatePassword = () => {
        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,100}$/;
        return regex.test(String(password));
    };

    const validateUsername = () => {
        const trimmed = username.trim();
        if (trimmed.length < 3 || trimmed.length > 20) {
            setError('Username must be between 3-20 characters');
            return false;
        }
  const regex = /^[a-z0-9._]+$/; // only lowercase letters, numbers, . and _
        if (!regex.test(trimmed)) {
            setError('Username can only contain letters, numbers, dots, and underscores');
            return false;
        }
        return true;
    };

  // Check if all fields are filled out
    const validateFields = () => {
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Please fill out all fields.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        if (!validatePassword()) {
            setError('Password does not meet requirements');
            return false;
        }
        if (!validateUsername()) {
            return false;
        }
        return true;
    };

    const register = async (event) => {
        event.preventDefault();

        if (!validateFields()) {
        return;
        }
        if (!validateEmail(email)) {
            setError('Invalid email format. Please enter a valid email.');
            return;
        }
        try {
            const res = await api.post('users', { username, email, password });
            if (res.status === 201) {
                localStorage.setItem('pendingVerificationEmail', email);
                navigate('/verify-email-sent');
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Username or email is already registered. Try a different username or email.');
            } else {
                setError('Registration failed. Please try again later.');
            }
        }
    };

    return (
        <div className="page-container">

            <h1 className="title">Register</h1>
            <p className="subtitle">Create your bookmatcha account</p>

            <div className="auth-wrapper">
                <div className="auth-card">

                    <input
                        type="text"
                        name="Username"
                        placeholder="Username"
                        value={username}
                        onChange={onChange}
                        className="form-control mb-3"
                    />

                    <input
                        type="email"
                        name="Email"
                        placeholder="Email"
                        value={email}
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

                    <div className="password-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="ConfirmPassword"
                            placeholder="Confirm Password"
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
            rules={["minLength","specialChar","number","capital","match"]}
                            minLength={8}
                            value={password}
                            valueAgain={confirmPassword}
            messages={{specialChar: "Password has a special character."}}
                        />
                    </div>

                    <div className="auth-message">
                        {error && <p>{error}</p>}
                    </div>

                    <button
                        className="theme-custom w-100"
                        onClick={register}
                    >
                        Register
                    </button>

                    <div className="auth-links">
                        <p>Already have an account? <a href="/login">Login</a></p>
                    </div>

                </div>
            </div>

        </div>
    );
};