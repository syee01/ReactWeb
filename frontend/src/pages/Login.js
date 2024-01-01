import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import Validation from "./LoginValidation";
import axios from 'axios';
import '../cssFolder/login.css'
import logo from '../images/logo.png'
import profile from '../images/profile.png'
import {FaEnvelope,FaLock} from 'react-icons/fa'

// get the email and password entered
function Login(){
    const[values,setValues] = useState({
        email:'',
        password:''
    })
    const navigate = useNavigate()
    const handleInput = (event) =>{
        setValues(prev => ({...prev,[event.target.name]:[event.target.value]}))
    }

    // Input Validation
    const [errors,setErrors] = useState({})
    const [backendError, setBackendError] = useState([])

    // Submit Action
    const handleSubmit = (event) =>{
        event.preventDefault();
        const err = Validation(values);  
        setErrors(err); 
        if(err.email === "" && err.password === "") { 
            axios.post('http://localhost:8085/login', values)
            .then(res => {                
                if(res.data.errors) {                   
                    setBackendError(res.data.errors);
                } else {                    
                    setBackendError([]);                    
                    if(res.data === "Success") {                        
                        navigate('/Home');                    
                    } else {                        
                        alert("No record existed");                    
                    }                
                }                            
            })            
            .catch(err => console.log(err));        
        }   
    }

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
            <img src={profile} alt="Profile Icon" className="profile-icon" /> {/* Profile Icon */}
            {backendError ? backendError.map(e => (
              <p className='text-danger'>{e.msg}</p>
            )) : <span></span>}
            <form onSubmit={handleSubmit}>
              {/* email input */}
              <div className="input-group">
              <FaEnvelope className="input-icon" />
              {/* <label htmlFor="email">Email</label> */}
              <input type="email" id="email" name="email"
                onChange={handleInput} value={values.email} />
              {errors.email && <p className="error">{errors.email}</p>}
              </div>
              {/* password input */}
              <div className="input-group">
              <FaLock className="input-icon" />
              {/* <label htmlFor="password">Password</label> */}
              <input type="password" id="password" name="password"
                onChange={handleInput} value={values.password} />
              {errors.password && <p className="error">{errors.password}</p>}
              </div>
              {/* Log in Button */}
              <button type="submit">Log in</button>
            </form>
          </div>
        </div>
      </div>
    );
}
export default Login