import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from '../services/authService'; // <-- Import our service


// --- ICONS ---
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0 a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> </svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1 a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0 A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-9-9" /> </svg>);
const TestIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7 a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3 m-6-4h.01M9 16h.01" /> </svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1 a3 3 0 01-3 3H6a3 3 0 01-3-3V7 a3 3 0 013-3h4a3 3 0 013 3v1" /> </svg>);
// --- THIS IS THE FIX ---
const AddUserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>);


const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        authService.logout(); // Call the logout function from our service
        navigate("/"); // Redirect to the login page
    };

    const isActive = (path) =>
        location.pathname === path
            ? "bg-gray-200 border-r-4 border-gray-800 text-gray-800 font-semibold"
            : "text-gray-600 hover:bg-gray-100";

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-xl z-50">
            <div className="flex flex-col h-full">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">Teacher Panel</h1>
                </div>
                <nav className="flex-grow pt-6">
                    <Link to="/admin/dashboard" className={`flex items-center gap-4 px-6 py-3 transition-colors ${isActive("/admin/dashboard")}`}> <DashboardIcon /> <span>Dashboard</span> </Link>
                    <Link to="/admin/StudentApprovalsPage" className={`flex items-center gap-4 px-6 py-3 transition-colors ${isActive("/admin/StudentApprovalsPage")}`}> <UsersIcon /> <span>Student Approvals</span> </Link>
                    <Link to="/admin/manage-tests" className={`flex items-center gap-4 px-6 py-3 transition-colors ${isActive("/admin/manage-tests")}`}> <TestIcon /> <span>Manage Tests</span> </Link>
                    <Link to="/admin/all-students" className={`flex items-center gap-4 px-6 py-3 transition-colors ${isActive("/admin/all-students")}`}> <UsersIcon /> <span>All Students</span> </Link>
                </nav>
                <div className="p-6 border-t border-gray-200">
                    <Link to="/admin/add-teacher" className={`flex w-full items-center justify-center gap-3 rounded-lg bg-blue-500 py-3 text-white hover:bg-blue-600 transition mb-4`}> <AddUserIcon /> <span>Add Teacher</span> </Link>

                    <button onClick={handleLogout} className="flex w-full items-center justify-center gap-3 rounded-lg bg-red-500 py-3 text-white hover:bg-red-600 transition"> <LogoutIcon /> <span>Logout</span> </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
