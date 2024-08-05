import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css'

// This file handles the users query in the search bar

export default function SearchBar({ query, onQueryChange, onSearch }) {
    const navigate = useNavigate();

    // Navigates to book results page
    const handleSearch = async (event) => {
        await onSearch(event);
        navigate('/BookResults');
    };

    return (
        <form className="d-flex form-inline my-2 my-lg-0 theme-custom" onSubmit={handleSearch}>
        <input  className="form-control me-sm-2 text-custom" type="search" placeholder="Search Books" aria-label="Search" value={query} onChange={onQueryChange} />
      <button className="btn btn-outline-light theme-custom" type="submit">Search</button>
    </form>
    )
}