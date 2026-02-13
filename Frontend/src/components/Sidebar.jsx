import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// --- ICONS ---
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const TestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);
const ResultsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
    navigate('/'); // Redirect to login
  };

  const activeClass =
    "flex items-center gap-4 px-6 py-3 text-blue-600 bg-blue-50 border-r-4 border-blue-500 font-semibold";
  const inactiveClass =
    "flex items-center gap-4 px-6 py-3 text-gray-600 hover:bg-gray-100 transition-colors";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-xl border-r border-gray-200 z-50">
      <div className="flex flex-col h-full">
        {/* Brand Logo */}
        <div className="flex items-center justify-center h-20 bg-blue-600 text-white border-b border-blue-700">
          <h1 className="text-2xl font-bold tracking-wide">MCQ Master</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-grow pt-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <DashboardIcon /> <span>Dashboard</span>
          </NavLink>
         
          <NavLink
            to="/results"
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <ResultsIcon /> <span>Results</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <ProfileIcon /> <span>My Profile</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-red-500 py-3 text-white hover:bg-red-600 hover:shadow-lg transition"
          >
            <LogoutIcon /> <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
