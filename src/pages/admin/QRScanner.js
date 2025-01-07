import React from 'react';
import { useLocation } from "react-router-dom";
import Sidebar from '../../components/Sidebar';

const QRScanner = () => {
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem('userRole');
  const name = location.state?.name || localStorage.getItem('userName');
  
  return (
    <div className="dashboard-layout">
      <Sidebar userRole={role}/>
      <div className="dashboard-content">
        <h1>Scanner</h1>
        <p>Here to scan</p>
      </div>
    </div>
  );
};

export default QRScanner;