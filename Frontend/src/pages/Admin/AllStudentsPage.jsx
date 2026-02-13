import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, User, Mail, Hash, AlertTriangle, X, CheckCircle, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import teacherService from '../../services/teacherService';

const AllStudentsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAllStudents = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) {
                    throw new Error('You must be logged in as a teacher.');
                }
                const data = await teacherService.getStudents(user.token);
                setStudents(data);
                setFilteredStudents(data);
            } catch (err) {
                setError((err.response?.data?.message) || err.message || err.toString());
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllStudents();
    }, []);

    // Handle Search
    useEffect(() => {
        let result = students;

        if (searchTerm) {
            result = result.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.prn && student.prn.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredStudents(result);
    }, [searchTerm, students]);

    const handleDeleteStudent = async () => {
        if (!deleteConfirm) return;

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                throw new Error('You must be logged in as a teacher.');
            }

            await teacherService.deleteStudent(deleteConfirm.id, user.token);

            // Remove the student from the local state
            setStudents(prev => prev.filter(student => student._id !== deleteConfirm.id));
            toast.success(`Student ${deleteConfirm.name} deleted successfully.`);

            // Close the confirmation dialog
            setDeleteConfirm(null);
        } catch (err) {
            const msg = (err.response?.data?.message) || err.message || err.toString();
            toast.error(msg);
        }
    };

    if (isLoading) { return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading student data...</div>; }
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
                        className="max-w-7xl mx-auto"
                    >
                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">All Students</h2>
                                <p className="text-gray-500 mt-1">Manage all registered students in the system.</p>
                            </div>
                        </div>

                        {/* Search Toolbar */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or PRN..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="ml-4 text-sm text-gray-500">
                                Showing <strong>{filteredStudents.length}</strong> students
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Profile</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PRN</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
                                                <tr key={student._id} className="hover:bg-blue-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                                {student.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" /> {student.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-mono">
                                                            {student.prn}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${student.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            <span className={`w-2 h-2 rounded-full ${student.status === 'approved' ? 'bg-green-500' :
                                                                    student.status === 'pending' ? 'bg-yellow-500' :
                                                                        'bg-red-500'
                                                                }`}></span>
                                                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => setDeleteConfirm({ id: student._id, name: student.name })}
                                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                                            title="Delete Student"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                            <User className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                        <p className="text-lg font-medium text-gray-600">No students found</p>
                                                        <p className="text-sm text-gray-400">Try adjusting your search query.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Delete Confirmation Modal */}
                        <AnimatePresence>
                            {deleteConfirm && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Student?</h3>
                                            <p className="text-gray-500 text-center mb-6">
                                                Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirm.name}</span>?
                                                This action cannot be undone and will remove all their data.
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleDeleteStudent}
                                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AllStudentsPage;