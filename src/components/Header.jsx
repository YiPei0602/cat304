import React from "react";
import { FaBell } from "react-icons/fa"; // Notification icon
import { IoMdPerson } from "react-icons/io"; // User profile icon

const Header = ({ isCollapsed, toggleSidebar, userRole }) => {
  return (
    <header
      className="header bg-white d-flex align-items-center justify-content-between px-3"
      style={{
        height: "60px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {/* Left Section */}
      <div className="d-flex align-items-center">
        {/* Three-Line Menu Icon */}
        <span
          style={{
            fontSize: "1.8rem",
            cursor: "pointer",
            textAlign: "center",
            width: "40px",
            color: "#333",
          }}
          onClick={toggleSidebar}
        >
          ☰
        </span>
        <h5
          className="m-0 ms-3"
          style={{
            fontSize: "1.2rem",
            whiteSpace: "nowrap",
            color: "#333",
          }}
        >
          Dashboard
        </h5>
      </div>

      {/* Right Section */}
      <div className="d-flex align-items-center">
        {/* Notification Icon */}
        <div
          style={{
            fontSize: "1.5rem",
            cursor: "pointer",
            marginRight: "20px",
            color: "#333",
          }}
        >
          <FaBell />
        </div>

        {/* User Role */}
        <div className="d-flex align-items-center">
          <IoMdPerson
            style={{
              fontSize: "1.5rem",
              marginRight: "10px",
              color: "#333",
            }}
          />
          <span style={{ fontSize: "1rem", color: "#333" }}>{userRole}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
