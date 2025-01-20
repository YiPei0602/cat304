// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import app from "../../firebase";
// import {
//   collection,
//   getDocs,
//   getFirestore,
//   updateDoc,
//   query,
//   where,
//   doc,
//   arrayRemove,
//   arrayUnion,
// } from "firebase/firestore";
// import Sidebar from "../../components/Sidebar";
// import { MdDelete } from "react-icons/md";

// const Settings = () => {
//   const location = useLocation();
//   const role = location.state?.role || localStorage.getItem("userRole");
//   const db = getFirestore(app);

//   const [selectedSemester, setSelectedSemester] = useState("Sem 1");
//   const [weekData, setWeekData] = useState([]);
//   const [itemData, setItemData] = useState([]);
//   const [isAdding, setIsAdding] = useState(false);
//   const [newItem, setNewItem] = useState({ name: "", category: "", docId: "" });
//   const [newDate, setNewDate] = useState({ semester: "", startDate: "" });
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [itemModal, itemModalOpen] = useState(false);

//   const handleToggle = () => {
//     const nextSemester = selectedSemester === "Sem 1" ? "Sem 2" : "Sem 1";
//     setSelectedSemester(nextSemester);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewDate((prevItem) => ({ ...prevItem, [name]: value }));
//   };

//   const calcDate = (startDate, daysToAdd) => {
//     const date = new Date(startDate);
//     date.setDate(date.getDate() + daysToAdd);
//     return date.toISOString().split("T")[0];
//   };

//   const setSemDate = async () => {
//     try {
//       const week1Start = newDate.startDate;

//       for (let week = 1; week <= 19; week++) {
//         const dayAdd = (week - 1) * 7;
//         const startDate = calcDate(week1Start, dayAdd);
//         const endDate = calcDate(startDate, 6);

//         const q = query(collection(db, "weekRequiredItem"), where("week", "==", week));
//         const snapshot = await getDocs(q);

//         snapshot.forEach(async (doc) => {
//           await updateDoc(doc.ref, {
//             [`${newDate.semester}StartDate`]: startDate,
//             [`${newDate.semester}EndDate`]: endDate,
//           });
//         });

//         setIsModalOpen(false);
//       }
//     } catch (error) {
//       console.error("Error setting semester date:", error);
//     }
//   };

//   const fetchWeekData = async () => {
//     const snapshot = await getDocs(collection(db, "weekRequiredItem"));
//     const data = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     const sortedData = data.sort((a, b) => a.week - b.week);
//     setWeekData(sortedData);
//   };

//   const fetchItemData = async (week) => {
//     const q = query(collection(db, "weekRequiredItem"), where("week", "==", week));
//     const snapshot = await getDocs(q);

//     let itemList = [];
//     snapshot.forEach((doc) => {
//       const data = doc.data();
//       const items = data.item;

//       if (items) {
//         items.forEach((item) => {
//           itemList.push({
//             name: item.name,
//             category: item.category,
//             docId: doc.id,
//           });
//         });
//       }
//     });

//     setItemData(itemList);
//   };

//   const handleRemove = async (itemId) => {
//     try {
//       const remove = itemData.find(
//         (item) => item.name === itemId.name && item.category === itemId.category
//       );

//       if (remove) {
//         const docRef = doc(db, "weekRequiredItem", remove.docId);
//         await updateDoc(docRef, {
//           item: arrayRemove({ name: remove.name, category: remove.category }),
//         });

//         setItemData((prevItems) =>
//           prevItems.filter(
//             (item) => item.name !== remove.name || item.category !== remove.category
//           )
//         );
//       } else {
//         console.error("Item not found!");
//       }
//     } catch (error) {
//       console.error("Error removing item: ", error);
//     }
//   };

//   const handleAddItem = async () => {
//     if (newItem.name && newItem.category) {
//       setItemData((prevItems) => [...prevItems, newItem]);
//       const docRef = doc(db, "weekRequiredItem", newItem.docId);

//       await updateDoc(docRef, {
//         item: arrayUnion({ name: newItem.name, category: newItem.category }),
//       });

//       setNewItem({ name: "", category: "", docId: "" });
//       setIsAdding(false);
//     } else {
//       alert("Please fill in both fields.");
//     }
//   };

//   useEffect(() => {
//     fetchWeekData();
//   }, []);

//   return (
//     <div className="dashboard-layout">
//       <Sidebar userRole={role} />
//       <div className="dashboard-content">
//         <h1 className="section-header">Settings</h1>
//         <h2 className="sub-header">Week of Study</h2>
//         <p className="sub-text">Currently viewing: {selectedSemester}</p>
//         <div className="button-container">
//           <button
//             className={`toggle-button ${selectedSemester === "Sem 2" ? "active" : ""}`}
//             onClick={handleToggle}
//           >
//             <span
//               className={`toggle-text ${selectedSemester === "Sem 2" ? "active" : ""}`}
//             >
//               {selectedSemester}
//             </span>
//           </button>
//           <button
//             className="semester-button"
//             onClick={() => setIsModalOpen(true)}
//           >
//             Update Date
//           </button>
//         </div>
//         {/* Table */}
//         <table>
//           <thead>
//             <tr>
//               <th>Week</th>
//               <th>Start Date</th>
//               <th>End Date</th>
//               <th>Reference</th>
//               <th>Item Request</th>
//             </tr>
//           </thead>
//           <tbody>
//             {weekData.map((item) => (
//               <tr key={item.id}>
//                 <td>{item.week}</td>
//                 <td>
//                   {selectedSemester === "Sem 1"
//                     ? item.sem1StartDate
//                     : item.sem2StartDate}
//                 </td>
//                 <td>
//                   {selectedSemester === "Sem 1"
//                     ? item.sem1EndDate
//                     : item.sem2EndDate}
//                 </td>
//                 <td>{item.reference || "-"}</td>
//                 <td>
//                   <button
//                     onClick={() => {
//                       fetchItemData(item.week);
//                       itemModalOpen(true);
//                     }}
//                   >
//                     View Details
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Modals */}
//         {isModalOpen && (
//           <div className="model">
//             <h3 className="sub-header">Set New Semester Date</h3>
//             <p className="sub-text">
//               Insert the start date for the first week of the semester.
//             </p>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 setSemDate();
//               }}
//             >
//               <div className="label">
//                 <label>Semester:</label>
//                 <select
//                   name="semester"
//                   value={newDate.semester}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select</option>
//                   <option value="sem1">Semester 1</option>
//                   <option value="sem2">Semester 2</option>
//                 </select>
//               </div>
//               <div className="label">
//                 <label>Start Date:</label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   value={newDate.startDate}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="form-btn">
//                 <button type="submit">Set</button>
//                 <button type="button" onClick={() => setIsModalOpen(false)}>
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//         {itemModal && (
//           <div className="model">
//             <h3 className="sub-header">Item Required</h3>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Item</th>
//                   <th>Category</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {itemData.map((item) => (
//                   <tr key={item.name}>
//                     <td>{item.name}</td>
//                     <td>{item.category}</td>
//                     <td>
//                       <button onClick={() => handleRemove(item)}>
//                         <MdDelete />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             <button onClick={() => itemModalOpen(false)}>Close</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Settings;

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
        <div className="bg-white rounded-lg shadow mb-8">
          <table className="min-w-full">
            <thead>
              <tr lassName="bg-gray-100 rounded-t-lg">
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 first:rounded-tl-lg last:rounded-tr-lg">
                  WEEK
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 first:rounded-tl-lg last:rounded-tr-lg">
                  START DATE
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 first:rounded-tl-lg last:rounded-tr-lg">
                  END DATE
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 first:rounded-tl-lg last:rounded-tr-lg">
                  REFERENCE
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 first:rounded-tl-lg last:rounded-tr-lg">
                  ITEM REQUEST
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weekData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-center border-0">{item.week}</td>
                  <td className="px-6 py-4 text-center border-0">
                    {selectedSemester === "Sem 1"
                      ? item.sem1StartDate
                      : item.sem2StartDate}
                  </td>
                  <td className="px-6 py-4 text-center border-0">
                    {selectedSemester === "Sem 1"
                      ? item.sem1EndDate
                      : item.sem2EndDate}
                  </td>
                  <td className="px-6 py-4 text-center border-0">{item.reference || "-"}</td>
                  <td className="px-6 py-4 text-center border-0">
                    <button
                      className="bg-gray-500 text-white border-0 px-4 py-2 rounded-md cursor-pointer font-medium transition-all duration-200 ease-in-out hover:bg-gray-600"
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
        </div>

        {/* Modals */}
        {isModalOpen && (
          <div className="model">
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 flex ml-auto"
            >
              ✕
            </button>
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
            <div className="bg-white rounded-lg shadow mt-4 mb-8">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 rounded-t-lg">
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 rounded-tl-lg">
                      ITEM
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                      CATEGORY
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 rounded-tr-lg" >
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  { itemData.length >0 ? 
                    itemData.map((item) => (
                    <tr key={item.name}>
                      <td className="px-6 py-4 text-center border-0">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-center border-0">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-center border-0">
                        <button 
                          className="bg-red-500 text-white rounded-md p-2 cursor-pointer transition duration-200 ease-in-out hover:bg-red-600 focus:outline-none"
                          onClick={() => handleRemove(item)}>
                          <MdDelete className="text-2xl"/>
                        </button>
                      </td>
                    </tr>
                  ))
                  : <p>No record found.</p>}

                  {isAdding && (
                    <tr>
                      <td className="px-6 py-4 text-center border-0">
                        <input
                          type="text"
                          placeholder="Item Name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                      </td>
                      <td className="px-6 py-4 text-center border-0">
                        <input
                          type="text"
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Item Category"
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        />
                      </td>
                      <td className="px-6 py-4 text-center border-0">
                        <button 
                          className="bg-green-500 text-white border-0 px-4 py-2 rounded-md cursor-pointer font-medium transition-all duration-200 ease-in-out hover:bg-green-600" 
                          onClick={handleAddItem}>
                            Add
                        </button>
                      </td>
                      </tr>
                    )}

                </tbody>
              </table>
            </div>

            <br></br>
            <div className="form-btn">
              {!isAdding && (
                <button
                  type="create"
                    onClick={() => {
                      setIsAdding(true);
                      setNewItem({ ...newItem, docId: itemData[0].docId })
                    }} 
                >Add
                </button>
              )}
              <button 
                className="bg-gray-500 text-white border-0 px-4 py-2 rounded-md cursor-pointer font-medium transition-all duration-200 ease-in-out hover:bg-gray-600"
                onClick={() => itemModalOpen(false)}>
                  Close
              </button>
            </div>
          </div>
        )}

        {itemModal && (
            <div
                className="model-bck"
                onClick={() => itemModalOpen(false)}
            />
        )}

        {isModalOpen && (
          <div
              className="model-bck"
              onClick={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;