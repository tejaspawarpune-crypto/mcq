import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, BarChart2, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import submissionService from '../services/submissionService';
import Footer from '../components/Footer';

const ResultsPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentName, setStudentName] = useState('');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) {
                    throw new Error("You must be logged in to view results.");
                }
                setStudentName(user.name);
                const data = await submissionService.getMySubmissions(user.token);
                setSubmissions(data);
            } catch (err) {
                setError((err.response?.data?.message) || err.message || err.toString());
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading results...</div>;
    if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Error: {error}</div>;

    const filteredSubmissions = submissions.filter(sub => sub.testId);

    // Calculate Summary Stats
    const totalTests = filteredSubmissions.length;
    const averageScore = totalTests > 0
        ? Math.round(filteredSubmissions.reduce((acc, sub) => {
            const total = sub.testId.totalMarks || 100;
            return acc + (sub.score / total) * 100;
        }, 0) / totalTests)
        : 0;

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
                        className="max-w-5xl mx-auto"
                    >
                        {/* Header Section */}
                        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">My Results</h2>
                                <p className="text-gray-500 mt-2">Track your performance and progress over time.</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-4">
                                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Tests Taken</p>
                                        <p className="text-lg font-bold text-gray-800">{totalTests}</p>
                                    </div>
                                </div>
                                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <BarChart2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Avg. Score</p>
                                        <p className="text-lg font-bold text-gray-800">{averageScore}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Results List */}
                        <div className="space-y-4">
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map((sub, index) => {
                                    const totalQuestions = sub.testId.totalMarks || 100; // Fallback to 100 if undefined
                                    const percentage = Math.round((sub.score / totalQuestions) * 100);

                                    let statusColor = 'text-green-600 bg-green-50 border-green-100';
                                    let ProgressBarColor = 'bg-green-500';
                                    let StatusIcon = CheckCircle;

                                    if (percentage < 50) {
                                        statusColor = 'text-red-600 bg-red-50 border-red-100';
                                        ProgressBarColor = 'bg-red-500';
                                        StatusIcon = XCircle;
                                    } else if (percentage < 75) {
                                        statusColor = 'text-orange-600 bg-orange-50 border-orange-100';
                                        ProgressBarColor = 'bg-orange-500';
                                        StatusIcon = BarChart2;
                                    }

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            key={sub._id}
                                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-6"
                                        >
                                            {/* Icon & Date */}
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className={`p-3 rounded-xl border ${statusColor}`}>
                                                    <StatusIcon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 md:hidden">
                                                    <h3 className="font-bold text-gray-900">{sub.testId.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(sub.submittedAt).toLocaleDateString('en-GB')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Test Info (Hidden on Mobile, visible on MD) */}
                                            <div className="hidden md:block flex-1">
                                                <h3 className="font-bold text-lg text-gray-900 mb-1">{sub.testId.name}</h3>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1.5" />
                                                    {new Date(sub.submittedAt).toLocaleDateString('en-GB')}
                                                </div>
                                            </div>

                                            {/* Score Bar */}
                                            <div className="w-full md:w-64">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-sm font-semibold text-gray-600">Score</span>
                                                    <div className="text-right">
                                                        <span className="text-xl font-bold text-gray-900">{sub.score}</span>
                                                        <span className="text-sm text-gray-400"> / {totalQuestions}</span>
                                                    </div>
                                                </div>
                                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className={`h-full rounded-full ${ProgressBarColor}`}
                                                    />
                                                </div>
                                                <p className="text-right text-xs font-bold mt-1 text-gray-500">{percentage}%</p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BarChart2 className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No Results Yet</h3>
                                    <p className="text-gray-500">Complete a test to see your performance analytics here.</p>
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

export default ResultsPage;
