import React, { useState, useEffect } from 'react';
import { Factory, AlertTriangle, TrendingUp, FileText, CheckCircle, Clock, Package, Users } from 'lucide-react';
import { apiService } from '../../services/apiService';

const ManufacturingInsights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDefect, setSelectedDefect] = useState(null);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const data = await apiService.getManufacturingInsights();
            setInsights(data);
        } catch (error) {
            console.error('Failed to fetch insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'text-red-500 bg-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/20';
            default: return 'text-green-500 bg-green-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading manufacturing insights...</p>
                </div>
            </div>
        );
    }

    const patterns = insights?.patterns || [];
    const componentFailures = insights?.component_failures || {};
    const recommendations = insights?.recommendations || [];

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Manufacturing Insights (RCA/CAPA)</h2>
                <button
                    onClick={fetchInsights}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <Clock size={16} />
                    Refresh
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={AlertTriangle}
                    label="Patterns Detected"
                    value={patterns.length}
                    color="text-orange-500"
                    bgColor="bg-orange-500/20"
                />
                <StatCard
                    icon={Package}
                    label="Components Tracked"
                    value={Object.keys(componentFailures).length}
                    color="text-blue-500"
                    bgColor="bg-blue-500/20"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total Failures"
                    value={Object.values(componentFailures).reduce((a, b) => a + b, 0)}
                    color="text-red-500"
                    bgColor="bg-red-500/20"
                />
                <StatCard
                    icon={FileText}
                    label="Recommendations"
                    value={recommendations.length}
                    color="text-green-500"
                    bgColor="bg-green-500/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Detected Patterns */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={24} className="text-orange-500" />
                        Detected Patterns
                    </h3>
                    <div className="space-y-4">
                        {patterns.length > 0 ? patterns.map((pattern, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedDefect(pattern)}
                                className={`p-4 rounded-xl bg-white/5 border cursor-pointer transition-all hover:bg-white/10 ${
                                    selectedDefect === pattern ? 'border-primary' : 'border-transparent'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white font-medium">{pattern.component}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(pattern.severity)}`}>
                                        {pattern.severity || 'Medium'}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{pattern.description}</p>
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <span>Model: {pattern.vehicle_model}</span>
                                    <span>Trend: {pattern.trend}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center py-8">No patterns detected</p>
                        )}
                    </div>
                </div>

                {/* Component Failures Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Package size={24} className="text-blue-500" />
                        Component Failure Distribution
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(componentFailures).map(([component, count], idx) => {
                            const maxCount = Math.max(...Object.values(componentFailures));
                            const percentage = (count / maxCount) * 100;
                            
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300">{component}</span>
                                        <span className="text-white font-medium">{count} failures</span>
                                    </div>
                                    <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RCA/CAPA Details */}
            {selectedDefect && (
                <div className="glass-panel p-6 mt-8">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Factory size={24} className="text-primary" />
                            Root Cause Analysis & Corrective Actions
                        </h3>
                        <button
                            onClick={() => setSelectedDefect(null)}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500" />
                                Root Cause Analysis (RCA)
                            </h4>
                            <div className="space-y-4">
                                <InfoRow label="Component" value={selectedDefect.component} />
                                <InfoRow label="Vehicle Model" value={selectedDefect.vehicle_model} />
                                <InfoRow label="Failure Trend" value={selectedDefect.trend} />
                                <InfoRow label="Description" value={selectedDefect.description} />
                                <InfoRow 
                                    label="Root Cause" 
                                    value="Supplier quality issue - incorrect material composition in batch" 
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-500" />
                                Corrective & Preventive Actions (CAPA)
                            </h4>
                            <div className="space-y-3">
                                <ActionItem 
                                    status="complete"
                                    action="Identified affected batch numbers"
                                />
                                <ActionItem 
                                    status="complete"
                                    action="Notified supplier of quality issue"
                                />
                                <ActionItem 
                                    status="in-progress"
                                    action="Flagged all affected vehicles for inspection"
                                />
                                <ActionItem 
                                    status="in-progress"
                                    action="Enhanced QC procedures implemented"
                                />
                                <ActionItem 
                                    status="pending"
                                    action="Supplier audit scheduled"
                                />
                                <ActionItem 
                                    status="pending"
                                    action="New supplier qualification process"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Manufacturing Alert */}
                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Users size={20} className="text-yellow-500 mt-1" />
                            <div>
                                <p className="text-yellow-400 font-medium">Manufacturing Team Alert</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Alert sent to production team with full analysis. 
                                    All vehicles with affected components are scheduled for preventive inspection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="glass-panel p-6 mt-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <FileText size={24} className="text-green-500" />
                    System Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec, idx) => (
                        <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-white text-sm">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="glass-panel p-6">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
            <Icon size={24} className={color} />
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-white/5">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white text-sm text-right max-w-[60%]">{value}</span>
    </div>
);

const ActionItem = ({ status, action }) => {
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

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
            status === 'complete' ? 'bg-green-500/10' :
            status === 'in-progress' ? 'bg-primary/10' : 'bg-white/5'
        }`}>
            {getStatusIcon()}
            <span className={`text-sm ${
                status === 'complete' ? 'text-green-400' :
                status === 'in-progress' ? 'text-primary' : 'text-gray-400'
            }`}>
                {action}
            </span>
        </div>
    );
};

export default ManufacturingInsights;
