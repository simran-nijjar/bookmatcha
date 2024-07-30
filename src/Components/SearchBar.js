import React from 'react';
import { useNavigate } from 'react-router-dom';

// This file handles the users query in the search bar

export default function SearchBar({ query, onQueryChange, onSearch }) {
    const navigate = useNavigate();

    // Navigates to book results page
    const handleSearch = async (event) => {
        await onSearch(event);
        navigate('/BookResults');
    };

    return (
        <form className="d-flex form-inline my-2 my-lg-0" onSubmit={handleSearch}>
        <input  className="form-control me-sm-2" type="search" placeholder="Search Books" aria-label="Search" value={query} onChange={onQueryChange} />
      <button className="btn btn-outline-light" type="submit">Search</button>
    </form>
    )
}