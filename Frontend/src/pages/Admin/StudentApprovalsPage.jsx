import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, User, Mail, Hash, ShieldAlert, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import teacherService from '../../services/teacherService';

const StudentApprovalCard = ({ student, onApprove, onReject }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
    >
        <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-sm">
                {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {student.email}
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
                    <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        PRN: <span className="font-mono text-gray-700 font-medium">{student.prn}</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onReject(student._id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-colors border border-transparent hover:border-red-200"
            >
                <UserX className="w-4 h-4" />
                Reject
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onApprove(student._id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 font-semibold shadow-lg shadow-green-200 transition-all hover:shadow-green-300"
            >
                <UserCheck className="w-4 h-4" />
                Approve
            </motion.button>
        </div>
    </motion.div>
);

const StudentApprovalsPage = () => {
    const [pendingStudents, setPendingStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user info from localStorage on component load
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (loggedInUser) {
            setUser(loggedInUser);
        }

        const fetchPendingStudents = async () => {
            if (!loggedInUser || !loggedInUser.token) {
                setError('You must be logged in as a teacher.');
                setIsLoading(false);
                return;
            }
            try {
                const allStudents = await teacherService.getStudents(loggedInUser.token);
                // console.log('Data received from backend:', allStudents);
                const filtered = allStudents.filter(student => student.status === 'pending');
                setPendingStudents(filtered);
            } catch (err) {
                setError((err.response?.data?.message) || err.message || err.toString());
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingStudents();
    }, []);

    const handleApprove = async (studentId) => {
        try {
            await teacherService.updateStudentStatus(studentId, 'approved', user.token);
            // If successful, remove the student from the list on the UI
            setPendingStudents(prevStudents => prevStudents.filter(student => student._id !== studentId));
            toast.success('Student approved successfully');
        } catch (err) {
            toast.error('Failed to approve student. Please try again.');
            console.error(err);
        }
    };

    const handleReject = async (studentId) => {
        try {
            await teacherService.updateStudentStatus(studentId, 'rejected', user.token);
            // If successful, remove the student from the list on the UI
            setPendingStudents(prevStudents => prevStudents.filter(student => student._id !== studentId));
            toast.success('Student rejected');
        } catch (err) {
            toast.error('Failed to reject student. Please try again.');
            console.error(err);
        }
    };

    if (isLoading) { return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading requests...</div>; }
    if (error) { return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Error: {error}</div>; }

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
                        className="max-w-5xl mx-auto"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Student Approvals</h2>
                                <p className="text-gray-500 mt-1">Review pending registration requests from students.</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200 shadow-sm">
                                <ShieldAlert className="w-5 h-5" />
                                <span className="font-bold">{pendingStudents.length}</span>
                                <span className="font-medium">Pending Requests</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode='popLayout'>
                                {pendingStudents.length > 0 ? (
                                    pendingStudents.map((student) => (
                                        <StudentApprovalCard key={student._id} student={student} onApprove={handleApprove} onReject={handleReject} />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 text-center"
                                    >
                                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                                            <Check className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">There are no pending student approval requests at the moment.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default StudentApprovalsPage;