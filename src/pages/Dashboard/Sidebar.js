import React from 'react';
import './Sidebar.css'; // Import the corresponding CSS file for styling

const Sidebar = () => {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <a className="nav-link" href="/dashboard">
            <i className="icon-grid menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </a>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#ui-basic"
            aria-expanded="false"
            aria-controls="ui-basic"
          >
            <i className="icon-layout menu-icon"></i>
            <span className="menu-title">UI Elements</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="ui-basic">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <a className="nav-link" href="/buttons">Buttons</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/dropdowns">Dropdowns</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/typography">Typography</a>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#form-elements"
            aria-expanded="false"
            aria-controls="form-elements"
          >
            <i className="icon-columns menu-icon"></i>
            <span className="menu-title">Form elements</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="form-elements">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <a className="nav-link" href="/basic-elements">Basic Elements</a>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#charts"
            aria-expanded="false"
            aria-controls="charts"
          >
            <i className="icon-bar-graph menu-icon"></i>
            <span className="menu-title">Charts</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="charts">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <a className="nav-link" href="/chartjs">ChartJs</a>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#tables"
            aria-expanded="false"
            aria-controls="tables"
          >
            <i className="icon-grid-2 menu-icon"></i>
            <span className="menu-title">Tables</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="tables">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <a className="nav-link" href="/basic-table">Basic table</a>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#icons"
            aria-expanded="false"
            aria-controls="icons"
          >
            <i className="icon-contract menu-icon"></i>
            <span className="menu-title">Icons</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="icons">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <a className="nav-link" href="/mdi-icons">Mdi icons</a>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#auth"
            aria-expanded="false"
            aria-controls="auth"
          >
            <i className="icon-head menu-icon"></i>
            <span className="menu-title">User Pages</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="auth">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <a className="nav-link" href="/login">Login</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/register">Register</a>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#error"
            aria-expanded="false"
            aria-controls="error"
          >
            <i className="icon-ban menu-icon"></i>
            <span className="menu-title">Error pages</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="error">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <a className="nav-link" href="/error-404">404</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/error-500">500</a>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/documentation">
            <i className="icon-paper menu-icon"></i>
            <span className="menu-title">Documentation</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
