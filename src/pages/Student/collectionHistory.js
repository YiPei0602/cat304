import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import app from '../../firebase';
import Sidebar from '../../components/Sidebar';
import { FaSearch, FaFilter } from "react-icons/fa";

const CollectionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('userRole');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    status: []
  });

  const categories = ["Food", "Hygiene Products", "Daily Supplies", "School Supplies"];
  const statuses = ["Ready to collect", "Collected", "Pending"];

  const fetchHistory = async () => {
    try {
      const db = getFirestore(app);
      const historyRef = collection(db, 'collectionHistory');
      const historyQuery = query(
        historyRef, 
        where('userId', '==', userId),
        orderBy('collectedAt', 'desc')
      );
      
      const snapshot = await getDocs(historyQuery);
      const historyList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHistory(historyList);
      setFilteredHistory(historyList);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, selectedFilters]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterHistory = () => {
    let filtered = [...history];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName?.toLowerCase().includes(lowercasedTerm) ||
        item.category?.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter(item => selectedFilters.category.includes(item.category));
    }

    if (selectedFilters.status.length > 0) {
      filtered = filtered.filter(item => selectedFilters.status.includes(item.status));
    }

    setFilteredHistory(filtered);
  };

  const handleFilterChange = (e, filterType) => {
    const value = e.target.value;
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const generateQRData = (item) => {
    return JSON.stringify({
      collectionId: item.id,
      userId: item.userId,
      userName: item.userName,
      itemName: item.itemName,
      category: item.category,
      collectedAt: item.collectedAt
    });
  };

  if (loading) {
    return (
      <div className="ocean">
        <div className="wave"></div>
        <div className="wave"></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={role} />
      <div className="dashboard-content">
        <h1>Your Collection History</h1>
        
        <div className="row">
          <div className="search-bar">
            <input 
              className="input-search" 
              type="text" 
              placeholder="Search history..."
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
                <th>Date</th>
                <th>Status</th>
                <th>QR Code</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(item => (
                <tr key={item.id}>
                  <td>{item.itemName}</td>
                  <td>{item.category}</td>
                  <td>{item.collectedAt?.seconds ? new Date(item.collectedAt.seconds * 1000).toLocaleDateString() : '-'}</td>
                  <td
                    style={{
                      color: item.status === 'Ready to collect' ? 'green' : 
                             item.status === 'Collected' ? 'gray' : 
                             item.status === 'Pending' ? 'orange': 'black',
                      fontWeight: 'bold'
                    }}
                  >
                    {item.status}
                  </td>
                  <td>
                    {item.status === 'Ready to collect' && (
                      <Popup
                        trigger={
                          <span style={{
                            color: 'blue',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}>
                            Show QR Code
                          </span>
                        }
                        modal
                        nested
                      >
                        {close => (
                          <div className="relative p-6">
                            <button
                              onClick={close}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                background: 'none',
                                border: 'none',
                                color: 'black',
                                fontSize: '18px',
                                cursor: 'pointer'
                              }}
                            >
                              &times;
                            </button>
                            <div className="flex flex-col items-center">
                              <h2 className="text-xl font-bold mb-4">Collection QR Code</h2>
                              <QRCodeSVG 
                                value={generateQRData(item)}
                                size={200}
                                level="H"
                              />
                              <div className="mt-4 text-center">
                                <p className="font-semibold">{item.itemName}</p>
                                <p className="text-gray-600">{item.category}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Popup>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filterOpen && (
          <>
            <div className="model">
              <h3>Filter Collections</h3>
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

                <div className="filter-section">
                  <h4>Status</h4>
                  {statuses.map((status) => (
                    <label key={status}>
                      <input
                        type="checkbox"
                        value={status}
                        checked={selectedFilters.status.includes(status)}
                        onChange={(e) => handleFilterChange(e, "status")}
                      />
                      {status}
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
      </div>
    </div>
  );
};

export default CollectionHistory;