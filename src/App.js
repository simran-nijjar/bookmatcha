import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useState, useEffect} from 'react';
import {BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import {Login} from "./Pages/Login";
import {Register} from "./Pages/Register";
import { UserAccount } from './Pages/UserAccount';
import { LandingPage } from './Pages/LandingPage';
import { BookResults } from './Pages/BookResults';
const config = require('./config');

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    console.log("isloggedin: ", isLoggedIn);
    if (token) {
      setIsLoggedIn(true);
    } else{
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear localStorage and reset isLoggedIn state
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  }

  return (
    <BrowserRouter>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
  <div className="container-fluid">
    <a className="navbar-brand">My Library</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav">
      </ul>
    </div>
    <div className="navbar-nav ml-auto">
      {isLoggedIn && (
        <>
          <li className="nav-item">
            <a className="nav-link" href="/UserAccount">My Account</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/" onClick={handleLogout}>Logout</a>
          </li>
          <form className="d-flex form-inline my-2 my-lg-0">
            <input className="form-control me-sm-2" type="search" placeholder="Search Books" aria-label="Search" value={query} onChange={handleQueryChange}/>
            <button className="btn btn-outline-light" type="submit">Search</button>
          </form>
        </>
      )}
    </div>
  </div>
</nav>
<Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Login" element={<Login onLogin={handleLogin} />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/UserAccount" element={<UserAccount onLogout={handleLogout} />} />
      <Route path="/" element={<Navigate to={isLoggedIn ? "/UserAccount" : "/LandingPage"} />} />
      <Route path="/BookResults" element={BookResults} />
</Routes>
</BrowserRouter>
  );
}

export default App;
