import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import {fetchAllUsers} from '../Slices/GetSlice.jsx'


const Login = () => {
  const navigate = useNavigate()  // Create history instance
  const [users, setUsers] = useState([])
  const [newLogin, setNewLogin] = useState({ email: '', password:''})
  useEffect(() => {
    fetchAllUsers(setUsers)
  }, [setUsers]);

  // Handle forgot password link click
  const handleForgotPassword = () => {
    navigate('/ForgotPassword'); // Use navigate to go to forgot-password page
  };

  const handleNext = () => {
    if (!!newLogin.email && !!newLogin.password){
      const user = users.filter((userInDB) => 
        newLogin.email === userInDB.email && 
        newLogin.password === userInDB.password
      )
      if (user.role === 'student') {
        //go to student dashboard (with user data)
      }
      if (user.role === 'guardian') {
        //go to guardian dashboard (with user data)
      }
      if (user.role === 'therapist') {
        //go to therapist dashboard (with user data)
      }
      if (user.role === 'admin') {
        //go to admin dashboard (with user data)
      }
      // User does not exist
    }
    // Not Enough information to login
  }

  return (
    <div className="modal-container">
      {/* Modal Box */}
      <div className="modal-box">
        <header className="header">
           <h1>Therapy Appointment</h1>
        </header>

        {/* Form */}
        <form>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="text" 
              placeholder="Enter email address" 
              value={newLogin.email}
              onChange={(event) => setNewLogin({...newLogin, email: event.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter Password" 
              value={newLogin.password}
              onChange={(event) => setNewLogin({...newLogin, password: event.target.value})}
              required
            />
          </div>

          
          {/* Forgot Password Link */}
          <div className="forgot-password">
            <button type="button" className="forgot-password-btn" onClick={handleForgotPassword}>
              Forgot Password?
            </button>
          </div>


          {/* Login Button */}
          <button type="submit" className="login-btn" onClick={handleNext}>
            Login
          </button>

        </form>

        {/* Footer Section */}
        <div className="">
          {/* Register Button */}
          <button type="button" className="login-btn" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;






