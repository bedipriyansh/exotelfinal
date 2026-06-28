import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
    LayoutDashboard, 
    PhoneCall, 
    Settings as SettingsIcon, 
    Sun, 
    Moon, 
    Menu, 
    X,
    PhoneMissed
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Calls Logs', path: '/calls', icon: <PhoneCall className="w-5 h-5" /> },
        { name: 'Configuration', path: '/settings', icon: <SettingsIcon className="w-5 h-5" /> },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300 gradient-bg">
            
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    {/* Header Logo */}
                    <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200/50 dark:border-slate-800/50">
                        <div className="bg-brand-500 text-white p-2 rounded-xl shadow-md shadow-brand-500/20">
                            <PhoneMissed className="w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-white">
                            EXO<span className="text-brand-500">CALL</span>
                        </span>
                        <button 
                            className="lg:hidden ml-auto p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="p-4 flex flex-col gap-1.5">
                        {navigation.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                        active 
                                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center font-extrabold text-sm text-brand-600 dark:text-brand-400">
                            EX
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Exotel System</span>
                            <span className="text-[10px] text-slate-400">Enterprise Admin</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* Navbar */}
                <header className="h-16 min-h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 z-30 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                            {navigation.find(item => isActive(item.path))?.name || 'Details'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors shadow-sm"
                            aria-label="Toggle theme mode"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </header>

                {/* Page Content Body */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
