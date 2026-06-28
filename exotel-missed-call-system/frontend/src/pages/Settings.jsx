import React, { useState } from 'react';
import { callService } from '../services/api';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import { 
    Settings as SettingsIcon, 
    Database, 
    PhoneCall, 
    RefreshCw, 
    Terminal, 
    Play, 
    Lock,
    Key
} from 'lucide-react';

const Settings = () => {
    const { showToast } = useToast();
    
    // Sync States
    const [syncing, setSyncing] = useState(false);
    
    // Webhook simulator states
    const [simulating, setSimulating] = useState(false);
    const [simCallSid, setSimCallSid] = useState(() => 'sim-sid-' + Math.random().toString(36).substr(2, 9));
    const [simFrom, setSimFrom] = useState('+919876543210');
    const [simTo, setSimTo] = useState('+918047101122');
    const [simStatus, setSimStatus] = useState('missed');
    const [simDirection, setSimDirection] = useState('incoming');
    const [simDuration, setSimDuration] = useState('0');

    const handleSync = async () => {
        setSyncing(true);
        try {
            const data = await callService.syncCalls();
            showToast(data.message || `Successfully synced historical logs! Saved ${data.callsSyncedCount} new calls.`, 'success');
        } catch (error) {
            showToast(error.message || 'Failed to sync historical logs from Exotel', 'error');
        } finally {
            setSyncing(false);
        }
    };

    const handleSimulateWebhook = async (e) => {
        e.preventDefault();
        setSimulating(true);
        try {
            // Setup parameters
            const params = new URLSearchParams();
            params.append('CallSid', simCallSid);
            params.append('From', simFrom);
            params.append('To', simTo);
            params.append('Status', simStatus);
            params.append('Direction', simDirection);
            params.append('Duration', simDuration);
            params.append('StartTime', new Date().toISOString().replace('T', ' ').substring(0, 19));

            // POST to webhook endpoint using x-www-form-urlencoded
            const response = await api.post('/exotel/webhook', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status === 200) {
                showToast('Webhook simulation succeeded! Call record logged.', 'success');
                // Generate a new random Sid for next test
                setSimCallSid('sim-sid-' + Math.random().toString(36).substr(2, 9));
            }
        } catch (error) {
            showToast(error.message || 'Webhook simulation failed', 'error');
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    System Settings
                </h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Manage integrations, trigger historical logs syncs, and simulate Exotel call events.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Integration Credentials Panel */}
                <div className="flex flex-col gap-6">
                    {/* Exotel settings card */}
                    <div className="glass-panel border rounded-2xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-3">
                            <SettingsIcon className="w-5 h-5 text-brand-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                Exotel API Configuration
                            </h3>
                        </div>

                        <p className="text-xs text-slate-400">
                            These variables are loaded securely from <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-rose-500">application.properties</code>. Do not expose credentials in repository code.
                        </p>

                        <div className="flex flex-col gap-4 text-xs">
                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-slate-400 uppercase tracking-wider">Account SID</label>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-slate-500 select-none">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>••••••••••••••••••••••••••••••••</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-slate-400 uppercase tracking-wider">API Key</label>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-slate-500 select-none">
                                    <Key className="w-3.5 h-3.5" />
                                    <span>••••••••••••••••••••••••••••••••</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-slate-400 uppercase tracking-wider">API Token</label>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-slate-500 select-none">
                                    <Key className="w-3.5 h-3.5" />
                                    <span>••••••••••••••••••••••••••••••••</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historical sync card */}
                    <div className="glass-panel border rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-3">
                            <Database className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                Historical Logs Sync
                            </h3>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Manually sync call logs from the Exotel REST API. The system queries Exotel's active call details registry, parses the records, and updates the local MySQL database, automatically ignoring duplicates.
                        </p>

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="mt-2 w-full py-3 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/10 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing call logs...' : 'Start Manual Log Sync'}
                        </button>
                    </div>
                </div>

                {/* Webhook simulator tool */}
                <div className="glass-panel border rounded-2xl p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-3">
                        <Terminal className="w-5 h-5 text-brand-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-base">
                            Webhook Event Simulator
                        </h3>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                        Simulate an Exotel webhook trigger event. This sends a mock HTTP POST request to the local webhook endpoint (`POST /api/exotel/webhook`) as `application/x-www-form-urlencoded`.
                    </p>

                    <form onSubmit={handleSimulateWebhook} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call SID (Unique)</label>
                            <input
                                type="text"
                                value={simCallSid}
                                onChange={(e) => setSimCallSid(e.target.value)}
                                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Caller Number</label>
                                <input
                                    type="text"
                                    value={simFrom}
                                    onChange={(e) => setSimFrom(e.target.value)}
                                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ExoPhone Number</label>
                                <input
                                    type="text"
                                    value={simTo}
                                    onChange={(e) => setSimTo(e.target.value)}
                                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call Status</label>
                                <select
                                    value={simStatus}
                                    onChange={(e) => setSimStatus(e.target.value)}
                                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                >
                                    <option value="missed">Missed</option>
                                    <option value="completed">Completed</option>
                                    <option value="no-answer">No Answer</option>
                                    <option value="busy">Busy</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direction</label>
                                <select
                                    value={simDirection}
                                    onChange={(e) => setSimDirection(e.target.value)}
                                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                >
                                    <option value="incoming">Incoming</option>
                                    <option value="outgoing">Outgoing</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration (seconds)</label>
                            <input
                                type="number"
                                value={simDuration}
                                onChange={(e) => setSimDuration(e.target.value)}
                                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                                min="0"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={simulating}
                            className="mt-3 w-full py-3 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center gap-2 transition-colors shadow-md shadow-brand-500/10 disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" />
                            {simulating ? 'Sending simulated event...' : 'Simulate Webhook POST'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
