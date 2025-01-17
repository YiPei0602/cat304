import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import Popup from 'reactjs-popup';
import DatePicker from 'react-datepicker';
import 'reactjs-popup/dist/index.css';
import 'react-datepicker/dist/react-datepicker.css';
import app from '../../firebase';
import Sidebar from '../../components/Sidebar';

const CollectionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('userRole');

  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    status: '',
    dateRange: 'all',
    startDate: null,
    endDate: null,
  });

  const categoryColors = {
    "Food": "bg-red-100 text-red-800",
    "Hygiene Products": "bg-blue-100 text-blue-800",
    "Daily Supplies": "bg-green-100 text-green-800",
    "School Supplies": "bg-yellow-100 text-yellow-800",
  };

  useEffect(() => {
    const db = getFirestore(app);
    const historyRef = collection(db, 'collectionHistory');
    const historyQuery = query(
      historyRef,
      where('userId', '==', userId),
      orderBy('collectedAt', 'desc')
    );

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const historyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(historyList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const filterHistory = () => {
    let filtered = [...history];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName?.toLowerCase().includes(searchLower) ||
          item.category?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.collectedAt.seconds * 1000);
        return itemDate >= filters.startDate && itemDate <= filters.endDate;
      });
    }

    return filtered;
  };

  const generateQRData = (item) => {
    return JSON.stringify({
      collectionId: item.id,
      userId: item.userId,
      userName: item.userName,
      itemName: item.itemName,
      category: item.category,
      collectedAt: item.collectedAt,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const filteredHistory = filterHistory();

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={role} />
      <div className="dashboard-content">
        <div className="p-6">
          <h1 className="section-header">Your Collection History</h1>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="rounded-md border-gray-300 w-full pl-3"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
                className="rounded-md border-gray-300"
              >
                <option value="">All Categories</option>
                {Object.keys(categoryColors).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="rounded-md border-gray-300"
              >
                <option value="">All Statuses</option>
                <option value="Ready to collect">Ready to Collect</option>
                <option value="Collected">Collected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container bg-white p-4 rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Item Name</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">QR Code</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{item.itemName}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded ${categoryColors[item.category]}`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {item.collectedAt?.seconds
                        ? new Date(item.collectedAt.seconds * 1000).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-2">{item.status}</td>
                    <td className="px-4 py-2">
                      {item.status === 'Ready to collect' && (
                        <Popup trigger={<button>Show QR</button>} modal>
                          <QRCodeSVG value={generateQRData(item)} size={150} />
                        </Popup>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionHistory;
