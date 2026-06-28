import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            border: 'border-emerald-200/50 dark:border-emerald-800/30',
            text: 'text-emerald-800 dark:text-emerald-300',
            icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        },
        error: {
            bg: 'bg-rose-50 dark:bg-rose-950/30',
            border: 'border-rose-200/50 dark:border-rose-800/30',
            text: 'text-rose-800 dark:text-rose-300',
            icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
        },
        info: {
            bg: 'bg-brand-50 dark:bg-brand-950/30',
            border: 'border-brand-200/50 dark:border-brand-800/30',
            text: 'text-brand-800 dark:text-brand-300',
            icon: <Info className="w-5 h-5 text-brand-500" />,
        },
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div className={`fixed top-4 right-4 flex items-center gap-3 px-4 py-3 rounded-xl border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} shadow-lg backdrop-blur-md animate-slide-in z-50 max-w-sm`}>
            {currentStyle.icon}
            <span className="text-sm font-medium pr-2">{message}</span>
            <button
                onClick={onClose}
                className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                aria-label="Close notification"
            >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
            </button>
        </div>
    );
};

export default Toast;
