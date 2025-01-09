import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaList } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

function DonorApplication() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch applications in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'donations'), (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt
          ? doc.data().createdAt.toDate().toLocaleDateString('en-US')
          : 'N/A',
      }));
      setApplications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update status in Firebase
  const handleStatusChange = async (id, newStatus) => {
    try {
      const applicationRef = doc(db, 'donations', id);
      await updateDoc(applicationRef, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const stats = {
    pending: applications.filter((app) => app.status === 'Pending').length,
    approved: applications.filter((app) => app.status === 'Approved').length,
    rejected: applications.filter((app) => app.status === 'Rejected').length,
    total: applications.length,
  };

  const filteredApplications =
    filter === 'All'
      ? applications
      : applications.filter((app) => app.status === filter);

  const handleFilterChange = (status) => {
    setFilter(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar userRole="admin" />
      <div className="dashboard-content p-6">
        <h1 className="text-2xl font-bold mb-6">Donor Application Dashboard</h1>

        {/* Stats Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatButton
            color="#FCE7A2"
            iconColor="#FCD34D"
            icon={<FaClock />}
            title="Pending"
            value={stats.pending}
            onClick={() => handleFilterChange('Pending')}
          />
          <StatButton
            color="#C6F6D5"
            iconColor="#68D391"
            icon={<FaCheckCircle />}
            title="Approved"
            value={stats.approved}
            onClick={() => handleFilterChange('Approved')}
          />
          <StatButton
            color="#FEB2B2"
            iconColor="#FC8181"
            icon={<FaTimesCircle />}
            title="Rejected"
            value={stats.rejected}
            onClick={() => handleFilterChange('Rejected')}
          />
          <StatButton
            color="#E2E8F0"
            iconColor="#CBD5E0"
            icon={<FaList />}
            title="Total"
            value={stats.total}
            onClick={() => handleFilterChange('All')}
          />
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 rounded-t-lg">
                <TableHeader title="Name" />
                <TableHeader title="Email" />
                <TableHeader title="Category" />
                <TableHeader title="Date" />
                <TableHeader title="Application" />
                <TableHeader title="Status" />
                <TableHeader title="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr
                  key={app.id}
                  className="bg-white transition-colors duration-200 ease-in-out hover:bg-gray-100"
                >
                  <TableCell value={app.name} />
                  <TableCell value={app.email} />
                  <TableCell value={app.category} />
                  <TableCell value={app.date} />
                  <td className="px-6 py-4 text-center border-0">
                  <button
  className="px-4 py-2 text-sm font-medium bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-300"
  onClick={() => setSelectedApplication(app)}
>
  View Details
</button>

                  </td>
                  <td className="px-6 py-4 text-center border-0">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        app.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : app.status === 'Successful'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center border-0 flex justify-center gap-2">
  {app.status === 'Pending' && (
    <>
      <button
        className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
        onClick={() => handleStatusChange(app.id, 'Successful')}
      >
        Approve
      </button>
      <button
        className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
        onClick={() => handleStatusChange(app.id, 'Unsuccessful')}
      >
        Reject
      </button>
    </>
  )}
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Application Details Modal */}
        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}
      </div>
    </div>
  );
}

const StatButton = ({ color, iconColor, icon, title, value, onClick }) => (
  <div
    className="flex items-center p-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
    style={{ backgroundColor: color }}
    onClick={onClick}
  >
    <div
      className="flex items-center justify-center w-14 h-14 rounded-full"
      style={{ backgroundColor: iconColor }}
    >
      {icon}
    </div>
    <div className="ml-3 text-left">
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-base font-medium">{title}</p>
    </div>
  </div>
);

const TableHeader = ({ title }) => (
  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
    {title}
  </th>
);

const TableCell = ({ value }) => (
  <td className="px-6 py-4 text-center border-0">{value}</td>
);

const ApplicationDetailsModal = ({ application, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Application Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
            <p><strong>Name:</strong> {application.name}</p>
            <p><strong>Email:</strong> {application.email}</p>
            <p><strong>Phone:</strong> {application.phone || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Donation Details</h3>
            <p><strong>Category:</strong> {application.category}</p>
            <p><strong>Item Type:</strong> {application.itemType}</p>
            <p><strong>Number of Items:</strong> {application.numberOfItems}</p>
          </div>
          {application.pickupNeeded ? (
            <p><strong>Pickup Required</strong></p>
          ) : (
            <p><strong>Drop-off Location:</strong> {application.dropoffLocation}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default DonorApplication;
