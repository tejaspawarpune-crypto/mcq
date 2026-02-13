import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Clock, ChevronRight, FileText } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import testService from '../../services/testService';

// Helper function to determine test status
const getTestStatus = (test) => {
    const now = new Date();
    const [startHour, startMinute] = test.startTime.split(':').map(Number);
    const [endHour, endMinute] = test.endTime.split(':').map(Number);
    const testDate = new Date(test.date);
    const startTime = new Date(testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate(), startHour, startMinute);
    const endTime = new Date(testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate(), endHour, endMinute);

    if (now < startTime) {
        return 'Upcoming';
    } else if (now >= startTime && now <= endTime) {
        return 'Live';
    } else {
        return 'Completed';
    }
};

const ManageTestsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) {
                    throw new Error('You must be logged in to view tests.');
                }
                const data = await testService.getTests(user.token);
                setTests(data);
                setFilteredTests(data);
            } catch (err) {
                setError((err.response?.data?.message) || err.message || err.toString());
            } finally {
                setIsLoading(false);
            }
        };
        fetchTests();
    }, []);

    // Handle Search & Filter
    useEffect(() => {
        let result = tests;

        if (searchTerm) {
            result = result.filter(test =>
                test.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'All') {
            result = result.filter(test => getTestStatus(test) === statusFilter);
        }

        setFilteredTests(result);
    }, [searchTerm, statusFilter, tests]);

    const handleCreateTest = () => {
        navigate('/admin/create-test');
    };

    if (isLoading) { return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading tests...</div>; }
    if (error) { return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Error: {error}</div>; }

    return (
        <div className="flex font-sans bg-gray-50 min-h-screen">
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
                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Manage Tests</h2>
                                <p className="text-gray-500 mt-1">Create, edit, and manage your examination schedules.</p>
                            </div>
                            <button
                                onClick={handleCreateTest}
                                className="group flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all transform hover:-translate-y-1"
                            >
                                <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </div>
                                Create New Test
                            </button>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search tests by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="relative min-w-[200px] w-full md:w-auto">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all cursor-pointer"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Live">Live</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Tests List */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Test Details</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Questions</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredTests.length > 0 ? (
                                            filteredTests.map((test) => {
                                                const status = getTestStatus(test);
                                                return (
                                                    <tr key={test._id} className="hover:bg-blue-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                                                                    <FileText className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{test.name}</p>
                                                                    <p className="text-xs text-gray-500">ID: {test._id.slice(-6).toUpperCase()}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                                    {new Date(test.date).toLocaleDateString('en-GB')}
                                                                </div>
                                                                <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {test.startTime} - {test.endTime}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium text-sm">
                                                                {test.questions.length}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    status === 'Live' ? 'bg-green-50 text-green-700 border-green-200 animate-pulse' :
                                                                        'bg-gray-100 text-gray-600 border-gray-200'
                                                                }`}>
                                                                <span className={`w-2 h-2 rounded-full ${status === 'Upcoming' ? 'bg-blue-500' :
                                                                        status === 'Live' ? 'bg-green-500' :
                                                                            'bg-gray-500'
                                                                    }`}></span>
                                                                {status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Link
                                                                to={`/admin/tests/${test._id}`}
                                                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                                                                title="View Details"
                                                            >
                                                                <ChevronRight className="w-5 h-5" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                            <FileText className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                        <p className="text-lg font-medium text-gray-600">No tests found</p>
                                                        <p className="text-sm text-gray-400">Try adjusting your search or filters, or create a new test.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default ManageTestsPage;