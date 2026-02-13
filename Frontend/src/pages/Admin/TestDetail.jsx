import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, ListChecks, ArrowLeft, Trash, Edit, Users, Download } from 'lucide-react'; // Added Download icon
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import testService from '../../services/testService';

const TestDetail = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null); // State to hold user info
    const [isDownloading, setIsDownloading] = useState(false); // State for download button

    useEffect(() => {
        // Get user info from localStorage when the component mounts
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (loggedInUser) {
            setUser(loggedInUser);
        }

        const fetchTest = async () => {
            if (!loggedInUser || !loggedInUser.token) {
                setError('You must be logged in to view this page.');
                setIsLoading(false);
                return;
            }
            try {
                const data = await testService.getTestById(testId, loggedInUser.token);
                setTest(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch test details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    const handleDeleteTest = async () => {
        if (window.confirm('Are you sure you want to delete this test? This action is permanent.')) {
            try {
                if (!user || !user.token) throw new Error("Authentication error");
                await testService.deleteTestById(testId, user.token);
                toast.success('Test deleted successfully!');
                navigate('/admin/manage-tests'); // Navigate back to the list
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete the test.');
            }
        }
    };

    // --- NEW FUNCTION TO HANDLE THE DOWNLOAD ---
    const handleDownloadResults = async () => {
        setIsDownloading(true);
        try {
            if (!user || !user.token) throw new Error("Authentication error");

            // This calls the new function in your testService
            const blob = await testService.downloadResults(testId, user.token);

            // Create a temporary link to trigger the browser's download prompt
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${test.name}_results.xlsx`; // Set the filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Failed to download results. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-600 text-lg">Loading test details...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 font-medium">Error: {error}</div>;
    }

    if (!test) return null;

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
                        {/* Back Button */}
                        <div className="mb-6">
                            <button onClick={() => navigate(-1)} className="group flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium">
                                <div className="p-2 rounded-full bg-white group-hover:bg-blue-50 mr-3 shadow-sm transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </div>
                                Back to Tests
                            </button>
                        </div>

                        {/* Hero Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-10 -mb-10 blur-xl"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div>
                                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider mb-3">
                                        TEST DETAILS
                                    </div>
                                    <h2 className="text-4xl font-extrabold tracking-tight mb-2">{test.name}</h2>
                                    <div className="flex items-center gap-2 text-blue-100 items-center">
                                        <span className="opacity-80">Created by</span>
                                        <span className="font-semibold bg-white/10 px-2 py-0.5 rounded text-sm">{test.createdBy?.name || 'Admin'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px] border border-white/10">
                                        <div className="text-3xl font-bold">{test.questions.length}</div>
                                        <div className="text-xs text-blue-100 uppercase tracking-wide font-semibold">Questions</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px] border border-white/10">
                                        <div className="text-3xl font-bold">100</div>
                                        <div className="text-xs text-blue-100 uppercase tracking-wide font-semibold">Marks</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Metadata & Actions */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Metadata Card */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800">Test Configuration</h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                                <CalendarDays className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Scheduled Date</p>
                                                <p className="text-lg font-bold text-gray-800">{new Date(test.date).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Time Window</p>
                                                <p className="text-lg font-bold text-gray-800">{test.startTime} - {test.endTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                                                <ListChecks className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Question Set</p>
                                                <p className="text-lg font-bold text-gray-800">{test.questions.length} items</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Card */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-28">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800">Quick Actions</h3>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        <button onClick={() => navigate(`/admin/test-results/${testId}`)} className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-blue-50 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all group font-medium">
                                            <span className="flex items-center gap-3"><Users className="w-5 h-5 text-gray-400 group-hover:text-blue-500" /> Student Results</span>
                                            <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>

                                        <button
                                            onClick={handleDownloadResults}
                                            disabled={isDownloading}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-green-50 text-gray-700 rounded-xl hover:border-green-500 hover:text-green-600 transition-all group font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="flex items-center gap-3"><Download className="w-5 h-5 text-gray-400 group-hover:text-green-500" /> {isDownloading ? 'Downloading...' : 'Excel Report'}</span>
                                        </button>

                                        <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm">
                                                <Edit className="w-4 h-4" /> Edit
                                            </button>
                                            <button onClick={handleDeleteTest} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm">
                                                <Trash className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Questions List */}
                            <div className="lg:col-span-8">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-xl text-gray-800">Questions</h3>
                                    </div>
                                    <div className="p-8 space-y-8">
                                        {test.questions.map((q, idx) => (
                                            <div key={q._id || idx} className="group">
                                                <div className="flex gap-5">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">{q.questionText}</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {q.options.map((opt, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`relative px-4 py-3 rounded-lg border-2 transition-all ${opt === q.correctAnswer
                                                                            ? 'bg-green-50 border-green-500 text-green-900 shadow-sm'
                                                                            : 'bg-white border-gray-100 text-gray-600'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${opt === q.correctAnswer ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'
                                                                            }`}>
                                                                            {String.fromCharCode(65 + i)}
                                                                        </span>
                                                                        <span className="font-medium">{opt}</span>
                                                                        {opt === q.correctAnswer && (
                                                                            <svg className="w-5 h-5 ml-auto text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {idx !== test.questions.length - 1 && <div className="h-px bg-gray-100 w-full mt-8"></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default TestDetail;
