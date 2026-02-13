import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import testService from '../services/testService';
import submissionService from '../services/submissionService';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, AlertTriangle, ChevronRight, ChevronLeft, Menu, X } from 'lucide-react';

const MCQTestPage = () => {
    const navigate = useNavigate();
    const { testId } = useParams();

    // --- State Management ---
    const [testData, setTestData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [finalResult, setFinalResult] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

    // --- Security Features ---
    const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
    const [visibilityWarnings, setVisibilityWarnings] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(null);

    // --- Test Submission Logic ---
    const handleSubmitTest = useCallback(async () => {
        if (finalResult) return;

        setIsLoading(true);
        setShowSubmitModal(false);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption,
            }));
            const submissionData = { testId, answers: formattedAnswers };
            const user = JSON.parse(localStorage.getItem('user'));

            const resultData = await submissionService.submitTest(submissionData, user.token);
            setFinalResult(resultData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit the test.');
        } finally {
            setIsLoading(false);
        }
    }, [answers, testId, finalResult]);

    // --- Fullscreen and Security Logic ---
    const enterFullscreen = useCallback(() => {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.error(`Fullscreen request failed: ${err.message}`);
                toast.error("Please enable fullscreen mode to start the test.");
            });
        }
    }, []);

    useEffect(() => {
        if (finalResult) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setFullscreenWarnings(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                        toast.error("You have exited fullscreen mode 3 times. The test will now be submitted automatically.");
                        handleSubmitTest();
                    } else {
                        setShowWarningModal('fullscreen');
                    }
                    return newCount;
                });
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setVisibilityWarnings(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                        toast.error("You have switched tabs 3 times. The test will now be submitted automatically.");
                        handleSubmitTest();
                    } else {
                        setShowWarningModal('visibility');
                    }
                    return newCount;
                });
            }
        };

        const preventAction = (e) => {
            e.preventDefault();
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', preventAction);
        document.addEventListener('copy', preventAction);
        document.addEventListener('paste', preventAction);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', preventAction);
            document.removeEventListener('copy', preventAction);
            document.removeEventListener('paste', preventAction);
        };
    }, [finalResult, handleSubmitTest]);


    // --- Fetch Test Data & Initial Fullscreen Request ---
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) throw new Error("Authentication required.");

                const data = await testService.getTestById(testId, user.token);
                setTestData(data);
                enterFullscreen();

                const [endHour, endMinute] = data.endTime.split(':').map(Number);
                const testDate = new Date(data.date);
                const endTime = new Date(testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate(), endHour, endMinute);
                const now = new Date();
                const remainingSeconds = Math.floor((endTime - now) / 1000);
                setTimeLeft(remainingSeconds > 0 ? remainingSeconds : 0);

            } catch (err) {
                setError((err.response?.data?.message) || err.message || err.toString());
            } finally {
                setIsLoading(false);
            }
        };
        fetchTest();
    }, [testId, enterFullscreen]);

    // --- Countdown Timer Logic ---
    useEffect(() => {
        if (finalResult || !testData || timeLeft <= 0) {
            if (testData && !finalResult) {
                toast("Time is up! Your test has been submitted automatically.", { icon: '⏳' });
                handleSubmitTest();
            }
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, testData, finalResult, handleSubmitTest]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSelectOption = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium text-gray-500">Loading test environment...</div>;
    if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium text-red-500">Error: {error}</div>;

    // --- Results View ---
    if (finalResult) {
        const { score, totalQuestions } = finalResult;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
                        <div className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Test Completed!</h1>
                        <p className="opacity-90">Great job completing {testData.name}.</p>
                    </div>
                    <div className="p-8 text-center">
                        <div className="flex justify-center items-center mb-6">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" className="stroke-current text-gray-100" strokeWidth="10" fill="transparent" />
                                    <circle cx="80" cy="80" r="70" className="stroke-current text-blue-600" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * percentage) / 100} strokeLinecap="round" />
                                </svg>
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col">
                                    <span className="text-4xl font-bold text-gray-800">{percentage}%</span>
                                    <span className="text-sm text-gray-500">Score</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xl font-medium text-gray-800 mb-8">
                            You scored <span className="text-blue-600 font-bold">{score}</span> out of {totalQuestions}
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const progressPercentage = ((currentQuestionIndex + 1) / testData.questions.length) * 100;
    const currentQuestion = testData.questions[currentQuestionIndex];
    const isAnswered = (index) => answers[testData.questions[index]._id] !== undefined;

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-800 truncate max-w-[200px] lg:max-w-md">
                        {testData.name}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 mr-2">
                        <span>Question {currentQuestionIndex + 1} of {testData.questions.length}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Question Navigation Sidebar */}
                <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center lg:hidden">
                            <h2 className="font-bold text-gray-800">Question Navigator</h2>
                            <button onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-4 grid grid-cols-4 gap-2 overflow-y-auto">
                            {testData.questions.map((q, idx) => (
                                <button
                                    key={q._id}
                                    onClick={() => { setCurrentQuestionIndex(idx); setIsSidebarOpen(false); }}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${currentQuestionIndex === idx ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200' :
                                            answers[q._id] ? 'bg-green-100 text-green-700 border border-green-200' :
                                                'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-4 text-xs text-gray-500 justify-center">
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-full"></div> Current</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full"></div> Answered</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-full"></div> Pending</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 flex items-start justify-center">
                    <div className="w-full max-w-4xl">
                        <motion.div
                            key={currentQuestion._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            {/* Question Header */}
                            <div className="p-6 lg:p-10 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                        Question {currentQuestionIndex + 1}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        {answers[currentQuestion._id] ? 'Answered' : 'Not Answered'}
                                    </span>
                                </div>
                                <h2 className="text-xl lg:text-2xl font-medium text-gray-800 leading-relaxed">
                                    {currentQuestion.questionText}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="p-6 lg:p-10 bg-gray-50/50">
                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion.options.map((option, index) => (
                                        <motion.button
                                            key={index}
                                            onClick={() => handleSelectOption(currentQuestion._id, option)}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className={`p-4 lg:p-5 rounded-xl border text-left text-base lg:text-lg transition-all flex items-center gap-4 group ${answers[currentQuestion._id] === option
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${answers[currentQuestion._id] === option
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                                                }`}>
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className="font-medium">{option}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                                className="flex items-center gap-2 px-6 py-3 font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" /> Previous
                            </button>

                            {currentQuestionIndex === testData.questions.length - 1 ? (
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="flex items-center gap-2 px-8 py-3 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                >
                                    Finish Test <CheckCircle className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                >
                                    Next Question <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-100">
                            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-6 bg-green-100 text-green-600">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Submit?</h3>
                            <p className="text-gray-500 mb-8">
                                You have answered <span className="font-bold text-gray-800">{Object.keys(answers).length}</span> of <span className="font-bold text-gray-800">{testData.questions.length}</span> questions.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Review Answers</button>
                                <button onClick={handleSubmitTest} className="flex-1 py-3 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-colors">Submit Now</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Warning Modals */}
                {showWarningModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-red-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border-2 border-red-100">
                            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full mb-6 bg-red-50 text-red-500 animate-pulse">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Security Warning</h3>
                            <p className="text-gray-600 mb-6">
                                {showWarningModal === 'fullscreen'
                                    ? "Fullscreen mode is required for test integrity. Please do not exit fullscreen."
                                    : "Switching tabs or minimizing the window is not allowed."}
                            </p>
                            <div className="bg-red-50 rounded-xl p-4 mb-8">
                                <p className="text-red-800 font-semibold">
                                    {3 - (showWarningModal === 'fullscreen' ? fullscreenWarnings : visibilityWarnings)} warnings remaining
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowWarningModal(null);
                                    if (showWarningModal === 'fullscreen') enterFullscreen();
                                }}
                                className="w-full py-3.5 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                            >
                                I Understand, Return to Test
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MCQTestPage;
