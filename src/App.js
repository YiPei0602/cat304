import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserRoleSelection from './pages/Auth/UserRoleSelection';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/dashboard';
// import Sidebar from './components/Sidebar';
import './App.css';
import ResourceRequestForm from './pages/Student/requestform';
import StudentDashboard from './pages/Student/studentDashboard';
import AdminDashboard from './pages/admin/adminDashboard';
import DonorDashboard from './pages/donor/donorDashboard';
import ItemList from './pages/Student/itemList';
import DonationHistory from './pages/donor/DonationHistory';

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<UserRoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/requestform" element={<ResourceRequestForm />} />
        <Route path="/studentDashboard" element={<StudentDashboard/>}/>
        <Route path="/adminDashboard" element = {<AdminDashboard/>}/>
        <Route path="/donorDashboard" element = {<DonorDashboard/>}/>
        <Route path="/itemList" element ={<ItemList/>}/>
        <Route path="/donor/history" element={<DonationHistory />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;