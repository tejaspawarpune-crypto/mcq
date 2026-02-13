import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, FileText, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// Use assets safely
import companyLogo from '/assets/incronix.png';
import collegeLogo from '/assets/INDIRA LOGO.png';

const SignupPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        prn: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        // Clear specific error when user types
        if (errors[id]) {
            setErrors({ ...errors, [id]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};
        const { name, email, prn, password, confirmPassword } = formData;
        if (!name) newErrors.name = 'Full name is required.';
        if (!prn) newErrors.prn = 'PRN / Student ID is required.';
        if (!email) { newErrors.email = 'Email address is required.'; } else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Email address is invalid.'; }
        if (!password) { newErrors.password = 'Password is required.'; } else if (password.length < 8) { newErrors.password = 'Password must be at least 8 characters long.'; }
        if (!confirmPassword) { newErrors.confirmPassword = 'Please confirm your password.'; } else if (password !== confirmPassword) { newErrors.confirmPassword = 'Passwords do not match.'; }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsLoading(true);
            try {
                const { name, email, prn, password } = formData;
                await authService.register({ name, email, prn, password });

                toast.success('Registration successful! Please sign in.');
                navigate('/'); // Redirect to Login page (root path based on usage)

            } catch (error) {
                const message = (error.response?.data?.message) || error.message || error.toString();
                setApiError(message);
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="flex min-h-screen w-full font-sans bg-gray-50">
            {/* Left Side - Brand & Info */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

                <div className="relative z-10">
                    <img src={companyLogo} alt="Incronix Logo" className="h-16 mb-8" />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">MCQ Master</span> Community
                        </h1>
                        <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                            Create your account to start taking secure online examinations and tracking your progress naturally.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 text-gray-500 text-sm">
                    © {new Date().getFullYear()} Incronix. All rights reserved.
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white/50 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md my-8"
                >
                    <div className="text-center mb-8">
                        <img src={collegeLogo} alt="College Logo" className="h-20 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500">Register as a new student</p>
                    </div>

                    {apiError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2"
                        >
                            <span className="block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {apiError}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Name Input */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 outline-none ${errors.name ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name}</p>}
                        </div>

                        {/* PRN Input */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 ml-1">PRN / Student ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <input
                                    id="prn"
                                    type="text"
                                    value={formData.prn}
                                    onChange={handleInputChange}
                                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 outline-none ${errors.prn ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Enter your PRN"
                                />
                            </div>
                            {errors.prn && <p className="text-xs text-red-500 font-medium ml-1">{errors.prn}</p>}
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 outline-none ${errors.email ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="student@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email}</p>}
                        </div>

                        {/* Password Inputs Grid */}
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`block w-full pl-10 pr-10 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 outline-none ${errors.password ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Min 8 chars"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`block w-full pl-10 pr-3 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 outline-none ${errors.confirmPassword ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Retype password"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-xs text-red-500 font-medium ml-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-gray-200 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/" className="font-bold text-purple-600 hover:text-purple-700 hover:underline transition-all">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SignupPage;