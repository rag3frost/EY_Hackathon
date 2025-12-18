import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, Car, TrendingUp, BarChart3, Send } from 'lucide-react';
import { apiService } from '../../services/apiService';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const ManufacturingInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPattern, setSelectedPattern] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiService.getManufacturingInsights();
            setData(response);
            // Auto-select first pattern if available
            if (response?.patterns?.length > 0) {
                setSelectedPattern(response.patterns[0]);
            }
        } catch (error) {
            console.error('Failed to fetch RCA/CAPA data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading RCA/CAPA data...</p>
                </div>
            </div>
        );
    }

    const stats = data?.stats || { active_defects: 0, in_progress: 0, resolved: 0, affected_vehicles: 0 };
    const defectTrends = data?.defect_trends || { months: [], series: {} };
    const failureDistribution = data?.failure_distribution || { months: [], components: {} };
    const patterns = data?.patterns || [];

    // Prepare chart data for defect trends
    const trendChartData = defectTrends.months.map((month, idx) => {
        const point = { month };
        Object.keys(defectTrends.series).forEach(key => {
            point[key] = defectTrends.series[key][idx] || 0;
        });
        return point;
    });

    // Prepare chart data for failure distribution
    const distributionChartData = failureDistribution.months.map((month, idx) => {
        const point = { month };
        Object.keys(failureDistribution.components).forEach(key => {
            point[key] = failureDistribution.components[key][idx] || 0;
        });
        return point;
    });

    // Color mapping for components
    const componentColors = {
        Brake: '#ef4444',
        Oil: '#f59e0b',
        Battery: '#06b6d4',
        Other: '#a855f7'
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={AlertTriangle}
                    value={stats.active_defects}
                    label="Active Defects"
                    iconBg="bg-red-500/20"
                    iconColor="text-red-500"
                />
                <StatCard
                    icon={Clock}
                    value={stats.in_progress}
                    label="In Progress"
                    iconBg="bg-yellow-500/20"
                    iconColor="text-yellow-500"
                />
                <StatCard
                    icon={CheckCircle}
                    value={stats.resolved}
                    label="Resolved"
                    iconBg="bg-green-500/20"
                    iconColor="text-green-500"
                />
                <StatCard
                    icon={Car}
                    value={stats.affected_vehicles}
                    label="Affected Vehicles"
                    iconBg="bg-cyan-500/20"
                    iconColor="text-cyan-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Defect Trends Over Time */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Defect Trends Over Time
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="#9ca3af" 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <YAxis 
                                    stroke="#9ca3af" 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                {Object.keys(defectTrends.series).map((key) => (
                                    <Line
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={componentColors[key] || '#8884d8'}
                                        strokeWidth={2}
                                        dot={{ fill: componentColors[key] || '#8884d8', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Failure Distribution by Component */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary" />
                        Failure Distribution by Component
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="#9ca3af" 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <YAxis 
                                    stroke="#9ca3af" 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                {Object.keys(failureDistribution.components).map((key) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        fill={componentColors[key] || '#8884d8'}
                                        radius={[4, 4, 0, 0]}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pattern Alert Cards */}
            <div className="space-y-4">
                {patterns.map((pattern) => (
                    <PatternAlertCard
                        key={pattern.id}
                        pattern={pattern}
                        isSelected={selectedPattern?.id === pattern.id}
                        onSelect={() => setSelectedPattern(pattern)}
                    />
                ))}
            </div>

            {/* RCA/CAPA Details Panel */}
            {selectedPattern && (
                <RCADetailPanel pattern={selectedPattern} onClose={() => setSelectedPattern(null)} />
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, iconBg, iconColor }) => (
    <div className="glass-panel p-6 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={28} className={iconColor} />
        </div>
        <div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
        </div>
    </div>
);

// Pattern Alert Card Component
const PatternAlertCard = ({ pattern, isSelected, onSelect }) => {
    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'critical':
                return 'border-red-500/50 bg-red-500/5';
            case 'high':
                return 'border-orange-500/50 bg-orange-500/5';
            default:
                return 'border-yellow-500/50 bg-yellow-500/5';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Investigation Active</span>;
            case 'in_progress':
                return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">In Progress</span>;
            default:
                return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">Closed</span>;
        }
    };

    return (
        <div 
            className={`glass-panel p-6 border-l-4 cursor-pointer transition-all hover:bg-white/5 ${getSeverityStyles(pattern.severity)} ${isSelected ? 'ring-2 ring-primary' : ''}`}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mt-1">
                        <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-red-400">
                            Pattern Detected: {pattern.title}
                        </h4>
                        <p className="text-gray-400 mt-1 max-w-3xl">
                            {pattern.description}
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-medium">
                                {pattern.affected_count} Vehicles Affected
                            </span>
                            <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-medium">
                                Batch: {pattern.batch}
                            </span>
                            {getStatusBadge(pattern.investigation_status)}
                        </div>
                    </div>
                </div>
                <button 
                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        alert('Alert sent to manufacturing team!');
                    }}
                >
                    <Send size={16} />
                    Alert Team
                </button>
            </div>
        </div>
    );
};

// RCA Detail Panel Component
const RCADetailPanel = ({ pattern, onClose }) => {
    return (
        <div className="glass-panel p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                    Root Cause Analysis & Corrective Actions
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* RCA Section */}
                <div>
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        Root Cause Analysis (RCA)
                    </h4>
                    <div className="space-y-3">
                        <InfoRow label="Component" value={pattern.component} />
                        <InfoRow label="Vehicle Model" value={pattern.vehicle_model} />
                        <InfoRow label="Batch Number" value={pattern.batch} />
                        <InfoRow label="Affected Count" value={`${pattern.affected_count} vehicles`} />
                    </div>
                </div>

                {/* CAPA Section */}
                <div>
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-500" />
                        Corrective & Preventive Actions (CAPA)
                    </h4>
                    <div className="space-y-2">
                        {pattern.actions?.map((item, idx) => (
                            <ActionItem
                                key={idx}
                                action={item.action}
                                status={item.status}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Info Row Component
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-white/5">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white text-sm font-medium">{value}</span>
    </div>
);

// Action Item Component
const ActionItem = ({ action, status }) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'complete':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'in-progress':
                return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
            default:
                return <Clock size={16} className="text-gray-500" />;
        }
    };

    const getStatusStyles = () => {
        switch (status) {
            case 'complete':
                return 'bg-green-500/10 text-green-400';
            case 'in-progress':
                return 'bg-primary/10 text-primary';
            default:
                return 'bg-white/5 text-gray-400';
        }
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg ${getStatusStyles()}`}>
            {getStatusIcon()}
            <span className="text-sm">{action}</span>
        </div>
    );
};

export default ManufacturingInsights;