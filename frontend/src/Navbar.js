import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust the path as necessary
import './Navbar.css';

const Navbar = () => {
    const { user } = useUser(); // Get the current user from context

    return (
        <nav className="navbar">
            <h4>myHalal Checker</h4>
            <div className="links">
                <Link to="/">Home</Link>
                <Link to="/about">Report</Link>
                <Link to="/contact">Enquiry</Link>
                <Link to="/data">Data</Link>
                {user && <span>Welcome, {user.username}</span>} {/* Display the username if user is logged in */}
            </div>
        </nav>
    );
}

export default Navbar;
