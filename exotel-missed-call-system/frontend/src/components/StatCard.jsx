import React from 'react';

const StatCard = ({ title, value, icon, trend, trendType = 'neutral', color = 'brand' }) => {
    const colorStyles = {
        brand: 'text-brand-500 bg-brand-50 dark:bg-brand-950/20 border-brand-100 dark:border-brand-900/30',
        emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
        rose: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30',
        amber: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30',
    };

    const trendStyles = {
        up: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
        down: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
        neutral: 'text-slate-500 dark:text-slate-400 bg-slate-500/10',
    };

    return (
        <div className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex items-center justify-between border">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {title}
                </span>
                <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    {value}
                </span>
                {trend && (
                    <span className={`inline-flex items-center w-fit px-2 py-0.5 text-xs font-semibold rounded-full mt-2 ${trendStyles[trendType]}`}>
                        {trend}
                    </span>
                )}
            </div>
            {icon && (
                <div className={`p-4 rounded-xl border flex items-center justify-center ${colorStyles[color] || colorStyles.brand}`}>
                    {icon}
                </div>
            )}
        </div>
    );
};

export default StatCard;
