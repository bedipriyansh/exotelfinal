import React from 'react';

const Loader = ({ size = 'md', fullPage = false }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    const spinner = (
        <div className="relative flex items-center justify-center">
            <div className={`animate-spin rounded-full border-t-brand-500 border-r-transparent border-b-brand-500 border-l-transparent ${sizeClasses[size]}`}></div>
            <div className={`absolute rounded-full border-brand-200/20 ${sizeClasses[size]}`}></div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 transition-colors duration-300">
                <div className="flex flex-col items-center gap-3">
                    {spinner}
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider animate-pulse">
                        LOADING DATA...
                    </p>
                </div>
            </div>
        );
    }

    return spinner;
};

export default Loader;
