import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { UserAccount } from './pages/UserAccount';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmailSent } from './pages/VerifyEmailSent';
import { VerifyEmail } from './pages/VerifyEmail';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { BookResults } from './pages/BookResults';
import { BookDetails } from './pages/BookDetails';
import { UserBooks } from './pages/UserBooks';
import { ShelfDetail } from './pages/ShelfDetail';
import { UserReview } from './pages/UserReview';
import { BookRecommendations } from './pages/BookRecommendations';
import SearchBar from './components/SearchBar';
import './styles.css';
import api from './api/api';
import { handleQueryChange, handleSearch, handleNextPage, handlePrevPage } from './components/SearchUtilities';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Check login status by hitting the backend, not localStorage
  useEffect(() => {
  api.get('users/userid')
    .then(() => setIsLoggedIn(true))
    .catch(() => setIsLoggedIn(false))
    .finally(() => setAuthLoading(false));
}, []);

if (authLoading) {
  return null;
}

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('users/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggedIn(false);
      window.location.href = '/';
    }
  };

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg cozy-navbar">
        <div className="container-fluid navbar-inner">

          <Link className="navbar-brand brand-logo" to={isLoggedIn ? "/home" : "/"}>
            bookmatcha
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav nav-links">
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link cozy-link" to="/recommendations">
                      Recommendations
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link cozy-link" to="/shelf">
                      My Bookshelf
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link cozy-link" to="/account">
                      My Account
                    </Link>
                  </li>

                  <li className="nav-item">
                    <button
                      className="nav-link cozy-link logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>

            {isLoggedIn && (
              <div className="ms-auto search-wrapper">
                <SearchBar
                  query={query}
                  onQueryChange={(event) => handleQueryChange(event, setQuery)}
                  onSearch={(event) =>
                    handleSearch(event, query, setResults, setTotalPages, setCurrentPage)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/account" element={<UserAccount onLogout={handleLogout} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <LandingPage />} />
        <Route path="/books/search" element={<BookResults
          results={results}
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={() => handleNextPage(currentPage, query, setResults, setCurrentPage)}
          onPrevPage={() => handlePrevPage(currentPage, query, setResults, setCurrentPage)}
        />} />
        <Route path="/shelf" element={<UserBooks />} />
        <Route path="/shelf/:shelfSlug" element={<ShelfDetail />} />
        <Route path="/review/:bookId" element={<UserReview />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/recommendations" element={<BookRecommendations />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
