import React from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom"; // Import Link for routing

const Dashboard = () => {
  return (
    <div className="container-scroller">
      {/* Navbar */}
      <nav className="navbar fixed-top d-flex flex-row">
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start">
          <Link className="navbar-brand brand-logo" to="/dashboard">
            <img src="assets/images/logo.svg" alt="logo" />
          </Link>
          <Link className="navbar-brand brand-logo-mini" to="/dashboard">
            <img src="assets/images/logo-mini.svg" alt="logo-mini" />
          </Link>
        </div>
        <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
          <button className="navbar-toggler navbar-toggler align-self-center" type="button">
            <span className="icon-menu"></span>
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-panel">
        <div className="content-wrapper">
          <h1>Welcome to the Dashboard</h1>
          <p>This area can be customized further based on your requirements.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
