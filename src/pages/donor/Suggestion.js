import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import app from '../../firebase';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import Sidebar from '../../components/Sidebar';

// icons
import { IoCaretBack } from "react-icons/io5";
import { IoCaretForward } from "react-icons/io5";

const Suggestion = () => {

    const location = useLocation();
    const role = location.state?.role || localStorage.getItem('userRole');

    const db = getFirestore(app);

    const [history, setHistory] = useState([]);
    const [weekData, setWeekData] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("Sem 1");

    const handleToggle = () => {
        const nextSemester = selectedSemester === "Sem 1" ? "Sem 2" : "Sem 1";
        setSelectedSemester(nextSemester);
    };

    const fetchHistory = async () => {
        const snapshot = await getDocs(collection(db, "recipientRequests"));
        const rawData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const groupedData = rawData.reduce((acc, item) => {
            const { productName, category } = item;
    
            if (!acc[productName]) {
                acc[productName] = {
                    productName,
                    category,
                    count: 0,
                };
            }
    
            acc[productName].count += 1;
    
            return acc;
        }, {});

        const data = Object.values(groupedData).sort((a, b) => b.count - a.count);

        setHistory(data);
    };

    const fetchWeekData = async () => {
        const snapshot = await getDocs(collection(db, "weekRequiredItem"));
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const sortedData = data.sort((a, b) => a.week - b.week); // Always sort weeks in ascending order

        // Update weekData based on selected semester
        const filteredData = sortedData.map(item => {
            return {
                id: item.id,
                week: item.week,
                sem1StartDate: item.sem1StartDate,
                sem1EndDate: item.sem1EndDate,
                sem2StartDate: item.sem2StartDate,
                sem2EndDate: item.sem2EndDate,
                reference: item.reference,
                item: item.item,
            };
        });

        setWeekData(filteredData);
    };

    const [curReqPage, setCurReqPage] = useState(1);
    const [curWeekPage, setCurWeekPage] = useState(1);
    const rowsPerPage = 5;

    const reqLastIdx = curReqPage * rowsPerPage;
    const reqFirstIdx = reqLastIdx - rowsPerPage;
    const weekLastIdx = curWeekPage * rowsPerPage;
    const weekFirstIdx = weekLastIdx - rowsPerPage;
    const curReqRows = history.slice(reqFirstIdx, reqLastIdx);
    const curWeekRows = weekData.slice(weekFirstIdx, weekLastIdx);

    const handleNextPage = (type) => {
        if (type === "req" && curReqRows.length === rowsPerPage) {
            setCurReqPage((prev) => prev + 1);
        } else if (type === "week" && curWeekRows.length === rowsPerPage) {
            setCurWeekPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = (type) => {
        if (type === "req" && curReqPage > 1) {
            setCurReqPage((prev) => prev - 1);
        } else if (type === "week" && curWeekPage > 1) {
            setCurWeekPage((prev) => prev - 1);
        }
    };
      
    useEffect(() => {
        fetchHistory();
        fetchWeekData();
    }, [selectedSemester]);

    return(
    <div className="dashboard-layout">
      <Sidebar userRole={role}/>
      <div className="dashboard-content">
      <h1 className="section-header">Donation Suggestions</h1>

        {/* Student Request Item */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold p-6 border-b leading-none m-0">Request Item List</h3>
                <div className="bg-white rounded-lg shadow px-4 py-2">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-100 rounded-t-lg">
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 first:rounded-tl-lg last:rounded-tr-lg">
                                    ITEM NAME
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                                    ITEM CATEGORY
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 last:rounded-tr-lg">
                                    NUMBER OF REQUEST
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            { history.length === 0 ? (
                                <tr>
                                    <td colSpan = '8'>No results found</td>
                                </tr>
                            ) : (
                                curReqRows.map((item) => (
                                    <tr>
                                        <td className="px-6 py-4 text-center border-0">
                                            {item.productName}
                                        </td>
                                        <td className="px-6 py-4 text-center border-0">
                                            {item.category}
                                        </td>
                                        <td className="px-6 py-4 text-center border-0">
                                            {item.count}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                      
                    <div className="table-navigate flex justify-center items-center gap-4 mt-4">
                        <button 
                            onClick={() => handlePreviousPage('req')} 
                            disabled={curReqPage === 1}
                            className={`flex items-center justify-center px-4 py-2 text-black text-sm font-medium rounded-lg transition-all
                            ${curReqPage === 1 
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}
                            `}
                        >
                            <IoCaretBack className="mr-1" /> Back
                        </button>
                        <p className="text-gray-800 text-sm font-semibold">{curReqPage}</p>
                        {curReqRows.length === rowsPerPage && (
                            <button 
                                onClick={() => handleNextPage('req')}
                                className="flex items-center justify-center px-4 py-2 text-black text-sm font-medium bg-indigo-600 rounded-lg transition-all hover:bg-indigo-700 active:scale-95"
                            >
                                Next <IoCaretForward className="ml-1" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>


        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold p-6 border-b leading-none m-0">Weekly Suggest Item</h3>
                <button 
                    className={`toggle-button ${selectedSemester === "Sem 2" ? "active" : ""} ml-auto mr-6 mt-4 mb-4`} 
                    onClick={handleToggle}>
                    <span className={`toggle-text ${selectedSemester === "Sem 2" ? "active" : ""}`}>
                        {selectedSemester === "Sem 1" ? "Sem 1" : "Sem 2"}
                    </span>
                </button>
                <div className="bg-white rounded-lg shadow px-4 py-2">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-100 rounded-t-lg">
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                                    WEEK
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                                    START DATE
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                                    END DATE
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0">
                                    REFERENCE
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-0 last:rounded-tr-lg">
                                    ITEM REQUEST
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            { curWeekRows.map((week) => (
                                <tr key={week.id}>
                                    <td className="px-6 py-4 text-center border-0">
                                        {week.week}
                                    </td>
                                    <td className="px-6 py-4 text-center border-0">
                                        {selectedSemester === "Sem 1"
                                            ? week.sem1StartDate
                                            : week.sem2StartDate}
                                    </td>
                                    <td className="px-6 py-4 text-center border-0">
                                        {selectedSemester === "Sem 1"
                                            ? week.sem1EndDate
                                            : week.sem2EndDate}
                                    </td>
                                    <td className="px-6 py-4 text-center border-0">
                                        {week.reference ? week.reference : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-center border-0">
                                        <ul>
                                            {week.item && week.item.map((item, index) => (
                                                <li key={index}>
                                                    {item.category}: {item.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>                            
                            )) }
                        </tbody>
                    </table>

                    <div className="table-navigate flex justify-center items-center gap-4 mt-4">
                    <button 
                        onClick={() => handlePreviousPage('week')} 
                        disabled={curWeekPage === 1}
                        className="flex items-center justify-center px-4 py-2 text-black text-sm font-medium bg-indigo-600 rounded-lg transition-all hover:bg-indigo-700 active:scale-95">
                        <IoCaretBack className="ml-1"/>
                        Back
                    </button>
                    <p className="text-gray-800 text-sm font-semibold">{curWeekPage}</p>
                    {curWeekRows.length === rowsPerPage && (
                        <button 
                            onClick={() => handleNextPage('week')}
                            className="flex items-center justify-center px-4 py-2 text-black text-sm font-medium bg-indigo-600 rounded-lg transition-all hover:bg-indigo-700 active:scale-95">
                            <IoCaretForward className="ml-1"/>
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
      </div>
    </div>
    );
};

export default Suggestion;