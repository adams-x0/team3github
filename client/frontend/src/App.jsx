import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './css/App.css'; 
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ForgotPasswordView from './components/ForgotPasswordView';
import StudentDashboard from './components/StudentDashboard';
import StudentNavbar from './components/studentNavbar';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/ForgotPassword" element={<ForgotPasswordView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  )
}

export default App;
