import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './Navbar.css';
import logo from "./images/logo.png";

const Navbar = () => {
    const { user, setUser, loading } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('UserID');
        localStorage.removeItem('username');
        setUser(null);
        navigate('/');
    };

    if (loading) {
        return null; // Optionally, return a loading spinner here
    }

    return (
        <nav className="navbar">
            <div className="logocontainer">
                <img src={logo} alt="myHalal Checker Logo" className="logo1" />
                <h4>myHalal Checker</h4>
            </div>
            <div className="links">
                <Link to="/home">Home</Link>
                <Link to="/report">Report</Link>
                <Link to="/enquiry">Enquiry</Link>
                <Link to="/data">Data</Link>
                <Link to="/verifyData">Verify Data</Link>
                {user && (
                    <div className="dropdown">
                        <button className="dropbtn">{user.username}</button>
                        <div className="dropdown-content">
                            <Link to="/profile">Profile</Link>
                            <button onClick={handleLogout} className="dropdown-item">Log out</button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
