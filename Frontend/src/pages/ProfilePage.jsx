import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, CreditCard, Camera, Edit2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const [profileDetails, setProfileDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) {
                    throw new Error('You must be logged in to view your profile.');
                }
                const data = await authService.getProfile(user.token);
                setProfileDetails(data);
            } catch (err) {
                setError((err.response?.data?.message) || err.message || err.toString());
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading profile...</div>;
    if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Error: {error}</div>;

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="flex font-sans bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Header studentName={profileDetails?.name || 'Student'} />

                <main className="flex-1 overflow-y-auto">
                    {/* Decorative Banner */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    </div>

                    <div className="max-w-5xl mx-auto px-8 pb-12 -mt-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="md:flex">
                                {/* Left Side: Profile Card */}
                                <div className="md:w-1/3 bg-gray-50 p-8 text-center border-r border-gray-100">
                                    <div className="relative inline-block mb-6">
                                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto border-4 border-white">
                                            {getInitials(profileDetails?.name || '')}
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-blue-600 transition-colors border border-gray-100" title="Change Photo">
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{profileDetails?.name}</h2>
                                    <p className="text-gray-500 font-medium mb-6">Student</p>

                                    <div className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                                        Active Student
                                    </div>
                                </div>

                                {/* Right Side: Details Form */}
                                <div className="md:w-2/3 p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-bold text-gray-800">Profile Details</h3>
                                        <button
                                            onClick={() => toast('Profile editing is coming soon!', { icon: '🚧' })}
                                            className="px-4 py-2 flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" /> Edit Profile
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Full Name</label>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-blue-200 transition-colors">
                                                <div className="p-2 bg-white rounded-lg text-gray-400">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="font-semibold text-gray-800 text-lg">
                                                    {profileDetails?.name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-blue-200 transition-colors">
                                                <div className="p-2 bg-white rounded-lg text-gray-400">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div className="font-semibold text-gray-800 text-lg">
                                                    {profileDetails?.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Student PRN</label>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-blue-200 transition-colors">
                                                <div className="p-2 bg-white rounded-lg text-gray-400">
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <div className="font-semibold text-gray-800 text-lg font-mono">
                                                    {profileDetails?.prn || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;