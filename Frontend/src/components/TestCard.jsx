import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react';

const TestCard = ({ test, isSubmitted }) => {
    const navigate = useNavigate();

    const getTestStatus = () => {
        const now = new Date();
        const datePart = new Date(test.date).toISOString().split('T')[0];
        const startTime = new Date(`${datePart}T${test.startTime}`);
        const endTime = new Date(`${datePart}T${test.endTime}`);

        if (now < startTime) return 'Upcoming';
        if (now >= startTime && now <= endTime) return 'Live';
        return 'Completed';
    };

    const status = getTestStatus();

    const handleButtonClick = () => {
        if (isSubmitted) {
            navigate(`/results/${test._id}`);
        } else if (status === 'Live') {
            navigate(`/test/${test._id}`);
        }
    };

    const getButtonDetails = () => {
        if (isSubmitted) {
            return {
                text: 'View Results',
                icon: CheckCircle,
                className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
                disabled: false
            };
        }
        switch (status) {
            case 'Live':
                return {
                    text: 'Start Test',
                    icon: PlayCircle,
                    className: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200',
                    disabled: false
                };
            case 'Upcoming':
                return {
                    text: 'Upcoming',
                    icon: Clock,
                    className: 'bg-yellow-100 text-yellow-700 cursor-not-allowed border-yellow-200',
                    disabled: true
                };
            case 'Completed':
                return {
                    text: 'Missed',
                    icon: AlertCircle,
                    className: 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200',
                    disabled: true
                };
            default:
                return {
                    text: 'Unknown',
                    icon: AlertCircle,
                    className: 'bg-gray-100 text-gray-500',
                    disabled: true
                };
        }
    };

    const btn = getButtonDetails();
    const testDate = new Date(test.date).toLocaleDateString('en-GB');
    const testStartTime = new Date(`1970-01-01T${test.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const testEndTime = new Date(`1970-01-01T${test.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300"
        >
            <div className={`h-1.5 w-full ${isSubmitted ? 'bg-purple-500' :
                    status === 'Live' ? 'bg-blue-500' :
                        status === 'Upcoming' ? 'bg-yellow-500' : 'bg-gray-300'
                }`} />

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isSubmitted ? 'bg-purple-50 text-purple-700' :
                            status === 'Live' ? 'bg-blue-50 text-blue-700 animate-pulse' :
                                status === 'Upcoming' ? 'bg-yellow-50 text-yellow-700' :
                                    'bg-gray-50 text-gray-600'
                        }`}>
                        {isSubmitted ? 'Completed' : status}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        {test.totalQuestions} Qs
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {test.name}
                </h3>

                <p className="text-sm text-gray-500 mb-6">
                    By {test.createdBy?.name || 'Admin'}
                </p>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{testDate}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{testStartTime} - {testEndTime}</span>
                    </div>
                </div>

                <button
                    onClick={handleButtonClick}
                    disabled={btn.disabled && !isSubmitted}
                    className={`mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${btn.className} border`}
                >
                    <btn.icon className="w-4 h-4" />
                    {btn.text}
                </button>
            </div>
        </motion.div>
    );
};

export default TestCard;
