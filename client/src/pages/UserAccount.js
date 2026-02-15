import React, { useEffect, useState } from 'react';
import '../styles.css';
import axios from 'axios';
import PasswordChecklist from "react-password-checklist";

// On this page the user can update their first and last name

export const UserAccount = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nameUpdateStatus, setNameUpdateStatus] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordUpdateStatus, setPasswordUpdateStatus] = useState('');

    useEffect(() => {
        // Get user information from local storage
        const savedUser = JSON.parse(localStorage.getItem('user'));
        
        if (savedUser) {
            // Get user information from the backend
            axios.get(`${process.env.REACT_APP_API_URL}users/userid`, {
                params: { userId: savedUser.userId }
            })
            .then((response) => {
                if (response.data) {
                    const user = response.data;
                    setUserInfo(user);
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                } else {
                    setUserInfo(null);
                }
            })
            .catch(() => setUserInfo(null))
            .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const handleFirstNameChange = (event) => setFirstName(event.target.value);
    const handleLastNameChange = (event) => setLastName(event.target.value);
    const handleCurrentPasswordChange = (event) => setCurrentPassword(event.target.value);
    const handleNewPasswordChange = (event) => setNewPassword(event.target.value);

    // Method to handle first name update
    const handleUpdateFirstName = () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
            axios.put(`${process.env.REACT_APP_API_URL}users/userid`, {
                firstName: firstName,
                userId: savedUser.userId
            })
            .then(() => setNameUpdateStatus('First name updated successfully!'))
            .catch(() => setNameUpdateStatus('Error updating first name.'));
        }
    };

    // Method to handle last name update
    const handleUpdateLastName = () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
            axios.put(`${process.env.REACT_APP_API_URL}users/userid`, {
                lastName: lastName,
                userId: savedUser.userId
            })
            .then(() => setNameUpdateStatus('Last name updated successfully!'))
            .catch(() => setNameUpdateStatus('Error updating last name.'));
        }
    };

    // Check if the user's current password is correct
    const validateCurrentPassword = async () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
            try {
                const res = await axios.post(`${process.env.REACT_APP_API_URL}users/validate-password`, {
                    userId: savedUser.userId,
                    password: currentPassword
                });
                return res.status === 200;
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    setPasswordUpdateStatus('The current password you entered does not match our records.');
                } else {
                    setPasswordUpdateStatus('Updating password failed. Please try again later.');
                }
                return false;
            }
        }
    };

    // Check if password meets requirements
    const validateNewPassword = () => {
        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,100}$/;
        return regex.test(String(newPassword));
    };

    // Method to update password
    const handleUpdatePassword = async () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser && await validateCurrentPassword() && validateNewPassword()) {
            axios.put(`${process.env.REACT_APP_API_URL}users/password`, {
                newPassword: newPassword,
                userId: savedUser.userId
            })
            .then(() => setPasswordUpdateStatus('Password updated successfully!'))
            .catch(() => setPasswordUpdateStatus('Error updating password.'));
        }
    };

    if (loading) return <h1>Loading...</h1>;

    return (
        <div>
            <h1 className="title">Hello {firstName ? firstName : 'Guest'}!</h1>
            <h3 className="subtitle">Here you can make changes to your bookmatcha account</h3>

            <div className="container py-5 h-100">
                <div className="row d-flex h-100">
                    {/* Name Section */}
                    <div className="col-md-6 d-flex align-items-stretch">
                        <div className="card bg-dark text-white w-100 d-flex flex-column">
                            <div className="card-body p-3 text-center theme-custom flex-grow-1">
                                <div className="mb-md-5 mt-md-4 pb-5">
                                    <h2 className="fw-bold mb-2 text-uppercase">Update Name</h2>
                                    <p>Here you can change your first and last name.</p>

                                    <div className="form-outline form-white mb-3">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            name="FirstName"
                                            value={firstName}
                                            onChange={handleFirstNameChange}
                                            className="form-control form-control-lg text-custom"
                                        />
                                        <button
                                            className="btn btn-outline-light btn-lg px-5 mt-3 theme-custom"
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
                                            className="form-control form-control-lg text-custom"
                                        />
                                        <button
                                            className="btn btn-outline-light btn-lg px-5 mt-3 mb-5 theme-custom"
                                            type="button"
                                            onClick={handleUpdateLastName}
                                        >
                                            Update Last Name
                                        </button>
                                    </div>
                                    {nameUpdateStatus && <p>{nameUpdateStatus}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="col-md-6 d-flex align-items-stretch">
                        <div className="card bg-dark text-white w-100 d-flex flex-column">
                            <div className="card-body p-3 text-center theme-custom flex-grow-1">
                                <div className="mb-md-5 mt-md-4 pb-5">
                                    <h2 className="fw-bold mb-2 text-uppercase">Update Password</h2>
                                    <p>Here you can change your password.</p>

                                    <div className="form-outline form-white mb-3">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            name="CurrentPassword"
                                            value={currentPassword}
                                            onChange={handleCurrentPasswordChange}
                                            className="form-control form-control-lg text-custom"
                                        />

                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="NewPassword"
                                            value={newPassword}
                                            onChange={handleNewPasswordChange}
                                            className="form-control form-control-lg text-custom"
                                        />

                                        <PasswordChecklist
                                            rules={["minLength","specialChar","number","capital"]}
                                            minLength={8}
                                            value={newPassword}
                                            onChange={(isValid) => {}}
                                        />

                                        <button
                                            className="btn btn-outline-light btn-lg px-5 mt-3 theme-custom"
                                            type="button"
                                            onClick={handleUpdatePassword}
                                        >
                                            Update Password
                                        </button>
                                    </div>

                                    {passwordUpdateStatus && <p>{passwordUpdateStatus}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
