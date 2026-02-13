import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TestCard from '../components/TestCard';
import testService from '../services/testService';
import submissionService from '../services/submissionService';
import Footer from '../components/Footer';

const StudentDashboard = () => {
    const [allTests, setAllTests] = useState([]);
    const [submittedTestIds, setSubmittedTestIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentName, setStudentName] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) {
                    throw new Error('You must be logged in to view this page.');
                }

                setStudentName(user.name);

                const [testsResponse, submissionsResponse] = await Promise.all([
                    testService.getTests(user.token),
                    submissionService.getMySubmissions(user.token)
                ]);

                const submittedIds = new Set(
                    submissionsResponse
                        .filter(sub => sub.testId)
                        .map(sub => sub.testId._id)
                );

                setAllTests(testsResponse);
                setSubmittedTestIds(submittedIds);

            } catch (err) {
                setError((err.response?.data?.message) || err.message || err.toString());
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Calculate Stats
    const totalTests = allTests.length;
    const completedTests = submittedTestIds.size;
    const pendingTests = totalTests - completedTests;

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="font-sans bg-gray-50 min-h-screen flex">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Header studentName={studentName} />
                <main className="flex-1 mt-20 p-8 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* Hero Section */}


                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Tests</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalTests}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Completed</p>
                                    <p className="text-2xl font-bold text-gray-800">{completedTests}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold text-gray-800">{pendingTests}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tests Section */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                                Available Tests
                            </h2>
                            {allTests.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {allTests.map(test => (
                                        <TestCard
                                            key={test._id}
                                            test={test}
                                            isSubmitted={submittedTestIds.has(test._id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No Tests Available</h3>
                                    <p className="text-gray-500">Check back later for new assessments.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-12">
                            <Footer />
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;
