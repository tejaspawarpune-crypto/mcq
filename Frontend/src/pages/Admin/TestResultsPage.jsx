import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, User, Search, Award, BarChart2, TrendingUp, Users } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import testService from '../../services/testService';

const TestResultsPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [results, setResults] = useState({ submitted: [], notSubmitted: [] });
    const [testDetails, setTestDetails] = useState({ name: '', totalMarks: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (loggedInUser) {
            setUser(loggedInUser);
        }

        const fetchResults = async () => {
            if (!loggedInUser || !loggedInUser.token) {
                setError('Authentication required.');
                setIsLoading(false);
                return;
            }
            try {
                const data = await testService.getTestResults(testId, loggedInUser.token);
                setResults({
                    submitted: data.submittedStudents || [],
                    notSubmitted: data.notSubmittedStudents || []
                });
                setTestDetails({
                    name: data.testName || 'Test Results',
                    totalMarks: data.totalMarks || 0
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch test results.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [testId]);

    // Calculate Summary Stats
    const totalStudents = results.submitted.length + results.notSubmitted.length;
    const submissionRate = totalStudents > 0 ? Math.round((results.submitted.length / totalStudents) * 100) : 0;
    const averageScore = results.submitted.length > 0
        ? (results.submitted.reduce((acc, curr) => acc + curr.score, 0) / results.submitted.length).toFixed(1)
        : 0;
    const highestScore = results.submitted.length > 0
        ? Math.max(...results.submitted.map(s => s.score))
        : 0;

    // Filter Logic
    const filteredSubmitted = results.submitted.filter(s =>
        s.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.prn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredNotSubmitted = results.notSubmitted.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.prn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) { return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading results...</div>; }
    if (error) { return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Error: {error}</div>; }

    return (
        <div className="bg-gray-50 font-sans flex min-h-screen">
            <AdminSidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <AdminHeader userName={user?.name || 'Admin'} />

                <main className="flex-1 mt-20 p-8 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* Header & Back Button */}
                        <div className="mb-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="group flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Test Details
                            </button>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">{testDetails.name}</h2>
                                    <p className="text-gray-500 mt-1">Detailed breakdown of student performance and submissions.</p>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center w-full md:w-auto">
                                    <Search className="w-5 h-5 text-gray-400 ml-2" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-3 pr-4 py-1 outline-none text-gray-700 w-full md:w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {[
                                { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Submission Rate', value: `${submissionRate}%`, icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'Average Score', value: averageScore, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { label: 'Highest Score', value: `${highestScore} / ${testDetails.totalMarks}`, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            ].map((stat, index) => (
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    key={index}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
                                >
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Submitted Students Column */}
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[700px]">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Submitted</h3>
                                    </div>
                                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">
                                        {results.submitted.length}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {filteredSubmitted.length > 0 ? (
                                        filteredSubmitted.map((sub, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={sub._id}
                                                className="group p-4 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                                                        {sub.studentId.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{sub.studentId.name}</p>
                                                        <p className="text-xs text-gray-500 font-mono">{sub.studentId.prn}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <span className="text-lg font-bold text-gray-900">{sub.score}</span>
                                                        <span className="text-sm text-gray-400">/ {testDetails.totalMarks}</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 rounded-full"
                                                            style={{ width: `${(sub.score / testDetails.totalMarks) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                                            <Search className="w-12 h-12 mb-3 opacity-20" />
                                            <p>No submitted students found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Not Submitted Students Column */}
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[700px]">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                            <XCircle className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Not Submitted</h3>
                                    </div>
                                    <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                                        {results.notSubmitted.length}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {filteredNotSubmitted.length > 0 ? (
                                        filteredNotSubmitted.map((student, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={student._id}
                                                className="group p-4 rounded-2xl bg-white border border-gray-100 hover:border-red-200 hover:shadow-md transition-all flex items-center gap-4"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{student.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{student.prn}</p>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                                            <Search className="w-12 h-12 mb-3 opacity-20" />
                                            <p>No students found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default TestResultsPage;
