import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import Validation from "./LoginValidation";
import axios from 'axios';
import '../cssFolder/login.css';
import logo from "../images/logo.png"; 
import { FaEnvelope, FaLock } from 'react-icons/fa';

function Login() {
    const [values, setValues] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [errors, setErrors] = useState({});
    const [backendError, setBackendError] = useState([]);

    const handleInput = event => {
        setValues({ ...values, [event.target.name]: event.target.value });
    };

    const handleSubmit = event => {
        event.preventDefault();
        console.log('submit')
        const validationErrors = Validation(values);
        console.log(Object.keys(validationErrors).length)
        setErrors(validationErrors);
        console.log('length')
        console.log(Object.keys(validationErrors).length)
        if (Object.keys(validationErrors).length === 2) {
            console.log('here')
            axios.post('http://localhost:8085/login', values)
            .then(res => {
                if (res.data.status === "Success") {
                    setUser({ username: res.data.username });
                    localStorage.setItem('userID', res.data.userID);
                    localStorage.setItem('username', res.data.username);
                    localStorage.setItem('role', res.data.role);
                    console.log('home')
                    navigate('/home');
                } else {
                    setBackendError([res.data.message || "Invalid login attempt"]);
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setBackendError(["An error occurred during login"]);
            });
        }
    };

    return (
        <div className="login-container">
            <div className="logo-container">
                <img src={logo} alt="myHalal Checker Logo" className="logo" />
                <h1 className="webNamePage">myHalal Checker</h1>
            </div>
            <div className="login-box">
                <h1 className="welcome">Welcome Back</h1>
                <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                    type="email"
                    id="email-address"
                    name="email"
                    onChange={handleInput}
                    value={values.email}
                    className="input-field"
                    placeholder="Email Address" />
                {errors.email && backendError.length === 0 && <p className="error">{errors.email}</p>}
                </div>
                <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        onChange={handleInput}
                        value={values.password}
                        className="input-field"
                        placeholder="Password" />
                    {errors.password && backendError.length === 0 && <p className="error">{errors.password}</p>}
                </div>
                    {backendError.length > 0 && <p className="error">{backendError[0]}</p>}
                    <button type="submit" className="login-btn">Login</button>
                </form>
                {/* <a href="" className="forgot-password">Forgot Password?</a> */}
            </div>
        </div>
    );
}

export default Login;
