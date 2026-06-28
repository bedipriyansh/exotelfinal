import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneOff, Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-500 p-6 rounded-full border border-rose-100 dark:border-rose-900/30 mb-6 animate-pulse">
                <PhoneOff className="w-12 h-12" />
            </div>
            
            <h1 className="text-8xl font-black text-slate-800 dark:text-white tracking-tighter">
                404
            </h1>
            
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-4">
                Connection Terminated
            </h2>
            
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
                The requested call record or dashboard URL does not exist or has been moved.
            </p>

            <button
                onClick={() => navigate('/')}
                className="mt-8 px-6 py-3 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-2 transition-colors shadow-md shadow-brand-500/10 hover:-translate-y-0.5 transform transition-transform"
            >
                <Home className="w-4 h-4" />
                Return to Dashboard
            </button>
        </div>
    );
};

export default NotFound;
