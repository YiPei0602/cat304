import { useLocation } from "react-router-dom";

const Dashboard = () => {
    const location = useLocation();
    const { role, name } = location.state;

    return (
        <div className="container text-center mt-5">
            <h1>Dashboard</h1>
            <h2>Welcome, {name}</h2>
            <p>Your role is  {role}</p>
        </div>
    )
};

export default Dashboard;