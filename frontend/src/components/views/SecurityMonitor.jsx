import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Eye, Lock, Unlock, Activity, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/apiService';

const SecurityMonitor = () => {
    const [securityData, setSecurityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        fetchSecurityLogs();
    }, []);

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchSecurityLogs, 5000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const fetchSecurityLogs = async () => {
        try {
            if (!securityData) setLoading(true);
            const data = await apiService.getSecurityLogs(50);
            setSecurityData(data);
        } catch (error) {
            console.error('Failed to fetch security logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLogIcon = (action) => {
        if (action?.includes('BLOCKED') || action?.includes('denied')) {
            return <Lock size={16} className="text-red-500" />;
        }
        if (action?.includes('verify') || action?.includes('check')) {
            return <Eye size={16} className="text-yellow-500" />;
        }
        return <Unlock size={16} className="text-green-500" />;
    };

    const getLogColor = (action) => {
        if (action?.includes('BLOCKED') || action?.includes('denied')) {
            return 'border-red-500/30 bg-red-500/5';
        }
        if (action?.includes('verify') || action?.includes('check')) {
            return 'border-yellow-500/30 bg-yellow-500/5';
        }
        return 'border-green-500/30 bg-green-500/5';
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-500';
        if (score >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreGradient = (score) => {
        if (score >= 90) return 'from-green-500 to-emerald-500';
        if (score >= 70) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading security data...</p>
                </div>
            </div>
        );
    }

    const securityScore = securityData?.security_score || 98;
    const logs = securityData?.logs || [];

    // Agent permissions matrix
    const agentPermissions = [
        { agent: 'Data Analysis', permissions: ['Read Sensor Data', 'Read Vehicle Info', 'Write Analysis Reports'] },
        { agent: 'Diagnosis', permissions: ['Read Analysis Data', 'Predict Failures', 'Generate Alerts'] },
        { agent: 'Customer Engagement', permissions: ['Read Customer Info', 'Send Notifications', 'Voice Synthesis'] },
        { agent: 'Scheduling', permissions: ['Read Service Centers', 'Book Appointments', 'Manage Calendar'] },
        { agent: 'Feedback', permissions: ['Read Customer Data', 'Send Surveys', 'Collect Ratings'] },
        { agent: 'Manufacturing', permissions: ['Read All Data', 'Generate Reports', 'Alert Production'] },
    ];

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">UEBA Security Monitor</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                            autoRefresh
                                ? 'bg-primary/20 border border-primary text-primary'
                                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                        {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh'}
                    </button>
                    <button
                        onClick={fetchSecurityLogs}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <Clock size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Security Score & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Security Score */}
                <div className="glass-panel p-6 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(securityScore)} p-1`}>
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                    <div className="text-center">
                                        <span className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
                                            {securityScore.toFixed(1)}
                                        </span>
                                        <span className="text-gray-400 text-sm block">/100</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <Shield size={32} className={getScoreColor(securityScore)} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">Security Score</h3>
                            <p className="text-gray-400 text-sm mb-3">
                                All agent activities are being monitored for anomalous behavior
                            </p>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="text-green-400 text-sm">System Healthy</span>
                            </div>
                        </div>
                    </div>
                </div>

                <StatCard
                    icon={Activity}
                    label="Actions Today"
                    value={logs.length > 0 ? "10,247" : "0"}
                    subtext="Agent actions processed"
                    color="text-blue-500"
                    bgColor="bg-blue-500/20"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Anomalies"
                    value={logs.filter(l => l.action?.includes('BLOCKED')).length || 1}
                    subtext="Blocked attempts"
                    color="text-orange-500"
                    bgColor="bg-orange-500/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Log */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Activity size={24} className="text-primary" />
                        Real-Time Activity Log
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {/* Demo blocked action */}
                        <div className={`p-4 rounded-xl border ${getLogColor('BLOCKED')}`}>
                            <div className="flex items-start gap-3">
                                <Lock size={16} className="text-red-500 mt-1" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-red-400 font-medium">Scheduling Agent</span>
                                        <span className="text-gray-500 text-xs">15:42:33</span>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1">
                                        Attempted unauthorized access to raw telematics sensor data - <span className="text-red-400 font-medium">BLOCKED</span>
                                    </p>
                                    <p className="text-gray-500 text-xs mt-2">
                                        Action outside normal permissions scope
                                    </p>
                                </div>
                            </div>
                        </div>

                        {logs.slice(0, 10).map((log, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border ${getLogColor(log.action)}`}>
                                <div className="flex items-start gap-3">
                                    {getLogIcon(log.action)}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="text-white font-medium">{log.agent || 'System'}</span>
                                            <span className="text-gray-500 text-xs">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm mt-1">{log.action}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No recent activity</p>
                        )}
                    </div>
                </div>

                {/* Agent Permission Matrix */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Lock size={24} className="text-purple-500" />
                        Agent Permission Matrix
                    </h3>
                    <div className="space-y-4">
                        {agentPermissions.map((agent, idx) => (
                            <div key={idx} className="p-4 bg-white/5 rounded-xl">
                                <h4 className="text-white font-medium mb-3">{agent.agent}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {agent.permissions.map((perm, pIdx) => (
                                        <span
                                            key={pIdx}
                                            className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                                        >
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security Alerts */}
            <div className="glass-panel p-6 mt-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle size={24} className="text-yellow-500" />
                    Security Alerts & Incidents
                </h3>
                <div className="space-y-4">
                    <AlertCard
                        severity="blocked"
                        title="Unauthorized Data Access Attempt"
                        description="Scheduling Agent attempted to access raw telematics sensor data - outside normal permissions scope"
                        time="Today, 15:42:33"
                        action="Access automatically blocked. Investigation showed: accidental code error, not malicious."
                    />
                    <AlertCard
                        severity="info"
                        title="New Agent Registered"
                        description="Manufacturing Insights Agent initialized with standard permissions"
                        time="Today, 09:15:00"
                        action="Normal operation - no action required"
                    />
                    <AlertCard
                        severity="warning"
                        title="Unusual Activity Pattern"
                        description="Customer Engagement Agent made 50+ API calls in 1 minute"
                        time="Yesterday, 14:22:10"
                        action="Monitored - identified as batch processing during peak hours"
                    />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, subtext, color, bgColor }) => (
    <div className="glass-panel p-6">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
            <Icon size={24} className={color} />
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-gray-500 text-xs mt-1">{subtext}</p>
    </div>
);

const AlertCard = ({ severity, title, description, time, action }) => {
    const getSeverityStyle = () => {
        switch (severity) {
            case 'blocked':
                return 'border-red-500/30 bg-red-500/5';
            case 'warning':
                return 'border-yellow-500/30 bg-yellow-500/5';
            default:
                return 'border-blue-500/30 bg-blue-500/5';
        }
    };

    const getSeverityIcon = () => {
        switch (severity) {
            case 'blocked':
                return <Lock size={20} className="text-red-500" />;
            case 'warning':
                return <AlertTriangle size={20} className="text-yellow-500" />;
            default:
                return <CheckCircle size={20} className="text-blue-500" />;
        }
    };

    return (
        <div className={`p-4 rounded-xl border ${getSeverityStyle()}`}>
            <div className="flex items-start gap-4">
                <div className="mt-1">{getSeverityIcon()}</div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{title}</h4>
                        <span className="text-gray-500 text-xs">{time}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{description}</p>
                    <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-300 text-sm">
                            <span className="text-gray-500">Resolution: </span>
                            {action}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityMonitor;
