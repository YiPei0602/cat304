import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import app from "../firebase";

// Icons
import { FaHome, FaHistory } from 'react-icons/fa';
import { MdInventory, MdOutlineViewList, MdOutlineSettings } from "react-icons/md";
import { IoMdNotifications } from "react-icons/io";

const menuConfig = {
  admin: [
    { title: "Dashboard", path: "/adminDashboard", icon: <FaHome />},
    { title: "Inventory", path: "/inventory", icon: <MdInventory /> },
    { title: "Reports", path: "/reports" },
    { title: "Settings", path: "/settings" , icon: <MdOutlineSettings/> },
    { title: "Notifications", path: "/notifications", icon: <IoMdNotifications/> },
    { title: "System Logs", path: "/systemlogs" },
  ],
  student: [
    { title: "Dashboard", path: "/studentDashboard", icon: <FaHome />},
    { title: "Item List", path: "/itemlist" , icon: <MdOutlineViewList />},
    { title: "History", path: "/collectionHistory", icon: <FaHistory /> },
    { title: "Settings", path: "/settings", icon: <MdOutlineSettings/> },
    { title: "Notifications", path: "/notifications" , icon: <IoMdNotifications/> },
  ],
  donor: [
    { title: "Dashboard", path: "/donorDashboard", icon: <FaHome />},
    { title: "Transactions", path: "/transactions" },
    { title: "Notifications", path: "/notifications" , icon: <IoMdNotifications/>},
    { title: "Settings", path: "/settings", icon: <MdOutlineSettings/>  },
  ],
};

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const Menus = menuConfig[userRole] || [];
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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
    <div className={`sidebar bg-dark text-white vh-100 p-3 ${isCollapsed ? "collapsed" : ""}`} >
      {/* Collapse/Expand Button */}
      <button
        className="collapse-btn"
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? ">" : "<"}
      </button>

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
              <span className="me-2">{menu.icon}</span>
              {/* menu.title  */}
              {!isCollapsed && <span className="text">{menu.title}</span>}
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
