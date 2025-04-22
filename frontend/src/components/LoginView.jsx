import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../Slices/authSlice.jsx';
import '../css/login.css';


const Login = () => {
  const navigate = useNavigate()  // Create history instance
  const [newLogin, setNewLogin] = useState({ email: '', password:''})

  // Handle forgot password link click
  const handleForgotPassword = () => {
    navigate('/ForgotPassword');
  };

const dispatch = useDispatch();

const { user, error, loading } = useSelector((state) => state.auth);

useEffect(() => {
  if (user) {
    switch (user.role) {
      case 'student':
        navigate('/student-dashboard');
        break;
      case 'guardian':
        navigate('/parent-dashboard');
        break;
      case 'therapist':
        navigate('/therapist-dashboard');
        break;
      case 'admin':
        navigate('/student-dashboard');
        break;
      default:
        navigate('/');
    }
  }
}, [user, navigate]);

const handleNext = (e) => {
  e.preventDefault();

  if (newLogin.email && newLogin.password) {
    dispatch(loginUser(newLogin));
  }
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
            <label>Email</label>
            <input 
              type="text" 
              placeholder="Enter email address" 
              value={newLogin.email}
              onChange={(event) => setNewLogin({...newLogin, email: event.target.value})}
              required
              style={{width: '100%'}}
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
              style={{width: '100%'}}
            />
          </div>

          
          {/* Forgot Password Link */}
          <div className="forgot-password">
            <button type="button" className="forgot-password-btn" onClick={handleForgotPassword}>
              Forgot Password?
            </button>
          </div>


          {/* Login Button */}
          <button type="submit" className="login-btn" onClick={handleNext} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && <p className="error-text">{error}</p>}

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






