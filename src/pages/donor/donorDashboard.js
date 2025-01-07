<<<<<<< HEAD
// donor dashboard
import { useLocation } from "react-router-dom";
import Sidebar from '../../components/Sidebar';

const DonorDashboard = () =>{
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

export default DonorDashboard;
=======
// donor dashboard
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import DonationForm from './DonationForm';

const DonorDashboard = () => {
    const location = useLocation();
    //const navigate = useNavigate();
    const [metrics, setMetrics] = useState({
        totalDonations: 0,
        itemsDonated: 0,
        topCategory: '-'
    });
    const [recentDonations, setRecentDonations] = useState([]);
    const [showDonationForm, setShowDonationForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const role = location.state?.role || localStorage.getItem('userRole');
    const name = location.state?.name || localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    const fetchDonorMetrics = useCallback(async () => {
        try {
            const donationsRef = collection(db, 'donations');
            const q = query(donationsRef, where('donorId', '==', userId));
            const querySnapshot = await getDocs(q);
            
            let totalItems = 0;
            const categoryItemCount = {};
            
            querySnapshot.forEach((doc) => {
                const donation = doc.data();
                const itemCount = parseInt(donation.numberOfItems) || 0;
                totalItems += itemCount;
                
                if (donation.category) {
                    categoryItemCount[donation.category] = (categoryItemCount[donation.category] || 0) + itemCount;
                }
            });

            const topCategory = Object.entries(categoryItemCount).length > 0 
                ? Object.entries(categoryItemCount).reduce((a, b) => (a[1] > b[1] ? a : b), ['', 0])[0]
                : '-';

            console.log('Category item counts:', categoryItemCount);
            console.log('Top category:', topCategory);

            setMetrics({
                totalDonations: querySnapshot.size,
                itemsDonated: totalItems,
                topCategory: topCategory
            });
        } catch (error) {
            console.error("Error fetching metrics:", error);
        }
    }, [userId]);

    const fetchRecentDonations = useCallback(async () => {
        try {
            console.log('Fetching recent donations for userId:', userId);

            const donationsRef = collection(db, 'donations');
            const q = query(
                donationsRef,
                where('donorId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(3)
            );

            const querySnapshot = await getDocs(q);
            console.log('Query snapshot size:', querySnapshot.size);

            if (querySnapshot.empty) {
                console.log('No donations found for this user');
                setRecentDonations([]);
                return;
            }

            const donations = querySnapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Raw donation data:', data);
                
                return {
                    id: doc.id,
                    category: data.category,
                    status: data.status || 'Pending',
                    date: data.createdAt?.toDate() || new Date(),
                    itemType: data.itemType,
                    numberOfItems: data.numberOfItems
                };
            });

            console.log('Processed donations:', donations);
            setRecentDonations(donations);

        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.error('Missing index error. Please create a composite index for:');
                console.error('Collection: donations');
                console.error('Fields indexed: donorId (Ascending), createdAt (Descending)');
            } else {
                console.error("Error in fetchRecentDonations:", error);
            }
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchDonorMetrics();
            fetchRecentDonations();
        }
    }, [userId, fetchDonorMetrics, fetchRecentDonations]);

    useEffect(() => {
        console.log('Recent donations state updated:', recentDonations);
    }, [recentDonations]);

    const categories = [
        { name: 'Food', description: 'Basic nourishment to support students\' daily energy needs' },
        { name: 'School Supplies', description: 'Materials required for academic work and learning.' },
        { name: 'Household Essentials', description: 'Basic items required for everyday living and household upkeep.' },
        { name: 'Personal Care Products', description: 'Items for maintaining personal cleanliness and grooming.' },
        { name: 'Others', description: 'Items that may not fit into other categories.' }
    ];

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setShowDonationForm(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDonationSuccess = () => {
        setShowDonationForm(false);
        fetchDonorMetrics();
        fetchRecentDonations();
    };

    return (
        <div className="dashboard-layout">
            <Sidebar userRole={role} />
            <div className="dashboard-content p-6">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Donor Dashboard</h1>
                    <h2 className="text-xl mb-8">Welcome, {name}</h2>

                    {/* Metrics Display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600">Number of Donations</p>
                            <p className="text-3xl font-bold">{metrics.totalDonations}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600">Items Donated</p>
                            <p className="text-3xl font-bold">{metrics.itemsDonated}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600">Top Donated Category</p>
                            <p className="text-3xl font-bold">{metrics.topCategory}</p>
                        </div>
                        <Link 
                            to="/donor/history"
                            className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            View Full History
                        </Link>
                    </div>

                    {/* Recent Donations Table */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <h3 className="text-xl font-semibold p-6 border-b">Recent Donations</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Item Type</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentDonations.map((donation) => (
                                        <tr key={donation.id}>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Donation Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 col-span-full">
                            {categories.slice(0, 3).map((category) => (
                                <div 
                                    key={category.name}
                                    className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow w-full"
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                                    <p className="text-gray-600">{category.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-full md:w-2/3">
                            {categories.slice(3).map((category) => (
                                <div 
                                    key={category.name}
                                    className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow w-full"
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                                    <p className="text-gray-600">{category.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Donation Form Modal */}
                    {showDonationForm && (
                        <DonationForm
                            category={selectedCategory}
                            onClose={() => setShowDonationForm(false)}
                            onSubmitSuccess={handleDonationSuccess}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;
>>>>>>> Jiajoo
