import React, { useEffect, useState } from 'react';
import '../styles.css';
import PasswordChecklist from "react-password-checklist";
import api from '../api/api';

// On this page the user can update their informations

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
        api.get('users/userid')
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
    }, []);

    const handleFirstNameChange = (event) => setFirstName(event.target.value);
    const handleLastNameChange = (event) => setLastName(event.target.value);
    const handleCurrentPasswordChange = (event) => setCurrentPassword(event.target.value);
    const handleNewPasswordChange = (event) => setNewPassword(event.target.value);

    const handleUpdateFirstName = () => {
        api.put('users/userid', { firstName })
            .then(() => setNameUpdateStatus('First name updated successfully!'))
            .catch(() => setNameUpdateStatus('Error updating first name.'));
    };

    const handleUpdateLastName = () => {
        api.put('users/userid', { lastName })
            .then(() => setNameUpdateStatus('Last name updated successfully!'))
            .catch(() => setNameUpdateStatus('Error updating last name.'));
    };

    const validateCurrentPassword = async () => {
        try {
            const res = await api.post('users/validate-password', { password: currentPassword });
            return res.status === 200;
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setPasswordUpdateStatus('The current password you entered does not match our records.');
            } else {
                setPasswordUpdateStatus('Updating password failed. Please try again later.');
            }
            return false;
        }
    };

    const validateNewPassword = () => {
        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,100}$/;
        return regex.test(String(newPassword));
    };

    const handleUpdatePassword = async () => {
        if (await validateCurrentPassword() && validateNewPassword()) {
            api.put('users/password', { newPassword })
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