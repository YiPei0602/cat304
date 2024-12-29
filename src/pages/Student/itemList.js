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
