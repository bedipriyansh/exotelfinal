import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import { 
    Search, 
    Filter, 
    Download, 
    Trash2, 
    Eye, 
    ChevronLeft, 
    ChevronRight,
    X,
    Calendar
} from 'lucide-react';

const Calls = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    // API Query States
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [directionFilter, setDirectionFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Sorting States
    const [sortBy, setSortBy] = useState('startTime');
    const [sortDir, setSortDir] = useState('desc');

    const fetchCalls = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: pageSize,
                sortBy,
                sortDir,
            };

            if (statusFilter) params.status = statusFilter;
            if (directionFilter) params.direction = directionFilter;
            if (startDate) params.startTime = startDate + (startDate.includes('T') ? '' : ' 00:00:00');
            if (endDate) params.endTime = endDate + (endDate.includes('T') ? '' : ' 23:59:59');

            let result;
            if (searchQuery.trim()) {
                result = await callService.searchCalls(searchQuery.trim(), params);
            } else {
                result = await callService.getCalls(params);
            }

            setCalls(result.content || []);
            setTotalPages(result.totalPages || 0);
            setTotalElements(result.totalElements || 0);
        } catch (error) {
            showToast(error.message || 'Failed to fetch call logs', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, sortBy, sortDir, searchQuery, statusFilter, directionFilter, startDate, endDate, showToast]);

    useEffect(() => {
        fetchCalls();
    }, [fetchCalls]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this call record?')) return;
        try {
            await callService.deleteCall(id);
            showToast('Call record deleted successfully', 'success');
            // Refresh current page
            fetchCalls();
        } catch (error) {
            showToast(error.message || 'Failed to delete call record', 'error');
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setDirectionFilter('');
        setStartDate('');
        setEndDate('');
        setPage(0);
    };

    const exportToCSV = () => {
        if (calls.length === 0) {
            showToast('No call logs to export', 'info');
            return;
        }

        const headers = ['ID', 'Call SID', 'Caller Number', 'Exotel Number', 'Status', 'Direction', 'Start Time', 'End Time', 'Duration (sec)'];
        const csvRows = [headers.join(',')];

        calls.forEach(call => {
            const row = [
                call.id,
                `"${call.callSid}"`,
                `"${call.callerNumber}"`,
                `"${call.exotelNumber}"`,
                `"${call.callStatus}"`,
                `"${call.direction}"`,
                `"${call.startTime || ''}"`,
                `"${call.endTime || ''}"`,
                call.duration || 0
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `exotel_missed_calls_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV downloaded successfully', 'success');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
        setPage(0);
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Call Logs
                </h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Search, filter, analyze, and manage all Exotel call records.
                </p>
            </div>

            {/* Filter and Search Action Box */}
            <div className="glass-panel border rounded-2xl p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="relative md:col-span-2 lg:col-span-2">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by SID, Caller, Exotel Number..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition-colors"
                        >
                            <option value="">All Statuses</option>
                            <option value="missed">Missed</option>
                            <option value="completed">Completed</option>
                            <option value="no-answer">No Answer</option>
                            <option value="busy">Busy</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    {/* Direction filter */}
                    <div className="relative">
                        <select
                            value={directionFilter}
                            onChange={(e) => { setDirectionFilter(e.target.value); setPage(0); }}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition-colors"
                        >
                            <option value="">All Directions</option>
                            <option value="incoming">Incoming</option>
                            <option value="outgoing">Outgoing</option>
                        </select>
                    </div>

                    {/* CSV export */}
                    <div className="flex md:col-span-4 lg:col-span-1 justify-end md:justify-start lg:justify-end">
                        <button
                            onClick={exportToCSV}
                            className="w-full px-4 py-2 text-sm font-semibold rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-950/30 text-brand-600 dark:text-brand-400 flex items-center justify-center gap-2 border border-brand-100 dark:border-brand-900/20 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Date range filters */}
                <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-100 dark:border-slate-900">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase">
                        <Calendar className="w-3.5 h-3.5" />
                        Date range:
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-brand-500"
                        />
                        <span className="text-slate-400 text-xs">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-brand-500"
                        />
                    </div>

                    {(statusFilter || directionFilter || startDate || endDate || searchQuery) && (
                        <button
                            onClick={handleClearFilters}
                            className="text-xs font-semibold text-slate-400 hover:text-rose-500 flex items-center gap-1 ml-auto"
                        >
                            <X className="w-3.5 h-3.5" />
                            Reset Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Call Logs Table Card */}
            <div className="glass-panel border rounded-2xl p-6 flex flex-col gap-6">
                {loading ? (
                    <div className="py-20 flex justify-center"><Loader /></div>
                ) : calls.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-sm">
                        No call records match your criteria.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-500 font-semibold select-none">
                                        <th 
                                            className="py-3 px-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                                            onClick={() => handleSort('callerNumber')}
                                        >
                                            Caller Number {sortBy === 'callerNumber' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th 
                                            className="py-3 px-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                                            onClick={() => handleSort('exotelNumber')}
                                        >
                                            Exotel ExoPhone {sortBy === 'exotelNumber' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th 
                                            className="py-3 px-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                                            onClick={() => handleSort('callStatus')}
                                        >
                                            Status {sortBy === 'callStatus' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="py-3 px-4">Direction</th>
                                        <th 
                                            className="py-3 px-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                                            onClick={() => handleSort('startTime')}
                                        >
                                            Date / Time {sortBy === 'startTime' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th 
                                            className="py-3 px-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                                            onClick={() => handleSort('duration')}
                                        >
                                            Duration {sortBy === 'duration' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                                    {calls.map((call) => (
                                        <tr 
                                            key={call.id} 
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                                        >
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                                {call.callerNumber}
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                                                {call.exotelNumber}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                    call.callStatus === 'completed' 
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                }`}>
                                                    {call.callStatus}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 capitalize">
                                                {call.direction}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">
                                                <div className="text-slate-600 dark:text-slate-300 text-xs font-semibold">{formatDate(call.startTime)}</div>
                                                <div className="text-[10px] opacity-60 mt-0.5">{formatTime(call.startTime)}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                                                {call.duration ? `${call.duration}s` : '0s'}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => navigate(`/calls/${call.id}`)}
                                                        className="p-1.5 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-slate-400 hover:text-brand-500 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(call.id)}
                                                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-900 text-xs text-slate-500 dark:text-slate-400 font-semibold select-none">
                            <div>
                                Showing <span className="text-slate-800 dark:text-slate-200">{(page * pageSize) + 1}</span> to{' '}
                                <span className="text-slate-800 dark:text-slate-200">
                                    {Math.min((page + 1) * pageSize, totalElements)}
                                </span>{' '}
                                of <span className="text-slate-800 dark:text-slate-200">{totalElements}</span> records
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span>Logs per page:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
                                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3">
                                        Page {page + 1} of {totalPages || 1}
                                    </span>
                                    <button
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calls;
