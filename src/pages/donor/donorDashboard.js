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
