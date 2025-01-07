//admin dashboard
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { Bar } from 'react-chartjs-2';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import app from '../../firebase';

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
    const [chartData, setChartData] = useState({labels: [], datasets: [] });

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

    const fetchBarData = useCallback(async () => {
        try{
            const accessRef = collection(db, 'access');
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

            setChartData({
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

    useEffect(() => {
        fetchMetrics();
        fetchBarData();
    }, [fetchMetrics, fetchBarData]);

    return (
        <div className="dashboard-layout">
            <Sidebar userRole={role} />
            <div className="dashboard-content">
                <div className="container mx-auto">
                    <h1>Dashboard</h1>
                    <h2>Welcome, {name}</h2>
                    <p>Your role is {role}</p>

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

                        <div>
                            <h2>Monthly Access Trend</h2>
                            <Bar
                                data={chartData}
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
                                                text: "Year-Month",
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: "Total Access",
                                            },
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                            />
                        </div>                       

                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
