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
    <div className="container py-5 h-100">
      <div className="row d-flex justify-content-center align-items-center h-100">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card bg-dark text-white">
            <div className="card-body p-3 text-center theme-custom">
              <h2 className="fw-bold mb-2 text-uppercase">Register</h2>
              <p className="text-white-50 mb-3">Create an account by filling out the fields below.</p>

              {['FirstName','LastName','Email','Password','ConfirmPassword'].map((field) => (
                <div className="form-outline form-white mb-3" key={field}>
                  <input
                    type={field.toLowerCase().includes('password') ? 'password' : 'text'}
                    name={field}
                    placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                    value={
                      field === 'FirstName' ? firstName :
                      field === 'LastName' ? lastName :
                      field === 'Email' ? email :
                      field === 'Password' ? password :
                      confirmPassword
                    }
                    onChange={onChange}
                    className="form-control form-control-lg text-custom"
                    style={{ fontSize: '16px', padding: '8px', width: '80%', margin: 'auto' }}
                  />
                </div>
              ))}

              <PasswordChecklist
                rules={["minLength","specialChar","number","capital","match"]}
                minLength={8}
                value={password}
                valueAgain={confirmPassword}
              />

              {error && <p style={{ color: 'white' }}>{error}</p>}

              <button className="btn btn-outline-light btn-lg px-5 theme-custom" onClick={register}>Register</button>

              <p className="mt-3 mb-0">Already have an account? <a href="/login" className="text-white">Login</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};