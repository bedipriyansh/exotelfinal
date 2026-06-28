import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callService } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { LineChart, BarChart } from '../components/Charts';
import { 
    Phone, 
    PhoneMissed, 
    Calendar, 
    Activity, 
    RefreshCw, 
    Clock, 
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentCalls, setRecentCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const { showToast } = useToast();
    const navigate = useNavigate();

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        
        try {
            // Get stats
            const statsData = await callService.getStatistics();
            setStats(statsData);

            // Get recent calls (page 0, size 5, sort desc)
            const recentPage = await callService.getCalls({
                page: 0,
                size: 5,
                sortBy: 'startTime',
                sortDir: 'desc'
            });
            setRecentCalls(recentPage.content || []);
            
            if (silent) {
                showToast('Dashboard refreshed successfully', 'success');
            }
        } catch (error) {
            showToast(error.message || 'Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const triggerSync = async () => {
        setRefreshing(true);
        try {
            const result = await callService.syncCalls();
            showToast(result.message || 'Call logs synced successfully', 'success');
            await fetchDashboardData(true);
        } catch (error) {
            showToast(error.message || 'Failed to sync historical call logs', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) return <Loader fullPage />;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Top Info Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        Overview
                    </h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Exotel missed call logs aggregation and real-time dashboard analytics.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={triggerSync}
                        disabled={refreshing}
                        className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-2 transition-colors shadow-md shadow-brand-500/10 disabled:opacity-50"
                    >
                        <Activity className="w-4 h-4" />
                        Sync Exotel
                    </button>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Calls Logs" 
                    value={stats?.totalCalls || 0}
                    icon={<Phone className="w-5 h-5" />}
                    color="brand"
                    trend="All-time logged"
                />
                <StatCard 
                    title="Today's Active Calls" 
                    value={stats?.todayCalls || 0}
                    icon={<Clock className="w-5 h-5" />}
                    color="amber"
                    trend={`${stats?.todayCalls || 0} events today`}
                    trendType={stats?.todayCalls > 0 ? 'up' : 'neutral'}
                />
                <StatCard 
                    title="Last 7 Days Calls" 
                    value={stats?.weeklyCalls || 0}
                    icon={<Calendar className="w-5 h-5" />}
                    color="emerald"
                    trend="Past week activity"
                />
                <StatCard 
                    title="Missed Calls Count" 
                    value={stats?.missedCallsCount || 0}
                    icon={<PhoneMissed className="w-5 h-5" />}
                    color="rose"
                    trend={`${stats?.totalCalls ? Math.round((stats.missedCallsCount / stats.totalCalls) * 100) : 0}% missed rate`}
                    trendType="down"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Trend Line Chart */}
                <div className="glass-panel border rounded-2xl p-6 lg:col-span-2 flex flex-col gap-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">
                        Weekly Call Activity Trend
                    </h3>
                    <div className="w-full pt-4">
                        <LineChart data={stats?.dailyCounts || {}} />
                    </div>
                </div>

                {/* Status Breakdown Bar Chart */}
                <div className="glass-panel border rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">
                        Call Status Distribution
                    </h3>
                    <div className="w-full pt-4">
                        <BarChart data={stats?.statusCounts || {}} />
                    </div>
                </div>
            </div>

            {/* Recent Calls Section */}
            <div className="glass-panel border rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">
                        Recent Missed Calls
                    </h3>
                    <button 
                        onClick={() => navigate('/calls')}
                        className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1 group"
                    >
                        View all logs
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {recentCalls.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                        No recent calls found. Sync Exotel API to fetch logs.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-500 font-semibold">
                                    <th className="py-3 px-4">Caller Number</th>
                                    <th className="py-3 px-4">Exotel ExoPhone</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Direction</th>
                                    <th className="py-3 px-4">Time</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                                {recentCalls.map((call) => (
                                    <tr 
                                        key={call.id} 
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 group transition-colors"
                                    >
                                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                                            {call.callerNumber}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                                            {call.exotelNumber}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                call.callStatus === 'completed' 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                            }`}>
                                                {call.callStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 capitalize">
                                            {call.direction}
                                        </td>
                                        <td className="py-3 px-4 text-slate-400 dark:text-slate-500 text-xs">
                                            {formatDate(call.startTime)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button 
                                                onClick={() => navigate(`/calls/${call.id}`)}
                                                className="p-1 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-slate-400 hover:text-brand-500 rounded-lg transition-colors"
                                                aria-label="View call details"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
