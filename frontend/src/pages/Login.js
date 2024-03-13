import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; // Make sure this path is correct
import Validation from "./LoginValidation";
import axios from 'axios';
import '../cssFolder/login.css';
import logo from '../images/logo.png';
import profile from '../images/profile.png';
import {FaEnvelope, FaLock} from 'react-icons/fa';

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [errors, setErrors] = useState({});
    const [backendError, setBackendError] = useState([]);

    const handleInput = (event) => {
        setValues({
            ...values,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = (event) => {
        console.log(values)
        event.preventDefault();
        const validationErrors = Validation(values);
        console.log(validationErrors);
        setErrors(validationErrors);
        console.log(Object.keys(validationErrors).length)
        
        // Proceed if there are no validation errors
        if (Object.keys(validationErrors).length === 2) {
            axios.post('http://localhost:8085/login', values)
            .then(res => {
                console.log(res.data);
                if (res.data.status === "Success") {
                    // Set user information upon successful login
                    console.log(res.data.username); // Now you have the username
                    setUser({ username: res.data.username }); // Use the returned username
                    
                    // Navigate to the home page
                    navigate('/home');
                } else {
                    // Handle different or more specific backend errors as needed
                    setBackendError([res.data.message || "Invalid email or password"]); // Use the error message from the backend
                }
            })
            
            .catch(err => {
                console.error('Error:', err);
                setBackendError(["An error occurred during login"]);
            });
        }
        console.log('here')
    };

    return (
        <div className="login-container">
            <div className="welcome-section">
                <h1>Welcome Back</h1>
                <img src={logo} alt="myHalal Checker Logo" className="logo" />
                <h2>myHalal Checker</h2>
            </div>
            <div className="login-section">
                <div className="login-content">
                    <h2>Login</h2>
                    <img src={profile} alt="Profile Icon" className="profile-icon" />
                    {backendError.length > 0 && backendError.map((error, index) => (
                        <p key={index} className="error">{error}</p>
                    ))}
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleInput}
                                value={values.email}
                            />
                            {errors.email && <p className="error">{errors.email}</p>}
                        </div>
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                                onChange={handleInput}
                                value={values.password}
                            />
                            {errors.password && <p className="error">{errors.password}</p>}
                        </div>
                        <button type="submit" className="login-btn">Log in</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
