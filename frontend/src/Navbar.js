import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust the path as necessary
import './Navbar.css';

const Navbar = () => {
    const { user, setUser } = useUser(); // Ensure setUser is provided from context for logout functionality
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null); // Clear user context, adjust based on your context implementation
        navigate('/'); // Redirect to login page, adjust the route as needed
    };

    // Toggle dropdown
    const toggleDropdown = () => setShowDropdown(!showDropdown);

    return (
        <nav className="navbar">
            <h4>myHalal Checker</h4>
            <div className="links">
                <Link to="/home">Home</Link>
                <Link to="/about">Report</Link>
                <Link to="/contact">Enquiry</Link>
                <Link to="/data">Data</Link>
                {user && (
                    <div className="user-menu" onClick={toggleDropdown}>
                        {user.username}
                        <div className={`dropdown ${showDropdown ? 'dropdown-active' : ''}`}>
                            <Link to="/profile">Profile</Link>
                            <button onClick={handleLogout}>Log out</button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

