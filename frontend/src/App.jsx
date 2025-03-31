import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'; 
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
// function App() {

//   // return (
//   //   <div className="App">
//   //     <LoginView></LoginView>
//   //   </div>
//   // );
// }


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
      </Routes>
    </Router>
  )
}

export default App;
