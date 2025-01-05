import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Pie, Bar } from 'react-chartjs-2';
import Sidebar from '../../components/Sidebar';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const DonationHistory = () => {
    const location = useLocation();
    const role = localStorage.getItem('userRole');
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        itemType: '',
        status: '',
        dateRange: 'all',
        startDate: null,
        endDate: null,
        searchTerm: ''
    });
    const [selectedDonation, setSelectedDonation] = useState(null);

    const categoryColors = {
        'Food': '#28a745',
        'School Supplies': '#007bff',
        'Household Essentials': '#fd7e14',
        'Personal Care Products': '#6f42c1',
        'Others': '#20c997'
    };

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchDonations();
    }, [userId]);

    const fetchDonations = async () => {
        try {
            const donationsRef = collection(db, 'donations');
            const q = query(
                donationsRef,
                where('donorId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const donationData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate() || new Date()
            }));
            setDonations(donationData);
        } catch (error) {
            console.error("Error fetching donations:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDonations = useMemo(() => {
        return donations.filter(donation => {
            const matchesCategory = !filters.category || donation.category === filters.category;
            const matchesItemType = !filters.itemType || donation.itemType === filters.itemType;
            const matchesStatus = !filters.status || donation.status === filters.status;
            const matchesSearch = !filters.searchTerm || 
                donation.category.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                donation.itemType?.toLowerCase().includes(filters.searchTerm.toLowerCase());

            let matchesDate = true;
            const donationDate = new Date(donation.date);

            if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
                matchesDate = donationDate >= filters.startDate && donationDate <= filters.endDate;
            } else if (filters.dateRange === '30days') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                matchesDate = donationDate >= thirtyDaysAgo;
            } else if (filters.dateRange === '6months') {
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                matchesDate = donationDate >= sixMonthsAgo;
            }

            return matchesCategory && matchesItemType && matchesStatus && matchesDate && matchesSearch;
        });
    }, [donations, filters]);

    // Prepare data for pie chart
    const pieChartData = useMemo(() => {
        const categoryCount = donations.reduce((acc, donation) => {
            acc[donation.category] = (acc[donation.category] || 0) + 1;
            return acc;
        }, {});

        const total = Object.values(categoryCount).reduce((a, b) => a + b, 0);

        return {
            labels: Object.keys(categoryColors),
            datasets: [{
                data: Object.keys(categoryColors).map(category => 
                    ((categoryCount[category] || 0) / total) * 100
                ),
                backgroundColor: Object.values(categoryColors),
                borderWidth: 1
            }]
        };
    }, [donations]);

    // Prepare data for bar chart
    const barChartData = useMemo(() => {
        const monthlyDonations = donations.reduce((acc, donation) => {
            const date = new Date(donation.date);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        }, {});

        return {
            labels: Object.keys(monthlyDonations).slice(-12),
            datasets: [{
                label: 'Number of Donations',
                data: Object.values(monthlyDonations).slice(-12),
                backgroundColor: '#007bff',
                borderColor: '#0056b3',
                borderWidth: 1,
                borderRadius: 5,
                hoverBackgroundColor: '#0056b3'
            }]
        };
    }, [donations]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="dashboard-layout">
            <Sidebar userRole={role} />
            <div className="dashboard-content">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Donation History</h1>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Search donations..."
                                className="rounded-md border-gray-300"
                                value={filters.searchTerm}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                            />
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="rounded-md border-gray-300"
                            >
                                <option value="">All Categories</option>
                                {Object.keys(categoryColors).map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="rounded-md border-gray-300"
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Successful">Successful</option>
                                <option value="Unsuccessful">Unsuccessful</option>
                            </select>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                                className="rounded-md border-gray-300"
                            >
                                <option value="all">All Time</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="6months">Last 6 Months</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {filters.dateRange === 'custom' && (
                            <div className="mt-4 flex gap-4">
                                <DatePicker
                                    selected={filters.startDate}
                                    onChange={date => setFilters(prev => ({ ...prev, startDate: date }))}
                                    placeholderText="Start Date"
                                    className="rounded-md border-gray-300"
                                />
                                <DatePicker
                                    selected={filters.endDate}
                                    onChange={date => setFilters(prev => ({ ...prev, endDate: date }))}
                                    placeholderText="End Date"
                                    className="rounded-md border-gray-300"
                                />
                            </div>
                        )}
                    </div>

                    {/* Move table before charts */}
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Item Type</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDonations.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{formatDate(donation.date)}</td>
                                        <td className="px-6 py-4">{donation.category}</td>
                                        <td className="px-6 py-4">{donation.itemType}</td>
                                        <td className="px-6 py-4">{donation.numberOfItems}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                donation.status === 'Successful' ? 'bg-green-100 text-green-800' :
                                                donation.status === 'Unsuccessful' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedDonation(donation)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Charts side by side using grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">Donations by Category</h2>
                            <div className="h-[300px] flex items-center justify-center">
                                <Pie 
                                    data={pieChartData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right'
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const label = context.label || '';
                                                        const value = context.raw || 0;
                                                        return `${label}: ${value.toFixed(1)}%`;
                                                    }
                                                }
                                            }
                                        }
                                    }} 
                                />
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">Donation Timeline</h2>
                            <div className="h-[300px]">
                                <Bar 
                                    data={barChartData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            }
                                        },
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        },
                                        animation: {
                                            duration: 2000
                                        }
                                    }} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Donation Details Modal */}
                    {selectedDonation && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">Donation Details</h2>
                                        <button
                                            onClick={() => setSelectedDonation(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Date</p>
                                                    <p>{formatDate(selectedDonation.date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Status</p>
                                                    <p>{selectedDonation.status}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Category</p>
                                                    <p>{selectedDonation.category}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Item Type</p>
                                                    <p>{selectedDonation.itemType}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Quantity</p>
                                                    <p>{selectedDonation.numberOfItems}</p>
                                                </div>
                                                {selectedDonation.expiryDate && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">Expiry Date</p>
                                                        <p>{formatDate(selectedDonation.expiryDate)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Delivery Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Delivery Method</p>
                                                    <p>{selectedDonation.pickupNeeded ? 'Pickup' : 'Drop-off'}</p>
                                                </div>
                                                {!selectedDonation.pickupNeeded && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">Drop-off Location</p>
                                                        <p>{selectedDonation.dropoffLocation}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm text-gray-500">Preferred Date</p>
                                                    <p>{formatDate(selectedDonation.preferredDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Preferred Time</p>
                                                    <p>{selectedDonation.preferredTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedDonation.description && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                                                <p>{selectedDonation.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonationHistory; 