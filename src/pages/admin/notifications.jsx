import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import app from "../../firebase";

// React Icons
import {
  FaTimesCircle,             // Expired
  FaExclamationTriangle,     // Expiring Soon
  FaInfoCircle,              // Low Stock
  FaEllipsisV,               // 3-dot menu
  FaFileSignature,           // New Donor Application
  FaBell                     // Bell icon for the modal
} from "react-icons/fa";

import "./notifications.css";

const Notification = () => {
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem("userRole");
  const db = getFirestore(app);

  const [loading, setLoading] = useState(true);
  const [notiList, setNotiList] = useState([]);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNoti, setSelectedNoti] = useState(null);

  // For the 3-dot dropdown
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // -----------------------------
  // OPEN / CLOSE MODAL
  // -----------------------------
  const handleOpenModal = (noti) => {
    setSelectedNoti(noti);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedNoti(null);
    setIsModalOpen(false);
  };

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen]);

  // -----------------------------
  // 3-DOT DROPDOWN
  // -----------------------------
  const handleToggleDropdown = (index) => {
    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  };

  // -----------------------------
  // MARK AS READ / UNREAD
  // -----------------------------
  const handleMarkAsRead = (index) => {
    setNotiList((prev) => {
      const updated = [...prev];
      updated[index].isRead = true;
      return updated;
    });
    setOpenDropdownIndex(null); // Close the dropdown after action
  };

  const handleMarkAsUnread = (index) => {
    setNotiList((prev) => {
      const updated = [...prev];
      updated[index].isRead = false;
      return updated;
    });
    setOpenDropdownIndex(null); // Close the dropdown after action
  };

  // -----------------------------
  // FETCH: LOW STOCK
  // -----------------------------
  const lowStockNoti = async () => {
    try {
      const q = query(collection(db, "inventory"), where("stock_level", "==", "Low"));
      const querySnapshot = await getDocs(q);

      const notifications = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          type: "Low Stock",
          item_name: data.item_name,
          campus: data.campus,
          title: "Item has Low Stock!",
          message: `The item "<strong>${data.item_name}</strong>" is in low stock! May suggest to donors for donation.`,
          isRead: false,
        });
      });
      return notifications;
    } catch (error) {
      console.error("Error fetching low stock notifications:", error);
      return [];
    }
  };

  // -----------------------------
  // FETCH: EXPIRED / EXPIRING
  // -----------------------------
  const getFoodNoti = async () => {
    try {
      const foodQuery = query(collection(db, "inventory"), where("category", "==", "Food"));
      const querySnapshot = await getDocs(foodQuery);

      const notifications = [];
      const today = new Date();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const expiryDateList = data.expiry_date_list || [];

        expiryDateList.forEach((detail) => {
          const expiryDate = new Date(detail.expiry_date);
          const daysToExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);

          if (expiryDate < today) {
            notifications.push({
              type: "Expired",
              item_name: data.item_name,
              campus: data.campus,
              expiry_date: detail.expiry_date,
              title: "Item is already Expired!",
              message: `The item "<strong>${data.item_name}</strong>" has expired. Please take action!`,
              isRead: false,
            });
          } else if (daysToExpiry <= 7 && daysToExpiry > 0) {
            notifications.push({
              type: "Expiring Soon",
              item_name: data.item_name,
              campus: data.campus,
              expiry_date: detail.expiry_date,
              title: "Item is Expiring Soon!",
              message: `The item "<strong>${data.item_name}</strong>" is almost expired. Please take action!`,
              isRead: false,
            });
          }
        });
      });
      return notifications;
    } catch (error) {
      console.error("Error fetching food notifications:", error);
      return [];
    }
  };

  // -----------------------------
  // STEP 1: FETCH ALL PRE-EXISTING NOTIFICATIONS
  // THEN STEP 2: SUBSCRIBE TO NEW DONATIONS
  // -----------------------------
  useEffect(() => {
    let unsubDonations = null;

    // 1) Fetch existing (Low Stock, Expired, Expiring)
    const fetchInitialNoti = async () => {
      try {
        const expiryNoti = await getFoodNoti();
        const lowStock = await lowStockNoti();
        // Combine them
        const combined = [...expiryNoti, ...lowStock];

        // Set them in state
        setNotiList(combined);

        // Done fetching, remove loading
        setLoading(false);

        // 2) AFTER we have set the old noti, subscribe to "donations"
        unsubDonations = onSnapshot(collection(db, "donations"), (snapshot) => {
          const newDonations = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              newDonations.push({
                type: "New Donor Application",
                title: "New Donor Application Received!",
                message: `A new donor named "<strong>${data.name}</strong>" has submitted a donation!`,
                isRead: false,
              });
            }
          });

          // If there's newly added doc(s), prepend them
          if (newDonations.length > 0) {
            setNotiList((prev) => [...newDonations, ...prev]);
          }
        });
      } catch (err) {
        console.error("Error fetching initial notifications:", err);
        setLoading(false);
      }
    };

    fetchInitialNoti();

    // Cleanup subscription on unmount
    return () => {
      if (unsubDonations) {
        unsubDonations();
      }
    };
    // eslint-disable-next-line
  }, []);

  // -----------------------------
  // HELPER FUNCTIONS
  // -----------------------------
  const getNotificationTypeClass = (type) => {
    switch (type) {
      case "Expired":
        return "notification-red";
      case "Expiring Soon":
        return "notification-yellow";
      case "Low Stock":
        return "notification-green";
      case "New Donor Application":
        return "notification-blue";
      default:
        return "";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Expired":
        return <FaTimesCircle className="modal-icon-red" />;
      case "Expiring Soon":
        return <FaExclamationTriangle className="modal-icon-yellow" />;
      case "Low Stock":
        return <FaInfoCircle className="modal-icon-green" />;
      case "New Donor Application":
        return <FaFileSignature className="modal-icon-blue" />;
      default:
        return <FaInfoCircle />;
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="dashboard-layout">
      <Sidebar userRole={role} />
      <div className="dashboard-content notification-container">
        <h1 className="section-header">Notification Center</h1>

        {loading ? (
          <p className="sub-text">Loading...</p>
        ) : (
          <div className="notification-table">
            {notiList.length > 0 ? (
              notiList.map((noti, index) => {
                // Determine the type-based class only if unread
                const typeColorClass = !noti.isRead ? getNotificationTypeClass(noti.type) : "";

                // If read, add the read class
                const readClass = noti.isRead ? "notification-read" : "";

                // Icon based on type
                const icon = getNotificationIcon(noti.type);

                return (
                  <div
                    key={index}
                    className={`notification-row ${typeColorClass} ${readClass}`}
                  >
                    {/* ICON */}
                    <div className="notification-cell notification-icon">
                      {icon}
                    </div>

                    {/* TITLE + MESSAGE */}
                    <div className="notification-cell notification-content">
                      <p className="notification-title">
                        {noti.title}
                      </p>
                      <p
                        className="notification-message"
                        dangerouslySetInnerHTML={{ __html: noti.message }}
                      />
                    </div>

                    {/* ACTIONS */}
                    <div className="notification-cell notification-actions-cell">
                      <button
                        className="notification-detail-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering other events
                          handleOpenModal(noti);
                        }}
                      >
                        View Details
                      </button>

                      <span
                        className="notification-dots"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering other events
                          handleToggleDropdown(index);
                        }}
                      >
                        <FaEllipsisV />
                        {openDropdownIndex === index && (
                          <div className="notification-dots-menu">
                            {noti.isRead ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering row events
                                  handleMarkAsUnread(index);
                                }}
                              >
                                Mark as Unread
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering row events
                                  handleMarkAsRead(index);
                                }}
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No notifications available.</p>
            )}
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && selectedNoti && (
          <>
            <div
              className="notification-modal-overlay"
              onClick={handleCloseModal}
            ></div>

            <div className="notification-modal-container">
              <div className="notification-modal-header">
                <h2 className="reminder-title">REMINDER</h2>
                {/* Removed the close (X) button */}
              </div>

              <div className="notification-modal-body">
                <FaBell className="modal-bell-icon" />

                <div className="modal-details">
                  {/* Always show the message */}
                  <p
                    className="modal-message"
                    dangerouslySetInnerHTML={{ __html: selectedNoti.message }}
                  ></p>

                  {/* Conditionally show details based on notification type */}
                  {selectedNoti.type !== "New Donor Application" && (
                    <>
                      {selectedNoti.item_name && (
                        <p className="modal-info">
                          <strong>Item Name:</strong> {selectedNoti.item_name}
                        </p>
                      )}
                      {selectedNoti.campus && (
                        <p className="modal-info">
                          <strong>Campus:</strong> {selectedNoti.campus}
                        </p>
                      )}
                      {selectedNoti.expiry_date && (
                        <p className="modal-info">
                          <strong>Expiry Date:</strong> {new Date(selectedNoti.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <button
                className="notification-modal-action-btn"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notification;
