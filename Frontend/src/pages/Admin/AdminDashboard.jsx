import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, FileText, Clock, ArrowRight, TrendingUp, Activity } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import teacherService from "../../services/teacherService"; // For getting students
import testService from "../../services/testService"; // For getting tests
import Footer from "../../components/Footer";

const StatCard = ({ title, value, icon: Icon, color, linkTo, trend }) => (
    <Link to={linkTo} className="block group">
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -mr-16 -mt-16 bg-${color}-500 transition-transform group-hover:scale-110`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" /> {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                <p className="text-4xl font-extrabold text-gray-800 tracking-tight">{value}</p>
            </div>

            <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
            </div>
        </motion.div>
    </Link>
);

const AdminDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [stats, setStats] = useState({
        pendingApprovals: 0,
        totalStudents: 0,
        totalTests: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) {
                    throw new Error("You must be logged in as a teacher.");
                }

                // Use Promise.all to fetch students and tests at the same time
                const [studentsData, testsData] = await Promise.all([
                    teacherService.getStudents(user.token),
                    testService.getTests(user.token)
                ]);

                // Calculate the stats from the fetched data
                const pendingCount = studentsData.filter(s => s.status === 'pending').length;
                const totalStudentCount = studentsData.length;
                const totalTestCount = testsData.length;

                setStats({
                    pendingApprovals: pendingCount,
                    totalStudents: totalStudentCount,
                    totalTests: totalTestCount,
                });

            } catch (err) {
                setError((err.response?.data?.message) || err.message || err.toString());
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-gray-50 font-sans flex min-h-screen">
            <AdminSidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <AdminHeader userName={user?.name || "Admin"} />
                <main className="flex-1 mt-20 p-8 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* Hero Section */}


                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            <StatCard
                                title="Pending Approvals"
                                value={stats.pendingApprovals}
                                icon={Clock}
                                color="yellow"
                                linkTo="/admin/StudentApprovalsPage"
                                trend={stats.pendingApprovals > 0 ? "Action Required" : "All Caught Up"}
                            />
                            <StatCard
                                title="Total Students"
                                value={stats.totalStudents}
                                icon={Users}
                                color="green"
                                linkTo="/admin/all-students"
                                trend="+12% this month"
                            />
                            <StatCard
                                title="Total Tests Created"
                                value={stats.totalTests}
                                icon={FileText}
                                color="blue"
                                linkTo="/admin/manage-tests"
                                trend="Active"
                            />
                        </div>

                        {/* Recent Activity Section (Placeholder for now) */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-500" />
                                    Recent Activity
                                </h3>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
                            </div>
                            <div className="p-12 text-center text-gray-400">
                                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Activity className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-lg font-medium text-gray-500">No recent activity to show</p>
                                <p className="text-sm">Activity feed will appear here once students start taking tests.</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mt-12">
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;