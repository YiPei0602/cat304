<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/Sidebar';

const StudentDashboard = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    fetchCollectionData();
  }, [userId]);

  const fetchCollectionData = async () => {
    const db = getFirestore();
    const historyRef = collection(db, 'collectionHistory');
    const userQuery = query(historyRef, where('userId', '==', userId));
    
    try {
      const querySnapshot = await getDocs(userQuery);
      const items = querySnapshot.docs.map(doc => doc.data());
      
      const categoryCount = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      const pieData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value
      }));
      setCategoryData(pieData);

      const monthlyCount = items.reduce((acc, item) => {
        const date = new Date(item.collectedAt?.seconds * 1000);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {});

      const lineData = Object.entries(monthlyCount)
        .sort((a, b) => {
          const [monthA, yearA] = a[0].split('/');
          const [monthB, yearB] = b[0].split('/');
          return new Date(yearA, monthA) - new Date(yearB, monthB);
        })
        .map(([date, count]) => ({
          date,
          count
        }));
      setMonthlyData(lineData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <Sidebar userRole={role} />
      </div>
      <div className="dashboard-content">
        <div className="container py-4">
          <div className="row mb-4">
            <div className="col">
              <h1 className="h3">Collection Analytics</h1>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Items by Category</h5>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={130}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Monthly Collection Frequency</h5>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#8884d8" 
                          name="Items Collected"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
=======
//student dashboard 
import { useLocation } from "react-router-dom";
import Sidebar from '../../components/Sidebar';

const StudentDashboard = () => {
    const location = useLocation();
    const role = location.state?.role || localStorage.getItem('userRole');
    const name = location.state?.name || localStorage.getItem('userName');

    return (
        <div className="dashboard-layout">
            <Sidebar userRole={role} />
            <div className="dashboard-content">
                <div className="container">
                    <h1>Dashboard</h1>
                    <h2>Welcome, {name}</h2>
                    <p>Your role is {role}</p>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
>>>>>>> Jiajoo
