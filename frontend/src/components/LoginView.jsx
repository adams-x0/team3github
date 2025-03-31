import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../login.css';


const Login = () => {
  const [role, setRole] = useState("student"); // Default role
  const navigate = useNavigate();  // Create history instance

  // Handle forgot password link click
  const handleForgotPassword = () => {
    navigate('/ForgotPassword'); // Use navigate to go to forgot-password page
  };

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
            <label>Username</label>
            <input type="text" placeholder="Enter Username" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter Password" required />
          </div>
          
          {/* Role Dropdown */}
          <div className="input-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="therapist_tutor">Therapist</option>
              <option value="admin">Admin</option>
            </select>
          </div> 

          
          {/* Forgot Password Link */}
          <div className="forgot-password">
            <button type="button" className="forgot-password-btn" onClick={handleForgotPassword}>
              Forgot Password?
            </button>
          </div>


          {/* Login Button */}
          <button type="submit" className="login-btn">
            Login
          </button>

        </form>

        {/* Footer Section */}
        <div className="">
          {/* Register Button */}
          <button type="button" className="register-btn" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;






