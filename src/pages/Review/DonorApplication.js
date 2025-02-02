import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaList } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const formatDate = (date) => {
  if (!date) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options).replace(',', ',');
};

function DonorApplication() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('Pending'); // Default to Pending
  const [campusFilter, setCampusFilter] = useState('All Campuses');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'donations'), (querySnapshot) => {
      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt
            ? doc.data().createdAt.toDate().toLocaleDateString('en-US')
            : 'N/A',
        }))
        .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setApplications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const campusMapping = {
    Main: [
      'Main Campus Library',
      'Main Campus Reception',
      'Main Campus Student Center',
    ],
    Engineering: [
      'Engineering Campus Library',
      'Engineering Campus Reception',
      'Engineering Campus Student Center',
    ],
    Health: [
      'Health Campus Library',
      'Health Campus Reception',
      'Health Campus Student Center',
    ],
  };

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
    pending: applications.filter(
      (app) => app.status === 'Pending' && (campusFilter === 'All Campuses' || campusMapping[campusFilter]?.includes(app.dropoffLocation))
    ).length,
    approved: applications.filter(
      (app) => app.status === 'Successful' && (campusFilter === 'All Campuses' || campusMapping[campusFilter]?.includes(app.dropoffLocation))
    ).length,
    rejected: applications.filter(
      (app) => app.status === 'Unsuccessful' && (campusFilter === 'All Campuses' || campusMapping[campusFilter]?.includes(app.dropoffLocation))
    ).length,
    total: applications.filter(
      (app) => campusFilter === 'All Campuses' || campusMapping[campusFilter]?.includes(app.dropoffLocation)
    ).length,
  };

  const filteredApplications = applications.filter((app) => {
    if (filter !== 'All' && app.status !== filter) return false;
    if (campusFilter !== 'All Campuses' && !campusMapping[campusFilter]?.includes(app.dropoffLocation)) return false;
    return true;
  });

  const handleFilterChange = (status) => {
    if (status === 'Approved') {
      setFilter('Successful');
    } else if (status === 'Rejected') {
      setFilter('Unsuccessful');
    } else {
      setFilter(status);
    }
  };

  const handleCampusFilterChange = (e) => {
    setCampusFilter(e.target.value);
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="section-header">Donor Application Dashboard</h1>
          <select
            id="campusFilter"
            className="text-base block pl-3 pr-8 py-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            value={campusFilter}
            onChange={handleCampusFilterChange}
          >
            <option value="All Campuses">All Campuses</option>
            <option value="Main">Main</option>
            <option value="Engineering">Engineering</option>
            <option value="Health">Health</option>
          </select>
        </div>

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
                  <TableCell value={formatDate(app.date)} />
                  <td className="px-6 py-4 text-center border-0">
                    <button
                      className="px-4 py-2 text-sm font-medium !bg-gray-500 text-white rounded-md hover:!bg-gray-600 transition duration-300"
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
                          : app.status === 'Unsuccessful'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center border-0 flex justify-center gap-2">
                    {app.status === 'Pending' ? (
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
                    ) : (
                      <span>No action is required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p>{formatDate(application.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p>{application.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p>{application.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Item Type</p>
                <p>{application.itemType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p>{application.numberOfItems}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Delivery Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Delivery Method</p>
                <p>{application.pickupNeeded ? 'Pickup' : 'Drop-off'}</p>
              </div>
              {!application.pickupNeeded && (
                <div>
                  <p className="text-sm text-gray-500">Drop-off Location</p>
                  <p>{application.dropoffLocation || 'N/A'}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Preferred Date</p>
                <p>{formatDate(application.preferredDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Time</p>
                <p>{application.preferredTime || 'N/A'}</p>
              </div>
            </div>
          </div>
          {application.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
              <p>{application.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default DonorApplication;