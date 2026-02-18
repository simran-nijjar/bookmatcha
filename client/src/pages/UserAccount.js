import React, { useEffect, useState } from 'react';
import '../styles.css';
import PasswordChecklist from "react-password-checklist";
import api from '../api/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";

// On this page the user can update their informations

export const UserAccount = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nameUpdateStatus, setNameUpdateStatus] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newConfirmPassword, setNewConfirmPassword] = useState('');
    const [passwordUpdateStatus, setPasswordUpdateStatus] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);

    useEffect(() => {
        api.get('users/userid')
            .then((response) => {
                if (response.data) {
                    const user = response.data;
                    setUserInfo(user);
                    setUsername(user.username);
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                } else {
                    setUserInfo(null);
                }
            })
            .catch(() => setUserInfo(null))
            .finally(() => setLoading(false));
    }, []);

    const handleFirstNameChange = (e) => setFirstName(e.target.value);
    const handleLastNameChange = (e) => setLastName(e.target.value);
    const handleCurrentPasswordChange = (e) => setCurrentPassword(e.target.value);
    const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
    const handleNewConfirmPasswordChaange = (e) => setNewConfirmPassword(e.target.value);

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
            if (error.response?.status === 400) {
                setPasswordUpdateStatus('Current password does not match our records.');
            } else {
                setPasswordUpdateStatus('Updating password failed. Please try again later.');
            }
            return false;
        }
    };

    const validateNewPassword = () => {
        if (newPassword !== newConfirmPassword){
            setPasswordUpdateStatus('The new passwords do not match');
        }
        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,100}$/;
        return regex.test(newPassword);
    };

    const handleUpdatePassword = async () => {
        if (await validateCurrentPassword() && validateNewPassword()) {
            api.put('users/password', { newPassword })
                .then(() => setPasswordUpdateStatus('Password updated successfully!'))
                .catch(() => setPasswordUpdateStatus('Error updating password.'));
        }
    };

    if (loading) return <h1 className="title">Loading...</h1>;

    return (
        <div className="page-container">
            <h1 className="title">Hello {username || 'Guest'}!</h1>
            <p className="subtitle">Manage your BookMatcha account here.</p>

            <div className="account-grid">
                {/* Name Section */}
                <div className="account-card">
                    <h2 className="subtitle">Update Name</h2>

                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        className="form-control mb-3"
                    />
                    <button className="theme-custom" onClick={handleUpdateFirstName}>
                        Update First Name
                    </button>

                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={handleLastNameChange}
                        className="form-control mb-3"
                        style={{ marginTop: '12px' }}
                    />
                    <button className="theme-custom" onClick={handleUpdateLastName} style={{ marginTop: '8px' }}>
                        Update Last Name
                    </button>

                    {nameUpdateStatus && <p style={{ marginTop: '10px', color: '#44624a' }}>{nameUpdateStatus}</p>}
                </div>

                {/* Password Section */}
                <div className="account-card">
                    <h2 className="subtitle">Update Password</h2>

                    <div className="password-wrapper">
                        <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="Password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={handleCurrentPasswordChange}
                        className="form-control mb-3"
                        />
                        <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                        {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    <div className="password-wrapper">
                        <input
                        type={showNewPassword ? "text" : "password"}
                        name="Password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        className="form-control mb-3"
                        />
                        <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                        {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    <div className="password-wrapper">
                        <input
                        type={showNewConfirmPassword ? "text" : "password"}
                        name="Password"
                        placeholder="Confirm Password"
                        value={newConfirmPassword}
                        onChange={handleNewConfirmPasswordChaange}
                        className="form-control mb-3"
                        />
                        <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewConfirmPassword(!showNewConfirmPassword)}
                        >
                        {showNewConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    <PasswordChecklist
                        rules={["minLength", "specialChar", "number", "capital", "match"]}
                        minLength={8}
                        value={newPassword}
                        valueAgain={newConfirmPassword}
                        onChange={() => {}}
                        style={{ marginTop: '10px' }}
                        messages={{specialChar: "Password has a special character."}}
                    />

                    <button className="theme-custom" onClick={handleUpdatePassword} style={{ marginTop: '12px' }}>
                        Update Password
                    </button>

                    {passwordUpdateStatus && <p style={{ marginTop: '10px', color: '#44624a' }}>{passwordUpdateStatus}</p>}
                </div>
            </div>
        </div>
    );
};