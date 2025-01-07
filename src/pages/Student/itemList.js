<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import app from '../../firebase';
import Sidebar from '../../components/Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { FaFilter } from "react-icons/fa6";

const ItemList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const role = location.state?.role || localStorage.getItem('userRole');

  // New states for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: []
    // stock_level: []
  });

  const categories = ["Food", "Hygiene Products", "Daily Supplies", "School Supplies"];
//   const stockLevels = ["High", "Medium", "Low"];

//   useEffect(() => {
//     fetchItems();
//   }, [userId]);

//   useEffect(() => {
//     filterItems(searchTerm);
//   }, [items, searchTerm, selectedFilters]);

//   const fetchItems = async () => {
//     try {
//       const db = getFirestore(app);
//       const userDoc = await getDoc(doc(db, 'users', userId));
//       const matricNum = userDoc.data().matric_num;

//       const studentsRef = collection(db, 'students');
//       const studentQuery = query(studentsRef, where('matricNo', '==', matricNum));
//       const studentSnapshot = await getDocs(studentQuery);
      
//       if (!studentSnapshot.empty) {
//         const studentCampus = studentSnapshot.docs[0].data().campus;
//         const inventoryRef = collection(db, 'inventory');
//         const inventoryQuery = query(inventoryRef, where('campus', '==', studentCampus));
//         const inventorySnapshot = await getDocs(inventoryQuery);
        
//         const itemsList = inventorySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setItems(itemsList);
//         setFilteredItems(itemsList);
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error('Error:', error);
//       setLoading(false);
//     }
//   };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

//   const filterItems = (term) => {
//     let filtered = [...items];

//     // Apply search term filter
//     if (term) {
//       const lowercasedTerm = term.toLowerCase();
//       filtered = filtered.filter(item =>
//         item.item_name.toLowerCase().includes(lowercasedTerm) ||
//         item.category.toLowerCase().includes(lowercasedTerm)
//       );
//     }

//     // Apply category filters
//     if (selectedFilters.category.length > 0) {
//       filtered = filtered.filter(item => selectedFilters.category.includes(item.category));
//     }

//     setFilteredItems(filtered);
//   };

const fetchItems = useCallback(async () => {
    try {
      const db = getFirestore(app);
      const userDoc = await getDoc(doc(db, 'users', userId));
      const matricNum = userDoc.data().matric_num;

      const studentsRef = collection(db, 'students');
      const studentQuery = query(studentsRef, where('matricNo', '==', matricNum));
      const studentSnapshot = await getDocs(studentQuery);
      
      if (!studentSnapshot.empty) {
        const studentCampus = studentSnapshot.docs[0].data().campus;
        const inventoryRef = collection(db, 'inventory');
        const inventoryQuery = query(inventoryRef, where('campus', '==', studentCampus));
        const inventorySnapshot = await getDocs(inventoryQuery);
        
        const itemsList = inventorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(itemsList);
        setFilteredItems(itemsList);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }, [userId]);

  const filterItems = useCallback((term) => {
    let filtered = [...items];

    if (term) {
      const lowercasedTerm = term.toLowerCase();
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(lowercasedTerm) ||
        item.category.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter(item => selectedFilters.category.includes(item.category));
    }

    setFilteredItems(filtered);
  }, [items, selectedFilters.category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    filterItems(searchTerm);
  }, [filterItems, searchTerm]);

  const handleFilterChange = (e, filterType) => {
    const value = e.target.value;
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleCollect = async (itemId, currentQuantity) => {
    const itemName = items.find(item => item.id === itemId)?.item_name;
    const category = items.find(item => item.id === itemId)?.category;

    if (currentQuantity < 1) {
      alert('Item out of stock!');
      return;
    }

    try {
      const db = getFirestore(app);
      
      const itemRef = doc(db, 'inventory', itemId);
      await updateDoc(itemRef, {
        quantity: currentQuantity - 1
      });

      const historyRef = collection(db, 'collectionHistory');
      await addDoc(historyRef, {
        userId,
        userName,
        itemId,
        itemName,
        category,
        collectedAt: serverTimestamp(),
        status: "Ready to collect"
      });

      alert('Item collected successfully!');
      fetchItems();
      navigate('/collectionHistory');
    } catch (error) {
      console.error('Error collecting item:', error);
      alert('Failed to collect item');
    }
  };

  if (loading) return (
    <div className="ocean">
      <div className="wave"></div>
      <div className="wave"></div>
      <h2>Loading...</h2>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={role} />
      <div className="dashboard-content">
        <h1>Available Items</h1>
        
        <div className="row">
          <div className="search-bar">
            <input 
              className="input-search" 
              type="text" 
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="search-btn">
              <FaSearch />
            </button>
            <button className="filter-btn" onClick={() => setFilterOpen(true)}>
              <FaFilter />
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.item_name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <button
                      onClick={() => handleCollect(item.id, item.quantity)}
                      disabled={item.quantity < 1}
                    //   style={{
                    //     background: 'none',
                    //     border: 'none',
                    //     color: item.quantity < 1 ? 'grey' : 'blue',
                    //     textDecoration: item.quantity < 1 ? 'none' : 'underline',
                    //     cursor: item.quantity < 1 ? 'default' : 'pointer',
                    //   }}
                    >
                      {item.quantity < 1 ? 'Out of Stock' : 'Collect'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filterOpen && (
          <>
            <div className="model">
              <h3>Filter Items</h3>
              <div className="filter-container">
                <div className="filter-section">
                  <h4>Category</h4>
                  {categories.map((category) => (
                    <label key={category}>
                      <input
                        type="checkbox"
                        value={category}
                        checked={selectedFilters.category.includes(category)}
                        onChange={(e) => handleFilterChange(e, "category")}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
              
              <button className="close-btn" onClick={() => setFilterOpen(false)}>
                Close
              </button>
            </div>
            <div 
              className="model-bck"
              onClick={() => setFilterOpen(false)}
            />
          </>
        )}

        <p>
          Don't have the item you want?{' '}
          <span
            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => navigate('/requestform')}
          >
            Click here to request
          </span>
        </p>
      </div>
    </div>
  );
};

export default ItemList;
=======
import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const ItemList = () => {
    const location = useLocation();
    const role = location.state?.role || localStorage.getItem('userRole');
    // const name = location.state?.name || localStorage.getItem('userName');

    return (
        <div className="dashboard-layout">
            <Sidebar userRole={role} />
            <div className="dashboard-content">
                <div className="container">
                    <h1>Item List</h1>
                </div>
            </div>
        </div>
    );
};

export default ItemList;
>>>>>>> Jiajoo
