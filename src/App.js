import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { UserAccount } from './Pages/UserAccount';
import { LandingPage } from './Pages/LandingPage';
import { BookResults } from './Pages/BookResults';
import SearchBar from './Components/SearchBar';
const config = require('./config');

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const fetchResults = async (query, startIndex = 0) => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&key=${config.API_KEY}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      setResults(result.items || []);
      console.log(result);
    } catch (error) {
      console.error('Error fetching from Google Books API', error);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setCurrentPage(1);
    await fetchResults(query);
  };

  const handleNextPage = async () => {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * 10;
    await fetchResults(query, startIndex);
    setCurrentPage(nextPage);
  };

  const handlePrevPage = async () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const startIndex = (prevPage - 1) * 10;
      await fetchResults(query, startIndex);
      setCurrentPage(prevPage);
    }
  };

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand">My Library</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav"></ul>
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
                <SearchBar query={query} onQueryChange={handleQueryChange} onSearch={handleSearch} />
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
        <Route path="/BookResults" element={<BookResults results={results} query={query} onNextPage={handleNextPage} onPrevPage={handlePrevPage} currentPage={currentPage} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
