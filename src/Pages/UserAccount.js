import React, { useEffect, useState } from 'react';
import axios from 'axios';
var config = require('../config');

export const UserAccount = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        
        if (savedUser) {
            axios.get(`${config.API_URL}fetchuserinfo`, {
                params: { Email: savedUser.email }
            })
            .then((response) => {
                if (response.data) {
                    const user = response.data;
                    setUserInfo(user);
                    setFirstName(user.FirstName);
                    setLastName(user.LastName);
                } else {
                    console.log("No user data found in the response.");
                    setUserInfo(null);
                }
            })
            .catch((error) => {
                console.log("Error fetching user info: ", error);
                setUserInfo(null);
            })
            .finally(() => {
                setLoading(false);
            });
        } else {
            console.log("No user data found in local storage.");
        }
    }, []);

    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
    };

    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
    };

    const handleUpdateFirstName = () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        
        if (savedUser) {
            axios.put(`${config.API_URL}updatefirstname`, {
                FirstName: firstName,
                Email: savedUser.email
            })
            .then((response) => {
                setUpdateStatus('FirstName updated successfully!');
            })
            .catch((error) => {
                console.log("Error updating first name: ", error);
                setUpdateStatus('Error updating first name.');
            });
        }
    };

    const handleUpdateLastName = () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        
        if (savedUser) {
            axios.put(`${config.API_URL}updatelastname`, {
                LastName: lastName,
                Email: savedUser.email
            })
            .then((response) => {
                setUpdateStatus('LastName updated successfully!');
            })
            .catch((error) => {
                console.log("Error updating last name: ", error);
                setUpdateStatus('Error updating last name.');
            });
        }
    };

    if (loading) {
        return <h1>Loading...</h1>;
    }

    return (
        <div>
            <h1>Hello {userInfo ? userInfo.FirstName : 'Guest'}!</h1>
            <h3>Here you can make changes to your MyLibrary account</h3>

            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card bg-dark text-white">
                            <div className="card-body p-5 text-center">
                                <div className="mb-md-5 mt-md-4 pb-5">
                                    <h2 className="fw-bold mb-2 text-uppercase">Update Profile</h2>
                                    <p>Here you can change your basic information.</p>

                                    <div className="form-outline form-white mb-3">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            name="FirstName"
                                            value={firstName}
                                            onChange={handleFirstNameChange}
                                            className="form-control form-control-lg"
                                        />
                                        <button
                                            className="btn btn-outline-light btn-lg px-5 mt-3"
                                            type="button"
                                            onClick={handleUpdateFirstName}
                                        >
                                            Update First Name
                                        </button>
                                    </div>

                                    <div className="form-outline form-white mb-3">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            name="LastName"
                                            value={lastName}
                                            onChange={handleLastNameChange}
                                            className="form-control form-control-lg"
                                        />
                                        <button
                                            className="btn btn-outline-light btn-lg px-5 mt-3"
                                            type="button"
                                            onClick={handleUpdateLastName}
                                        >
                                            Update Last Name
                                        </button>
                                    </div>

                                    {updateStatus && <p>{updateStatus}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
