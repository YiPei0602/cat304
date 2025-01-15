import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import app from "../../firebase";
import {
  collection,
  getDocs,
  getFirestore,
  updateDoc,
  query,
  where,
  doc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import Sidebar from "../../components/Sidebar";
import { MdDelete } from "react-icons/md";

const Settings = () => {
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem("userRole");
  const db = getFirestore(app);

  const [selectedSemester, setSelectedSemester] = useState("Sem 1");
  const [weekData, setWeekData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "", docId: "" });
  const [newDate, setNewDate] = useState({ semester: "", startDate: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemModal, itemModalOpen] = useState(false);

  const handleToggle = () => {
    const nextSemester = selectedSemester === "Sem 1" ? "Sem 2" : "Sem 1";
    setSelectedSemester(nextSemester);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDate((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const calcDate = (startDate, daysToAdd) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split("T")[0];
  };

  const setSemDate = async () => {
    try {
      const week1Start = newDate.startDate;

      for (let week = 1; week <= 19; week++) {
        const dayAdd = (week - 1) * 7;
        const startDate = calcDate(week1Start, dayAdd);
        const endDate = calcDate(startDate, 6);

        const q = query(collection(db, "weekRequiredItem"), where("week", "==", week));
        const snapshot = await getDocs(q);

        snapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            [`${newDate.semester}StartDate`]: startDate,
            [`${newDate.semester}EndDate`]: endDate,
          });
        });

        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error setting semester date:", error);
    }
  };

  const fetchWeekData = async () => {
    const snapshot = await getDocs(collection(db, "weekRequiredItem"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const sortedData = data.sort((a, b) => a.week - b.week);
    setWeekData(sortedData);
  };

  const fetchItemData = async (week) => {
    const q = query(collection(db, "weekRequiredItem"), where("week", "==", week));
    const snapshot = await getDocs(q);

    let itemList = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const items = data.item;

      if (items) {
        items.forEach((item) => {
          itemList.push({
            name: item.name,
            category: item.category,
            docId: doc.id,
          });
        });
      }
    });

    setItemData(itemList);
  };

  const handleRemove = async (itemId) => {
    try {
      const remove = itemData.find(
        (item) => item.name === itemId.name && item.category === itemId.category
      );

      if (remove) {
        const docRef = doc(db, "weekRequiredItem", remove.docId);
        await updateDoc(docRef, {
          item: arrayRemove({ name: remove.name, category: remove.category }),
        });

        setItemData((prevItems) =>
          prevItems.filter(
            (item) => item.name !== remove.name || item.category !== remove.category
          )
        );
      } else {
        console.error("Item not found!");
      }
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const handleAddItem = async () => {
    if (newItem.name && newItem.category) {
      setItemData((prevItems) => [...prevItems, newItem]);
      const docRef = doc(db, "weekRequiredItem", newItem.docId);

      await updateDoc(docRef, {
        item: arrayUnion({ name: newItem.name, category: newItem.category }),
      });

      setNewItem({ name: "", category: "", docId: "" });
      setIsAdding(false);
    } else {
      alert("Please fill in both fields.");
    }
  };

  useEffect(() => {
    fetchWeekData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={role} />
      <div className="dashboard-content">
        <h1 className="section-header">Settings</h1>
        <h2 className="sub-header">Week of Study</h2>
        <p className="sub-text">Currently viewing: {selectedSemester}</p>
        <div className="button-container">
          <button
            className={`toggle-button ${selectedSemester === "Sem 2" ? "active" : ""}`}
            onClick={handleToggle}
          >
            <span
              className={`toggle-text ${selectedSemester === "Sem 2" ? "active" : ""}`}
            >
              {selectedSemester}
            </span>
          </button>
          <button
            className="semester-button"
            onClick={() => setIsModalOpen(true)}
          >
            Update Date
          </button>
        </div>
        {/* Table */}
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reference</th>
              <th>Item Request</th>
            </tr>
          </thead>
          <tbody>
            {weekData.map((item) => (
              <tr key={item.id}>
                <td>{item.week}</td>
                <td>
                  {selectedSemester === "Sem 1"
                    ? item.sem1StartDate
                    : item.sem2StartDate}
                </td>
                <td>
                  {selectedSemester === "Sem 1"
                    ? item.sem1EndDate
                    : item.sem2EndDate}
                </td>
                <td>{item.reference || "-"}</td>
                <td>
                  <button
                    onClick={() => {
                      fetchItemData(item.week);
                      itemModalOpen(true);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modals */}
        {isModalOpen && (
          <div className="model">
            <h3 className="sub-header">Set New Semester Date</h3>
            <p className="sub-text">
              Insert the start date for the first week of the semester.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSemDate();
              }}
            >
              <div className="label">
                <label>Semester:</label>
                <select
                  name="semester"
                  value={newDate.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="sem1">Semester 1</option>
                  <option value="sem2">Semester 2</option>
                </select>
              </div>
              <div className="label">
                <label>Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  value={newDate.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-btn">
                <button type="submit">Set</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {itemModal && (
          <div className="model">
            <h3 className="sub-header">Item Required</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {itemData.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      <button onClick={() => handleRemove(item)}>
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => itemModalOpen(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
