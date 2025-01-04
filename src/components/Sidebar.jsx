import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebase";

const menuConfig = {
  admin: [
    { title: "Dashboard", path: "/adminDashboard"},
    { title: "User Management", path: "/usermanagement" },
    { title: "Reports", path: "/reports" },
    { title: "Settings", path: "/settings" },
    { title: "Notifications", path: "/notifications" },
    { title: "System Logs", path: "/systemlogs" },
  ],
  student: [
    { title: "Dashboard", path: "/studentDashboard"},
    { title: "Item List", path: "/itemlist" },
    { title: "History", path: "/history" },
    { title: "Settings", path: "/settings" },
    { title: "Notifications", path: "/notifications" },
  ],
  donor: [
    { title: "Dashboard", path: "/donorDashboard"},
    { title: "Transactions", path: "/transactions" },
    { title: "Notifications", path: "/notifications" },
    { title: "Settings", path: "/settings" },
  ],
};

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const Menus = menuConfig[userRole] || [];

  const handleMenuClick = (path) => {
    // Navigate programmatically to the specified path
    navigate(path);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    
    if (confirmLogout){
    try {
      const auth = getAuth(app);
      await signOut(auth); // Sign the user out
      localStorage.removeItem("userRole"); // Clear user data from localStorage
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }
  };

  return (
    <div className="sidebar bg-dark text-white vh-100 p-3">
      {/* Sidebar Header */}
      <div className="mb-4">
        <h5>
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
        </h5>
      </div>

      {/* Sidebar Menu */}
      <ul className="nav flex-column">
        {Menus.map((menu, index) => (
          <li
            key={index}
            className={`nav-item mb-2 ${index === 0 ? "active" : ""}`}
            onClick={() => handleMenuClick(menu.path)} // Handle click to navigate
          >
            <span className="nav-link text-white rounded d-flex align-items-center">
              {menu.title}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto d-flex justify-content-start">
        <button
          onClick={handleLogout}
          className="btn btn-danger"
          style={{ position: "absolute", bottom: "20px", left: "20px" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
