import React from 'react';
import { useNavigate } from "react-router-dom";

// This is the first page the user sees when they view the website if they are not logged in

export const LandingPage = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/Login');
    };

    const handleRegisterClick = () => {
        navigate('/Register');
    };
    return (
        <div className="container py-5 h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card bg-dark text-white">
                        <div className="card-body p-5 text-center">
                            <div className="mb-md-5 mt-md-4 pb-5">
                            <h2 className="fw-bold mb-2">Welcome to My Library!</h2>
                            <p className="text-white-50">Login or register to start adding books to your library.</p> <br></br>
                                <div class="btn-group">
                            <button className="btn btn-outline-light btn-lg px-5 mb-4" type="submit" onClick={handleLoginClick}>Login</button>
                            <br></br>
                            <button className="btn btn-outline-light btn-lg px-5 mb-4" type="submit" onClick={handleRegisterClick}>Register</button>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}