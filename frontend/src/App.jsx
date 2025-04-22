import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './css/App.css';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ForgotPasswordView from './components/ForgotPasswordView';
import StudentDashboard from './components/StudentDashboard';
import ParentDashboard from './components/ParentDashboard';
import TherapistDashboard from './components/TherapistDashboard';
import TherapistNavbar from './components/therapistNavbar'; 
const theme = createTheme({
  palette: {
    primary: {
      main: '#04AA6D',
    },
    secondary: {
      main: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/ForgotPassword" element={<ForgotPasswordView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;


