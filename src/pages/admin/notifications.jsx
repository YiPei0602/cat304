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
  FaTimesCircle,       // Expired
  FaExclamationTriangle, // Expiring Soon
  FaInfoCircle,          // Low Stock
  FaEllipsisV,           // 3-dot menu
  FaFileSignature             // New Donor Application
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
    setOpenDropdownIndex(null);
  };

  const handleMarkAsUnread = (index) => {
    setNotiList((prev) => {
      const updated = [...prev];
      updated[index].isRead = false;
      return updated;
    });
    setOpenDropdownIndex(null);
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
          message: `The item "${data.item_name}" is in low stock! May suggest to donors for donation.`,
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
              message: `The item "${data.item_name}" has expired. Please take action!`,
              isRead: false,
            });
          } else if (daysToExpiry <= 7 && daysToExpiry > 0) {
            notifications.push({
              type: "Expiring Soon",
              item_name: data.item_name,
              campus: data.campus,
              expiry_date: detail.expiry_date,
              title: "Item is Expiring Soon!",
              message: `The item "${data.item_name}" is almost expired. Please take action!`,
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
        // combine them
        const combined = [...expiryNoti, ...lowStock];

        // set them in state
        setNotiList(combined);

        // done fetching, remove loading
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
                message: `A new donor named "${data.name}" has submitted a donation!`,
                isRead: false,
              });
            }
          });

          // if there's newly added doc(s), prepend them
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
  // RENDER
  // -----------------------------
  return (
    <div className="dashboard-layout">
      <Sidebar userRole={role} />
      <div className="dashboard-content notification-container">
        <h1>Notification Center</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="notification-table">
            {notiList.length > 0 ? (
              notiList.map((noti, index) => {
                // If unread => show type-based color
                let typeColorClass = "";
                if (!noti.isRead) {
                  if (noti.type === "Expired") {
                    typeColorClass = "notification-red";
                  } else if (noti.type === "Expiring Soon") {
                    typeColorClass = "notification-yellow";
                  } else if (noti.type === "Low Stock") {
                    typeColorClass = "notification-green";
                  } else if (noti.type === "New Donor Application") {
                    typeColorClass = "notification-blue";
                  }
                }

                // If read => override
                const readClass = noti.isRead ? "notification-read" : "";

                // Icon
                let icon = <FaInfoCircle />;
                if (noti.type === "Expired") {
                  icon = <FaTimesCircle />;
                } else if (noti.type === "Expiring Soon") {
                  icon = <FaExclamationTriangle />;
                } else if (noti.type === "Low Stock") {
                  icon = <FaInfoCircle />;
                } else if (noti.type === "New Donor Application") {
                  icon = <FaFileSignature />;
                }

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
                        <strong>{noti.title}</strong>
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
                        onClick={() => handleOpenModal(noti)}
                      >
                        View Details
                      </button>

                      <span
                        className="notification-dots"
                        onClick={() => handleToggleDropdown(index)}
                      >
                        <FaEllipsisV />
                      </span>

                      {openDropdownIndex === index && (
                        <div className="notification-dots-menu">
                          <button onClick={() => handleMarkAsRead(index)}>
                            Mark as Read
                          </button>
                          <button onClick={() => handleMarkAsUnread(index)}>
                            Mark as Unread
                          </button>
                        </div>
                      )}
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
              <h2 className="notification-reminder-title">REMINDER</h2>
              <img
                className="notification-reminder-image"
                src="https://via.placeholder.com/120"
                alt="Reminder"
              />

              <div className="notification-modal-body">
                <h3>{selectedNoti.title}</h3>
                <p
                  dangerouslySetInnerHTML={{ __html: selectedNoti.message }}
                />
              </div>

              <button
                className="notification-detail-close-btn"
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