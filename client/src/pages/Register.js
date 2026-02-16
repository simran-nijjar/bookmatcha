import React, { useState } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
import PasswordChecklist from "react-password-checklist";
import api from '../api/api'; // your axios instance

export const Register = ({ onLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === 'FirstName') {
      setFirstName(value);
    } else if (name === 'LastName') {
      setLastName(value);
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
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,100}$/
    return regex.test(String(password));
  };

  // Check if all fields are filled out
  const validateFields = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill out all fields.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!validatePassword()){
      setError('Password does not meet requirements');
      return false;
    }
    return true;
  };

  // Method to handle register 
  const register = async (event) => {
    event.preventDefault();

    if (!validateFields()) {
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format. Please enter a valid email.');
      return;
    }

    // If all fields are valid, insert into backend
    try {
      const res = await api.post('users', { firstName, lastName, email, password });
      if (res.status === 201) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        onLogin?.();
        navigate('/homepage');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Email is already registered. Try a new email or login.');
      } else {
        setError('Registration failed. Please try again later.');
      }
    }
  };

  return (
  <div className="page-container">

    <h1 className="title">Register</h1>
    <p className="subtitle">
      Create your bookmatcha account
    </p>

    <div className="auth-wrapper">
      <div className="auth-card">

        <input
          type="text"
          name="FirstName"
          placeholder="First Name"
          value={firstName}
          onChange={onChange}
          className="form-control mb-3"
        />

        <input
          type="text"
          name="LastName"
          placeholder="Last Name"
          value={lastName}
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

        <input
          type="password"
          name="Password"
          placeholder="Password"
          value={password}
          onChange={onChange}
          className="form-control mb-3"
        />

        <input
          type="password"
          name="ConfirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={onChange}
          className="form-control mb-3"
        />

        <div className="password-checklist-wrapper">
          <PasswordChecklist
            rules={["minLength","specialChar","number","capital","match"]}
            minLength={8}
            value={password}
            valueAgain={confirmPassword}
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
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>

      </div>
    </div>

  </div>
);
};