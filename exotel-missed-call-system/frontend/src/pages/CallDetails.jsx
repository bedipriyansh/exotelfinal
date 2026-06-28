import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    Phone, 
    Smartphone, 
    Activity, 
    Check, 
    Edit2, 
    X,
    Trash2
} from 'lucide-react';

const CallDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [call, setCall] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    
    // Form Edit States
    const [callerNumber, setCallerNumber] = useState('');
    const [exotelNumber, setExotelNumber] = useState('');
    const [callStatus, setCallStatus] = useState('');
    const [direction, setDirection] = useState('');
    const [duration, setDuration] = useState('');

    const fetchCallDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await callService.getCallById(id);
            setCall(data);
            
            // Populate form
            setCallerNumber(data.callerNumber || '');
            setExotelNumber(data.exotelNumber || '');
            setCallStatus(data.callStatus || '');
            setDirection(data.direction || '');
            setDuration(data.duration || '0');
        } catch (error) {
            showToast(error.message || 'Failed to fetch call details', 'error');
            navigate('/calls');
        } finally {
            setLoading(false);
        }
    }, [id, showToast, navigate]);

    useEffect(() => {
        fetchCallDetails();
    }, [fetchCallDetails]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                ...call,
                callerNumber,
                exotelNumber,
                callStatus,
                direction,
                duration: parseInt(duration) || 0
            };
            
            const result = await callService.updateCall(id, updatedData);
            setCall(result);
            setEditing(false);
            showToast('Call details updated successfully', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to update call details', 'error');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this call record?')) return;
        try {
            await callService.deleteCall(id);
            showToast('Call record deleted successfully', 'success');
            navigate('/calls');
        } catch (error) {
            showToast(error.message || 'Failed to delete call record', 'error');
        }
    };

    if (loading) return <Loader fullPage />;
    if (!call) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Nav Back Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/calls')}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Call Logs
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm font-semibold rounded-xl border border-rose-200 dark:border-rose-900/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Record
                    </button>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-2 transition-colors shadow-md shadow-brand-500/10"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Details
                        </button>
                    )}
                </div>
            </div>

            {/* Main Details Panel */}
            <div className="glass-panel border rounded-2xl p-6 lg:p-8 flex flex-col gap-6">
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-900 pb-5">
                    <div className="bg-brand-50 dark:bg-brand-950/30 text-brand-500 p-4 rounded-2xl border border-brand-100/50 dark:border-brand-900/30">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            {call.callerNumber}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Call SID: {call.callSid}
                        </p>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ml-auto ${
                        call.callStatus === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                        {call.callStatus}
                    </span>
                </div>

                {editing ? (
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Caller Number */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Caller Number</label>
                            <input
                                type="text"
                                value={callerNumber}
                                onChange={(e) => setCallerNumber(e.target.value)}
                                className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                required
                            />
                        </div>

                        {/* Exotel Number */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exotel ExoPhone</label>
                            <input
                                type="text"
                                value={exotelNumber}
                                onChange={(e) => setExotelNumber(e.target.value)}
                                className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                            <select
                                value={callStatus}
                                onChange={(e) => setCallStatus(e.target.value)}
                                className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                            >
                                <option value="missed">Missed</option>
                                <option value="completed">Completed</option>
                                <option value="no-answer">No Answer</option>
                                <option value="busy">Busy</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Direction */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direction</label>
                            <select
                                value={direction}
                                onChange={(e) => setDirection(e.target.value)}
                                className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                            >
                                <option value="incoming">Incoming</option>
                                <option value="outgoing">Outgoing</option>
                            </select>
                        </div>

                        {/* Duration */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration (seconds)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                min="0"
                            />
                        </div>

                        {/* Form Buttons */}
                        <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-900">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 flex items-center gap-1.5 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 transition-colors shadow-md shadow-brand-500/10"
                            >
                                <Check className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Call Specs */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exotel ExoPhone Dialed</div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">{call.exotelNumber}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Activity className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direction</div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5 capitalize">{call.direction}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">{call.duration ? `${call.duration} seconds` : '0 seconds'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Call Timing */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call Start Time</div>
                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{formatDate(call.startTime)}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call End Time</div>
                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{formatDate(call.endTime)}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recorded In Database</div>
                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{formatDate(call.createdAt)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallDetails;
