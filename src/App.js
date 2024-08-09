import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { UserAccount } from './Pages/UserAccount';
import { LandingPage } from './Pages/LandingPage';
import { HomePage } from './Pages/HomePage';
import { BookResults } from './Pages/BookResults';
import { BookDetails } from './Pages/BookDetails';
import { UserBooks } from './Pages/UserBooks';
import { BookRecommendations } from './Pages/BookRecommendations';
import SearchBar from './Components/SearchBar';
import './styles.css'
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
      <nav className="navbar navbar-expand-lg theme-custom">
        <div className="container-fluid">
          <Link className="navbar-brand theme-custom" to={isLoggedIn ? "/HomePage" : "/"}>bookmatcha</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse theme-custom" id="navbarNav">
            <ul className="navbar-nav theme-custom">
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link theme-custom" to="/BookRecommendations">Recommendations</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link theme-custom" to="/UserBooks">My Books</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link theme-custom" to="/UserAccount">My Account</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link theme-custom" to="/" onClick={handleLogout}>Logout</Link>
                  </li>
                </>
              )}
            </ul>
            {isLoggedIn && (
              <div className="ms-auto">
                <SearchBar className="theme-custom"
                  query={query}
                  onQueryChange={(event) => handleQueryChange(event, setQuery)}
                  onSearch={(event) => handleSearch(event, query, setResults, setTotalPages, setCurrentPage)} 
                />
              </div>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/Login" element={<Login onLogin={handleLogin} />} />
        <Route path="/Register" element={<Register onLogin={handleLogin} />} />
        <Route path="/UserAccount" element={<UserAccount onLogout={handleLogout} />} />
        <Route path="/" element={isLoggedIn ? <Navigate to="/HomePage" /> : <LandingPage />} />
        <Route path="/BookResults" element={<BookResults 
          results={results} 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onNextPage={() => handleNextPage(currentPage, query, setResults, setCurrentPage)} 
          onPrevPage={() => handlePrevPage(currentPage, query, setResults, setCurrentPage)} 
        />} />
        <Route path="/UserBooks" element={<UserBooks />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/BookRecommendations" element={<BookRecommendations />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
