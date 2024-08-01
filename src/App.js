import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { UserAccount } from './Pages/UserAccount';
import { LandingPage } from './Pages/LandingPage';
import { BookResults } from './Pages/BookResults';
import { BookDetails } from './Pages/BookDetails';
import { HomePage } from './Pages/HomePage';
import { BookRecommendations } from './Pages/BookRecommendations';
import SearchBar from './Components/SearchBar';
import { handleQueryChange, handleSearch, handleNextPage, handlePrevPage } from './Components/SearchUtilities';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    } else {
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

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to={isLoggedIn ? "/HomePage" : "/"}>My Library</Link>
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
                  <a className="nav-link" href="/BookRecommendations">Recommendations</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/UserAccount">My Account</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/" onClick={handleLogout}>Logout</a>
                </li>
                <SearchBar query={query} onQueryChange={(event) => handleQueryChange(event, setQuery)} onSearch={(event) => handleSearch(event, query, setResults, setTotalPages, setCurrentPage)} />
              </>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/Login" element={<Login onLogin={handleLogin} />} />
        <Route path="/Register" element={<Register onLogin={handleLogin} />} />
        <Route path="/UserAccount" element={<UserAccount onLogout={handleLogout} />} />
        <Route path="/" element={isLoggedIn ? <Navigate to="/HomePage" /> : <LandingPage />} />
        <Route path="/BookResults" element={<BookResults results={results} currentPage={currentPage} totalPages={totalPages} onNextPage={() => handleNextPage(currentPage, query, setResults, setCurrentPage)} onPrevPage={() => handlePrevPage(currentPage, query, setResults, setCurrentPage)} />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/BookRecommendations" element={<BookRecommendations />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
