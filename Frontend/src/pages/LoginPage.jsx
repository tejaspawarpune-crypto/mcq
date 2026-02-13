import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
// --- IMPORT YOUR LOGOS HERE ---
// When using Vite, files in the 'public' folder are served from the root.
import companyLogo from '/assets/incronix.png';
import collegeLogo from '/assets/INDIRA LOGO.png';

// --- ICONS (Updated LockIcon color) ---
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> </svg>);
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> </svg>);
const EyeOffIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> </svg>);


const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email address is required.';
        if (!password) newErrors.password = 'Password is required.';
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
                const user = await authService.login({ email, password });
                if (user.role === 'teacher') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'student') {
                    if (user.status === 'pending') {

                        toast.error('Your account is pending approval. Please wait for an administrator to review your request.');

                        setIsLoading(false);
                        return;
                    }
                    if (user.status === 'rejected') {
                        toast.error('Your account registration was rejected. Please contact an administrator.');
                        setIsLoading(false);
                        return;
                    }
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            } catch (error) {
                const message = (error.response?.data?.message) || error.message || error.toString();
                setApiError(message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="flex min-h-screen w-full font-sans">
            {/* --- DARK GRAY PART (LEFT SIDE) --- */}
            <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-gray-800 p-12 text-white">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-center"
                >
                    {/* Incronix Logo */}
                    {/* <img src={companyLogo} alt="Incronix Logo" className="h-32 mx-auto mb-8" />
                     */}
                    {/* MCQ Master Text */}
                    <h1 className="text-5xl font-bold">MCQ Master</h1>
                    <p className="mt-4 text-lg opacity-90">Your gateway to seamless online examinations.</p>
                </motion.div>
                <Footer />
            </div>

            {/* --- WHITE PART (RIGHT SIDE) --- */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8 sm:p-12">
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="w-full max-w-sm" >

                    {/* Indira Logo - Increased Size */}

                    <div className="flex justify-center items-center mb-8 mr-10">
                        <img src={companyLogo} alt="Incronix Logo" className="h-20 mx-auto" />
                        <img src={collegeLogo} alt="Indira College Logo" className="h-32" />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <LockIcon />
                        <h2 className="text-3xl font-bold text-gray-800">Admin & Student Login</h2>
                    </div>
                    <p className="mb-8 text-gray-600">Please enter your credentials to continue.</p>

                    {apiError && (<div className="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700"> {apiError} </div>)}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div> <label htmlFor="email" className="block text-sm font-medium text-gray-700"> Email Address </label> <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-700 focus:ring-gray-700'}`} /> {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>} </div>
                        <div> <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Password </label> <div className="relative mt-1"> <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className={`block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-700 focus:ring-gray-700'}`} /> <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3" > {showPassword ? <EyeOffIcon /> : <EyeIcon />} </button> </div> {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>} </div>
                        <div className="pt-2"> <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md border border-transparent bg-gray-800 py-3 px-4 text-sm font-medium text-white shadow-sm transition-colors duration-300 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed" > {isLoading ? 'Signing In...' : 'Sign In'} </button> </div>
                    </form>
                    <p className="mt-8 text-center text-sm text-gray-600"> Don't have an account?{' '} <Link to="/signup" className="font-medium text-gray-700 hover:text-gray-900"> Sign Up </Link> </p>
                </motion.div>

            </div>
        </div>
    );
};

export default LoginPage;