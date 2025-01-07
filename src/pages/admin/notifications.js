import React from 'react';
import { useLocation } from "react-router-dom";
import Sidebar from '../../components/Sidebar';

const Notifications = () => {
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem('userRole');
  const name = location.state?.name || localStorage.getItem('userName');
  
  return (
    <div className="dashboard-layout">
      <Sidebar userRole={role}/>
      <div className="dashboard-content">
        <h1>Notification Center</h1>
        <p>Message here</p>
      </div>
    </div>
  );
};

export default Notifications;