import React, { useState } from "react";
import '../login.css';


const Login = () => {
  const [role, setRole] = useState("student_parent"); // Default role
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
            <a href="/forgot-password">Forgot Password?</a>
          </div>


          {/* Login Button */}
          <button type="submit" className="login-btn">
            Login
          </button>

        </form>

        {/* Footer Section */}
        <div className="footer">
          {/* Register Button */}
          <button type="submit" className="register-btn">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;






