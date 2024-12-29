// import React, { useState } from "react";
// import * as FaIcons from "react-icons/fa";
// import * as AiIcons from "react-icons/ai";
// import { Link } from "react-router-dom";
// import { SidebarData } from "./SidebarData";
// import "../App.css";
// import { IconContext } from "react-icons";

// function Navbar() {
//   const [sidebar, setSidebar] = useState(false);

//   const showSidebar = () => setSidebar(!sidebar);

//   return (
//     <>
//       <IconContext.Provider value={{ color: "undefined" }}>
//         <div className="navbar">
//           <Link to="#" className="menu-bars">
//             <FaIcons.FaBars onClick={showSidebar} />
//           </Link>
//         </div>
//         <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
//           <ul className="nav-menu-items" onClick={showSidebar}>
//             <li className="navbar-toggle">
//               <Link to="#" className="menu-bars">
//                 <AiIcons.AiOutlineClose />
//               </Link>
//             </li>
//             {SidebarData.map((item, index) => {
//               return (
//                 <li key={index} className={item.cName}>
//                   <Link to={item.path}>
//                     {item.icon}
//                     <span>{item.title}</span>
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>
//       </IconContext.Provider>
//     </>
//   );
// }

// export default Navbar;

// const Sidebar = ({ userRole }) => {
//     const renderSidebarContent = () => {
//       switch (userRole) {
//         case 'admin':
//           return (
//             <div>
//               <ul>
//                 <li>Admin Dashboard</li>
//                 <li>abc</li>
//                 <li>def</li>
//               </ul>
//             </div>
//           );
//         case 'student':
//           return (
//             <div>
//               <ul>
//                 <li>Dashboard</li>
//                 <li>List of Item</li>
//                 <li>History</li>
//                 <li>QR Code</li>
//                 <li>Settings</li>
//               </ul>
//             </div>
//           );
//         case 'donor':
//           return (
//             <div>
//               <ul>
//                 <li>Dashboard</li>
//                 <li>View Content</li>
//               </ul>
//             </div>
//           );
//         default:
//           return <div>No Sidebar Content</div>;
//       }
//     };
  
//     return (
//       <div className="sidebar">
//         {renderSidebarContent()}
//       </div>
//     );
//   };
  
//   export default Sidebar;

// import React from 'react';

// const sidebarConfig = {
//   admin: [
//     { title: 'Dashboard', path: '/dashboard' },
//     // { title: 'User Management', path: '/admin/users' },
//     // { title: 'Settings', path: '/admin/settings' }
//   ],
//   student: [
//     { title: 'Dashboard', path: '/dashboard' },
//     { title: 'List of Item', path: '/student/reports' },
//     { title: 'History', path: '/student/history' },
//     { title: 'Settings', path: '/student/settings' }
//   ],
//   donor: [
//     { title: 'Dashboard', path: '/dashboard' },
//     // { title: 'Profile', path: '/profile' },
//     // { title: 'Tasks', path: '/tasks' }
//   ]
// };

// const Sidebar = ({ userRole }) => {
//   const menuItems = sidebarConfig[userRole] || [];

//   return (
//     <div className="w-64 bg-gray-800 min-h-screen p-4">
//       <nav>
//         <ul className="space-y-2">
//           {menuItems.map((item) => (
//             <li key={item.path}>
//               <a
//                 href={item.path}
//                 className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md block transition-colors"
//               >
//                 {item.title}
//               </a>
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;

// import React, { useState } from "react";

// const menuConfig = {
//   admin: [
//     { title: "Dashboard"},
//     { title: "User Management"},
//     { title: "Reports"},
//     { title: "Settings"},
//     { title: "Notifications"},
//     { title: "System Logs" }
//   ],
//   student: [
//     { title: "Dashboard"},
//     { title: "Item List" },
//     { title: "History"},
//     { title: "Settings"},
//     { title: "Notifications"}
//   ],
//   donor: [
//     { title: "Overview" },
//     { title: "Transactions"},
//     { title: "Notifications" },
//     { title: "Settings"}
//   ]
// };

//   const Sidebar = ({ userRole }) => {
//   const [open, setOpen] = useState(true);
//   const Menus = menuConfig[userRole] || [];

//   return (
//       <div className={`sidebar ${open ? 'sidebar-expanded' : 'sidebar-collapsed'} position-relative`}>
//         <button 
//           className="toggle-btn"
//           onClick={() => setOpen(!open)}
//         >
//           <span className={`${open ? '' : 'rotate-180'}`}>❮</span>
//         </button>
        
//         <div className="px-3 pt-4">
//           <h5 
//             className={`text-white mb-4 ${!open && 'd-none'}`}
//           >
//             {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
//           </h5>

//           <ul className="nav flex-column">
//             {Menus.map((menu, index) => (
//               <li 
//                 key={index} 
//                 className={`nav-item ${menu.gap ? 'menu-item-gap' : 'mb-2'}`}
//               >
//                 <a 
//                   className={`nav-link rounded d-flex align-items-center ${index === 0 ? 'active' : ''}`}
//                   href="#"
//                 >
//                   {/* <span className="me-2">•</span> */}
//                   <span className={!open ? 'd-none' : ''}>
//                     {menu.title}
//                   </span>
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//   );
// };
// export default Sidebar;

// import React from "react";
// import { Link } from "react-router-dom";

// const menuConfig = {
//   admin: [
//     { title: "Dashboard" },
//     { title: "User Management" },
//     { title: "Reports" },
//     { title: "Settings" },
//     { title: "Notifications" },
//     { title: "System Logs" },
//   ],
//   student: [
//     { title: "Dashboard", path: "/dashboard"},
//     { title: "Item List" , path: "/itemlist"},
//     { title: "History" },
//     { title: "Settings" },
//     { title: "Notifications" },
//   ],
//   donor: [
//     { title: "Overview" },
//     { title: "Transactions" },
//     { title: "Notifications" },
//     { title: "Settings" },
//   ],
// };

// const Sidebar = ({ userRole }) => {
//   const Menus = menuConfig[userRole] || [];

//   return (
//     <div className="sidebar bg-dark text-white vh-100 p-3">
//       {/* Sidebar Header */}
//       <div className="mb-4">
//         <h5>
//           {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
//         </h5>
//       </div>

//       {/* Sidebar Menu */}
//       <ul className="nav flex-column">
//         {Menus.map((menu, index) => (
//           <li
//             key={index}
//             className={`nav-item mb-2 ${index === 0 ? "active" : ""}`}
//           >
//             <Link
//               className="nav-link text-white rounded d-flex align-items-center"
//               to = {menu.path}
//               // href="#"
//             >
//               {menu.title}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;

import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import app from "../firebase";

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
