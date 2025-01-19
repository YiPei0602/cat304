import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import app from "../firebase";

// Icons
import { FaHome, FaHistory, FaTasks } from "react-icons/fa";
import { MdInventory, MdOutlineViewList, MdOutlineSettings } from "react-icons/md";
import { IoMdNotifications } from "react-icons/io";
import { IoMdQrScanner } from "react-icons/io";
import { TbBulb } from "react-icons/tb";
import { BiSupport, BiLogOut } from "react-icons/bi";

const menuConfig = {
  admin: [
    { title: "Dashboard", path: "/adminDashboard", icon: <FaHome /> },
    { title: "Inventory", path: "/inventory", icon: <MdInventory /> },
    { title: "QR Scanner", path: "/qrscanner", icon: <IoMdQrScanner /> },
    { title: "Application", path: "/donor-application", icon: <FaTasks /> },
    { title: "Settings", path: "/settings", icon: <MdOutlineSettings /> },
    { title: "Notifications", path: "/notifications", icon: <IoMdNotifications /> },
    { title: "User Support", path: "/admin/chat", icon: <BiSupport /> },
  ],
  student: [
    { title: "Dashboard", path: "/studentDashboard", icon: <FaHome /> },
    { title: "Item List", path: "/itemlist", icon: <MdOutlineViewList /> },
    { title: "History", path: "/collectionHistory", icon: <FaHistory /> },
  ],
  donor: [
    { title: "Dashboard", path: "/donorDashboard", icon: <FaHome /> },
    { title: "Donation History", path: "/donor/history", icon: <FaHistory /> },
    { title: "Donation Suggestion", path: "/suggestion", icon: <TbBulb /> },
  ],
};

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const Menus = menuConfig[userRole] || [];
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const handleMenuClick = (path) => navigate(path);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        const auth = getAuth(app);
        await signOut(auth);
        localStorage.clear();
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  return (
    <div
      className={`sidebar bg-dark text-white vh-100 d-flex flex-column ${
        isCollapsed ? "collapsed" : "expanded"
      }`}
      style={{
        width: isCollapsed ? "70px" : "230px",
        transition: "width 0.3s ease",
      }}
    >
      {/* Sidebar Header */}
      <div className="d-flex align-items-center px-3 py-3">
        <span
          style={{
            cursor: "pointer",
            fontSize: "2.1rem",
            width: "35px",
            color: "white",
          }}
          onClick={toggleSidebar}
        >
          ☰
        </span>
        {!isCollapsed && (
          <h5 className="m-0 ms-2">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal</h5>
        )}
      </div>

      {/* Sidebar Menu */}
      <ul className="nav flex-column flex-grow-1">
        {Menus.map((menu, index) => (
          <li
            key={index}
            className="nav-item"
            style={{
              listStyle: "none",
            }}
          >
            <div
              className="nav-link text-white d-flex align-items-center"
              style={{
                cursor: "pointer",
                padding: "10px 15px",
                borderRadius: "5px",
                transition: "background-color 0.2s ease",
              }}
              onClick={() => handleMenuClick(menu.path)}
            >
              <span
                style={{
                  fontSize: "1.5rem",
                  width: "30px",
                  textAlign: "center",
                  marginRight: isCollapsed ? "0" : "15px",
                }}
              >
                {menu.icon}
              </span>
              {!isCollapsed && <span>{menu.title}</span>}
            </div>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <ul className="nav flex-column mt-auto mb-3">
        <li className="nav-item">
          <div
            className="nav-link text-white d-flex align-items-center"
            style={{
              cursor: "pointer",
              padding: "10px 15px",
              borderRadius: "5px",
              transition: "background-color 0.2s ease",
            }}
            onClick={handleLogout}
          >
            <span
              style={{
                fontSize: "1.5rem",
                width: "30px",
                textAlign: "center",
                marginRight: isCollapsed ? "0" : "15px",
              }}
            >
              <BiLogOut />
            </span>
            {!isCollapsed && <span>Logout</span>}
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
