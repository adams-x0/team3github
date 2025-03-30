import React from "react";
import '../login.css';


const Login = () => {
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






