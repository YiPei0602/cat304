import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from "../../components/Header";
import { Bar, Pie } from 'react-chartjs-2';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import app from '../../firebase';
import "./admin.css";

// icons
import { IoCaretBack } from "react-icons/io5";
import { IoCaretForward } from "react-icons/io5";

const AdminDashboard = () =>{
    const location = useLocation();
    const role = location.state?.role || localStorage.getItem('userRole');
    const name = location.state?.name || localStorage.getItem('userName');
    
    const db = getFirestore(app);

    const [metrics, setMetrics] = useState({
        accessNum: 0,
        accessMonth: 0,
        pendingAppication:0,
        donationNum: 0
    });
    const [barData, setBarData] = useState({labels: [], datasets: [] });
    const [pieData, setPieData] = useState(null);
    const [history, setHistory] = useState([]);

    const fetchMetrics = useCallback(async () => {
        try {
            const accessRef = collection(db, 'collectionHistory');
            const donateRef = collection(db, 'donations');
            const q1 = query(accessRef, where('status', '==', "Collected"));
            const q2 = query(donateRef, where ('status', 'in', ["Pending", "Successful"]));
            const query1Snapshot = await getDocs(q1);
            const query2Snapshot = await getDocs(q2);

            let totalAccess = 0;
            let totalMonthAccess = 0;

            const targetYear = 2025;
            const targetMonth = 0;

            query1Snapshot.forEach((doc) => {
                const access = doc.data();
                const itemCount = parseInt(access.numItem) || 0;
                totalAccess += itemCount;
                
                if (access.collectedAt) {
                    const collectedDate = new Date(access.collectedAt.seconds * 1000); // Convert Firestore timestamp to JS Date
                    const collectedYear = collectedDate.getFullYear();
                    const collectedMonth = collectedDate.getMonth();

                    if (collectedYear === targetYear && collectedMonth === targetMonth) {
                        totalMonthAccess += itemCount; // Increment count for the target month
                    }
                }
            });

            let pendingCount = 0;
            let successCount = 0;

            query2Snapshot.forEach((doc) => {
                const donation = doc.data(); 
                if (donation.status === "Pending") {
                    pendingCount++; 
                } else if (donation.status === "Successful") {
                    successCount++; 
                }
            })

            setMetrics({
                accessNum: totalAccess,
                accessMonth: totalMonthAccess,
                pendingAppication: pendingCount,
                donationNum: successCount
            })
        } catch(error) {
            console.error("Error fetching metrics:", error);
        }
    }, [db]);

    const fetchBarChart = useCallback(async () => {
        try{
            const accessRef = collection(db, 'collectionHistory');
            const q = query(accessRef, where('status', '==', "Collected"));
            const querySnapshot = await getDocs(q);

            const monthlyAccess = {};

            querySnapshot.forEach((doc) => {
                const access = doc.data();
                const itemCount = parseInt(access.numItem) || 0;

                if (access.collectedAt) {
                    const collectedDate = new Date(access.collectedAt.seconds * 1000);
                    const year = collectedDate.getFullYear();
                    const month = collectedDate.getMonth() + 1;
                    const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;
                    
                    monthlyAccess[yearMonth] = (monthlyAccess[yearMonth] || 0) + itemCount;
                }
            });

            const labels = Object.keys(monthlyAccess).sort();
            const data = labels.map((label) => monthlyAccess[label]);

            setBarData({
                labels,
                datasets: [
                    {
                        label: "Monthly Access Trend",
                        data,
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            });

        } catch (error) {
            console.error("Error fetching access data: ", error);
        }
    }, [db]);
    
    const fetchPieChart = useCallback(async () => {
        try {
            const q = query(
                collection(db, "collectionHistory"),
                where('status', '==', "Collected"),
            );

            const querySnapshot = await getDocs(q);

            console.log("Query Snapshot Data:", querySnapshot.docs.map(doc => doc.data()));

            const itemTotals = {};

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // const { item_name, numItem } = data;

                const name = data.itemName;
                const num = data.numItem;

                console.log(name, num);

                // console.log(item_name);

                if (name && num) {
                        if (itemTotals[name]) {
                            itemTotals[name] += parseInt(num);
                        } else {
                            itemTotals[name] = parseInt(num);
                        }
                    }
            });

            const sortedItems = Object.entries(itemTotals)
                    .map(([name, total]) => ({ name, total }))
                    .sort((a, b) => b.total - a.total);

            const topItems = sortedItems.slice(0, 5);
            console.log(topItems);
            const labels = topItems.map(item => item.name);
            const data = topItems.map(item => item.total);
            console.log("Chart data:", { labels, data });
            setPieData({
                labels,
                datasets: [
                    {
                        label: "Top Items Accessed",
                        data,
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF"
                        ],
                    }
                ]
            });

        } catch (error) {
            console.error("Error fetching top items:", error);
        }
    }, [db]);

    const fetchHistory = async () => {
        const snapshot = await getDocs(collection(db, "collectionHistory"));
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setHistory(items);
    }

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = history.slice(indexOfFirstRow, indexOfLastRow);

    const handleNextPage = () => {
        if (currentRows.length === rowsPerPage) {
          setCurrentPage(currentPage + 1);
        }
      };

      const handlePreviousPage = () => {
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1); 
        }
      };

    useEffect(() => {
        fetchMetrics();
        fetchBarChart();
        fetchPieChart();
        fetchHistory();
    }, [fetchMetrics, fetchBarChart, fetchPieChart, fetchHistory]);

    return (
        <div className="dashboard-layout">
            <Sidebar userRole={role} />
            <div className="dashboard-content">
                <div className="container mx-auto">
                <h1 className="section-header">Dashboard</h1>
        <h2 className="sub-header">Welcome, {name}!</h2>
        <p className="sub-text">Your role is {role}</p>

                    {/* Metrics Display */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600">Total Number of Access</p>
                            <p className="text-3xl font-bold">{metrics.accessNum}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600">Access of the Month</p>
                            <p className="text-3xl font-bold">{metrics.accessMonth}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600">Number of Pending Application</p>
                            <p className="text-3xl font-bold">{metrics.pendingAppication}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600">Total Number of Success Donation</p>
                            <p className="text-3xl font-bold">{metrics.donationNum}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2>Monthly Access Trend</h2>
                            <Bar
                                data={barData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: "top",
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: "Month",
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: "Total Number of Student Access",
                                            },
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                            />
                        </div>

                            
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2>Top 5 Items Accessed</h2>
                            {pieData ? 
                                (pieData.datasets[0].data.length === 0 ? 
                                <p>No data available</p>:
                                <Pie data={pieData} />) 
                            : <p>Loading chart...</p>}
                        </div>
                    </div>         

                </div>

                {/* Collection History Table */}
                <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-semibold p-6 border-b leading-none m-0">Student Access History</h3>  
                        <div className="bg-white rounded-lg shadow px-4 py-2">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100 rounded-t-lg">
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 first:rounded-tl-lg last:rounded-tr-lg">
                                            STUDENT NAME
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                                            ITEM NAME
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                                            NUMBER OF ITEM
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                                            STATUS
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 last:rounded-tr-lg">
                                            ACCESS DATE
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    { history.length === 0 ? (
                                        <tr>
                                            <td colSpan = '8'>No results found</td>
                                        </tr>
                                    ) : (
                                        currentRows.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 text-center border-0">
                                                    {item.userName}
                                                </td>
                                                <td className="px-6 py-4 text-center border-0">
                                                    {item.itemName}
                                                </td>
                                                <td className="px-6 py-4 text-center border-0">
                                                    {item.numItem}
                                                </td>
                                                <td className="px-6 py-4 text-center border-0">
                                                    <span className={`px-2 py-1 text-xs rounded ${
                                                        item.status === 'Collected' ? 'bg-green-100 text-green-800' :
                                                        item.status === 'Ready to collect' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {item.status}
                                                    </span> 
                                                </td>

                                                <td className="px-6 py-4 text-center border-0">
                                                    {item.status === "Collected" ? 
                                                    new Date(item.collectedAt.toDate()).toLocaleDateString() : "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                
                    <div className='table-navigate flex justify-center items-center gap-4 mt-4'>
                        <button 
                            onClick={handlePreviousPage} 
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center px-4 py-2 text-black text-sm font-medium rounded-lg transition-all
                            ${currentPage === 1 
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}
                            `}>
                            <IoCaretBack className="mr-1"/>
                            Back
                        </button>
                        <p className="text-gray-800 text-sm font-semibold">{currentPage}</p>
                        {currentRows.length === rowsPerPage && (
                        <button 
                            className="flex items-center justify-center px-4 py-2 text-black text-sm font-medium bg-indigo-600 rounded-lg transition-all hover:bg-indigo-700 active:scale-95"
                            onClick={handleNextPage}>
                            <IoCaretForward className="ml-1"/>
                            Next
                        </button>
                    )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;