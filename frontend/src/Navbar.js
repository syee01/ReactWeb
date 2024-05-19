import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext';
import './Navbar.css';
import logo from "./images/logo.png";

const Navbar = () => {
    const { user, setUser, loading } = useUser();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userID = localStorage.getItem('userID'); // Get user ID from localStorage
        console.log(userID)
        if (userID) {
            axios.get(`http://localhost:8085/user-role/${userID}`)  // Assuming your backend expects userID as a URL parameter
            .then(response => {
                setUserRole(response.data.role);
                console.log("Fetched user role:", response.data.role); // Logging the user role
            })
            .catch(error => console.error('Error fetching user role:', error));
        }
    }, [user]);
    
    const handleLogout = () => {
        localStorage.removeItem('UserID');
        localStorage.removeItem('username');
        setUser(null);
        setUserRole('');
        navigate('/');
    };

    if (loading) {
        return null; // Optionally, return a loading spinner here
    }

    return (
        <nav className="navbar">
            <div className="logocontainer">
                <img src={logo} alt="myHalal Checker Logo" className="logo1" />
                <h4 className='webName'>myHalal Checker</h4>
            </div>
            <div className="links">
                <Link to="/home">Home</Link>
                <Link to="/report">Report</Link>
                <Link to="/enquiry">Enquiry</Link>
                <Link to="/data">Data</Link>
                {userRole === 'head officer' && <Link to="/verifyData">Verify Data</Link>}
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
