import React from 'react';
import '../styles.css';
import { useNavigate } from "react-router-dom";

// This is the first page the user sees when they view the website if they are not logged in

export const LandingPage = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

return (
  <div className="page-container">

    <div className="landing-content">
      <h1 className="title">Welcome to bookmatcha</h1>
      <p className="subtitle">
        Login or register to start getting matcha-ed with books.
      </p>

      <div className="landing-buttons">
        <button
          className="theme-custom"
          onClick={handleLoginClick}
        >
          Login
        </button>

        <button
          className="theme-custom"
          onClick={handleRegisterClick}
        >
          Register
        </button>
      </div>
    </div>

  </div>
);

};