import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; // Make sure this path is correct
import Validation from "./LoginValidation";
import axios from 'axios';
import '../cssFolder/login.css';
import court from '../images/court.png';
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
                    setUser({ username: res.data.username }); // Use the returned username
                    
                    localStorage.setItem('userID', res.data.userID); // Assuming userID is returned from the server
                    localStorage.setItem('username', res.data.username)
                    localStorage.setItem('role', res.data.role)
                    // Navigate to the home page
                    navigate('/home');
                } else {
                    // Handle different or more specific backend errors as needed
                    setBackendError([res.data.message || "Invalid email"]); // Use the error message from the backend
                }
            })
            
            .catch(err => {
                console.error('Error:', err);
                setBackendError(["An error occurred during login"]);
            });
        }
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(${court})` }}>
          <div className="login-box">
            <h1>Welcome Back</h1>
            <p>Log into your Account</p>
            <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email-address" className="login-label">Email Address</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email-address"
                  name="email"
                  placeholder="Email Address"
                  onChange={handleInput}
                  value={values.email}
                  className="input-field"
                />
                {errors.email && <p className="error below-password">{errors.email}</p>}
                </div>
                <label htmlFor="password" className="login-label">Password</label>
                <div className="input-group">
                <FaLock className="input-icon" />
                
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleInput}
                    value={values.password}
                    className="input-field"
                    />
                    {errors.password && <p className="
                        error below-password">{errors.password}</p>}
                        </div>
                        {errors.password<0 && errors.email <0 && backendError.length > 0 && (
                        <p className="error below-password">{backendError[0]}</p>
                        )}
                        <button type="submit" className="login-btn">Login</button>
                        <a href="#" className="forgot-password">Forgot password?</a>
                        </form>
                </div>
        
            </div>
      );
}

export default Login;
