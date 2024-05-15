import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust the path as necessary
import './Navbar.css';
import logo from "./images/logo.png";

const Navbar = () => {
    const { user, setUser, loading } = useUser();
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('UserID');
        localStorage.removeItem('username');
        setUser(null);
        navigate('/');
    };

    const toggleDropdown = () => setShowDropdown(!showDropdown);

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
                {user && (
                    <div>
                        <div className="user-menu" onClick={toggleDropdown}>
                            {user.username}
                        </div>
                        {showDropdown && (
                            <div className="dropdown">
                                <Link to="/profile">Profile</Link>
                                <button onClick={handleLogout}>Log out</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
