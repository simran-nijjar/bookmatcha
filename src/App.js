import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {BrowserRouter, Route, Routes } from 'react-router-dom';
import {Login} from "./Pages/Login";

function App() {
  return (
    <BrowserRouter>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
  <div className="container-fluid">
    <a className="navbar-brand" href="#">My Library</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav">
      {/*My Books*/}
      <li class="nav-item">
          <a class="nav-link" href="#">My Books</a>
        </li>

        {/*Login*/}
        <li className="nav-item">
          <a className="nav-link" aria-current="page" href="/Login">Login</a>
        </li>

        {/*Register*/}
        <li className="nav-item">
          <a className="nav-link" href="#">Register</a>
        </li>
      </ul>
    </div>
    <form className="d-flex form-inline my-2 my-lg-0">
      <input className="form-control me-sm-2" type="search" placeholder="Search Books" aria-label="Search"/>
      <button className="btn btn-outline-light" type="submit">Search</button>
    </form>
  </div>
</nav>
<Routes>
      <Route path="/Login" element={<Login />} />
    </Routes>
</BrowserRouter>
  );
}

export default App;
