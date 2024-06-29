import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
var config = require('../config');

// This file contains the form the user sees when they register an account

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === 'Name') {
      setName(value);
    } else if (name === 'Email') {
      setEmail(value);
    } else if (name === 'Password') {
      setPassword(value);
    }
  };

   // Check if email is of valid format
  const validateEmail = (email) => {
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return regex.test(String(email).toLowerCase());
  };

  // Check if all fields are filled out
  const validateFields = (name, email, password) => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill out all fields.');
      return false;
    }
    return true;
  };

  const register = (event) => {
    event.preventDefault();

    if (!validateFields(name, email, password)) {
      return;
    }

    if (!validateEmail(email)) {
      console.log('Invalid email format.');
      setError('Invalid email format. Please enter a valid email.');
      return;
    }

    axios.post(config.API_URL + 'register', {
      "Name": name,
      "Email": email,
      "Password": password
    })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          setError('Registered.');
          navigate('/UserAccount'); // Redirect after successful registration
        }
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response && error.response.status === 400) {
          setError('Email is already registered. Try a new email or login to an existing account.');
        } else {
          setError('Registration failed. Please try again later.');
        }
      });
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

                {/*Name input*/}
                <div className="form-outline form-white mb-3">
                  <input type="text" name="Name" placeholder='Name' value={name} onChange={onChange} className="form-control form-control-lg" />
                </div>

                {/*Email input*/}
                <div className="form-outline form-white mb-3">
                  <input type="email" name="Email" placeholder='Email' value={email} onChange={onChange} className="form-control form-control-lg" />
                </div>

                {/*Password input*/}
                <div className="form-outline form-white mb-4">
                  <input type="password" name="Password" placeholder='Password' value={password} onChange={onChange} className="form-control form-control-lg" />
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
