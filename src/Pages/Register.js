import React, { useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
var config = require('../config');

// This file contains the form the user sees when they register an account

export const Register = () => {
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
      const res = await axios.post(`${config.API_URL}register`, {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Password: password
      });

      if (res.status === 200) {
        const token = res.data.token;
        localStorage.setItem('token', token);

        // Decode the token
        const decodedToken = jwtDecode(token);
        console.log("decodedToken: ", decodedToken);

        // Store user info in local storage
        localStorage.setItem('user', JSON.stringify({
          email: decodedToken.email,
          firstName: decodedToken.firstName,
          lastName: decodedToken.lastName
        }));

        setError('Registered successfully.');
        navigate('/UserAccount'); // Redirect after successful registration
      }
    } catch (error) {
      console.log(error.response);
      if (error.response && error.response.status === 400) {
        setError('Email is already registered. Try a new email or login to an existing account.');
      } else {
        setError('Registration failed. Please try again later.');
      }
    }
  };

  return (
    <div className="container py-5 h-100">
      <div className="row d-flex justify-content-center align-items-center h-100">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card bg-dark text-white">
            <div className="card-body p-5 text-center">
              <div className="mb-md-5 mt-md-4 pb-5">
                <h2 className="fw-bold mb-2 text-uppercase">Register</h2>
                <p className="text-white-50">Create an account by filling out the fields below.</p>

                {/* FirstName input */}
                <div className="form-outline form-white mb-3">
                  <input type="text" name="FirstName" placeholder='First Name' value={firstName} onChange={onChange} className="form-control form-control-lg" />
                </div>

                {/* LastName input */}
                <div className="form-outline form-white mb-3">
                  <input type="text" name="LastName" placeholder='Last Name' value={lastName} onChange={onChange} className="form-control form-control-lg" />
                </div>

                {/* Email input */}
                <div className="form-outline form-white mb-3">
                  <input type="email" name="Email" placeholder='Email' value={email} onChange={onChange} className="form-control form-control-lg" />
                </div>

                {/* Password input */}
                <div className="form-outline form-white mb-3">
                  <input type="password" name="Password" placeholder='Password' value={password} onChange={onChange} className="form-control form-control-lg" />
                </div>

                {/* Confirm password input */}
                <div className="form-outline form-white mb-4">
                  <input type="password" name="ConfirmPassword" placeholder='Re-Enter Password' value={confirmPassword} onChange={onChange} className="form-control form-control-lg" />
                </div>

                {/* Error message */}
                <div style={{ minHeight: '20px' }}>
                  {error && <p style={{ color: 'white' }}>{error}</p>}
                </div>

                <button className="btn btn-outline-light btn-lg px-5" onClick={register} type="submit">Register</button>
              </div>

              <div>
                <p className="mb-0">Already have an account? <a href="/Login" className="text-blue-50">Login</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
