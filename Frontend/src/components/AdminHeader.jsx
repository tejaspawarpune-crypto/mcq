
import React from "react";

const AdminHeader = ({ userName }) => {
  return (
    <header className="fixed top-0 left-64 w-[calc(100%-16rem)] h-20 flex items-center justify-between border-b bg-white px-10 z-40">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-gray-700">
          Welcome {userName}
        </span>
        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
          {userName ? userName.charAt(0).toUpperCase() : "U"}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

