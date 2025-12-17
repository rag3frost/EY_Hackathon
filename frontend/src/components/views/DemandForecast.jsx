import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Users, Wrench, AlertTriangle, CheckCircle, BarChart3, PieChart } from 'lucide-react';
import { apiService } from '../../services/apiService';

const DemandForecast = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [forecastPeriod, setForecastPeriod] = useState('week');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await apiService.getVehicles();
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate demand based on vehicle data
    const calculateDemand = () => {
        const urgent = vehicles.filter(v => 
            v.sensors.oil_pressure < 30 || 
            v.sensors.brake_pad_thickness < 4 ||
            v.sensors.engine_temp > 110
        ).length;

        const soon = vehicles.filter(v => 
            (v.sensors.oil_pressure >= 30 && v.sensors.oil_pressure < 40) ||
            (v.sensors.brake_pad_thickness >= 4 && v.sensors.brake_pad_thickness < 5) ||
            (v.sensors.engine_temp > 95 && v.sensors.engine_temp <= 110) ||
            (v.mileage - v.last_service_km > 8000)
        ).length;

        const routine = vehicles.filter(v => 
            v.mileage - v.last_service_km > 5000 && v.mileage - v.last_service_km <= 8000
        ).length;

        return { urgent, soon, routine, total: urgent + soon + routine };
    };

    const demand = calculateDemand();

    // Service type distribution
    const serviceTypes = [
        { name: 'Oil Change', count: 4, color: 'bg-blue-500' },
        { name: 'Brake Service', count: 2, color: 'bg-red-500' },
        { name: 'Engine Tune-up', count: 2, color: 'bg-yellow-500' },
        { name: 'Battery Check', count: 1, color: 'bg-green-500' },
        { name: 'Tire Service', count: 1, color: 'bg-purple-500' },
    ];

    // Weekly forecast data
    const weeklyForecast = [
        { day: 'Mon', services: 3, capacity: 8 },
        { day: 'Tue', services: 5, capacity: 8 },
        { day: 'Wed', services: 4, capacity: 8 },
        { day: 'Thu', services: 6, capacity: 8 },
        { day: 'Fri', services: 7, capacity: 8 },
        { day: 'Sat', services: 8, capacity: 10 },
        { day: 'Sun', services: 2, capacity: 4 },
    ];

    // Center workload
    const centerWorkload = [
        { name: 'AutoCare Mumbai Central', current: 6, capacity: 20, utilization: 30 },
        { name: 'AutoCare Delhi South', current: 17, capacity: 20, utilization: 85 },
    ];

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading forecast data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Service Demand Forecast</h2>
                <div className="flex gap-2">
                    {['week', 'month', 'quarter'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setForecastPeriod(period)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                forecastPeriod === period
                                    ? 'bg-primary text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Demand Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={AlertTriangle}
                    label="Urgent Services"
                    value={demand.urgent}
                    subtext="Require immediate attention"
                    color="text-red-500"
                    bgColor="bg-red-500/20"
                />
                <StatCard
                    icon={Calendar}
                    label="Due Soon"
                    value={demand.soon}
                    subtext="Within next 2 weeks"
                    color="text-yellow-500"
                    bgColor="bg-yellow-500/20"
                />
                <StatCard
                    icon={Wrench}
                    label="Routine Services"
                    value={demand.routine}
                    subtext="Scheduled maintenance"
                    color="text-blue-500"
                    bgColor="bg-blue-500/20"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total Forecasted"
                    value={demand.total}
                    subtext="This period"
                    color="text-primary"
                    bgColor="bg-primary/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Weekly Capacity Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <BarChart3 size={24} className="text-primary" />
                        Weekly Service Forecast
                    </h3>
                    <div className="space-y-4">
                        {weeklyForecast.map((day, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-300">{day.day}</span>
                                    <span className={`font-medium ${
                                        day.services >= day.capacity * 0.9 ? 'text-red-400' :
                                        day.services >= day.capacity * 0.7 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                        {day.services} / {day.capacity} slots
                                    </span>
                                </div>
                                <div className="h-6 bg-white/10 rounded-full overflow-hidden relative">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            day.services >= day.capacity * 0.9 ? 'bg-red-500' :
                                            day.services >= day.capacity * 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${(day.services / day.capacity) * 100}%` }}
                                    />
                                    <div 
                                        className="absolute top-0 h-full border-r-2 border-dashed border-white/50"
                                        style={{ left: '80%' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span>Normal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <span>High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span>At Capacity</span>
                        </div>
                    </div>
                </div>

                {/* Service Type Distribution */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <PieChart size={24} className="text-purple-500" />
                        Service Type Distribution
                    </h3>
                    <div className="space-y-4">
                        {serviceTypes.map((type, idx) => {
                            const total = serviceTypes.reduce((a, b) => a + b.count, 0);
                            const percentage = Math.round((type.count / total) * 100);
                            
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300">{type.name}</span>
                                        <span className="text-white font-medium">{type.count} ({percentage}%)</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${type.color}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Service Center Workload */}
            <div className="glass-panel p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Users size={24} className="text-orange-500" />
                    Service Center Workload Optimization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {centerWorkload.map((center, idx) => (
                        <div key={idx} className="p-6 bg-white/5 rounded-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white font-medium">{center.name}</h4>
                                    <p className="text-gray-500 text-sm">{center.current} / {center.capacity} capacity</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    center.utilization >= 80 ? 'bg-red-500/20 text-red-400' :
                                    center.utilization >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                    {center.utilization}% Utilized
                                </span>
                            </div>
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-4">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        center.utilization >= 80 ? 'bg-red-500' :
                                        center.utilization >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${center.utilization}%` }}
                                />
                            </div>
                            {center.utilization >= 80 && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p className="text-yellow-400 text-sm">
                                        ⚠️ Recommendation: Redirect {Math.round((center.utilization - 60) / 10)} services to other centers
                                    </p>
                                </div>
                            )}
                            {center.utilization < 40 && (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <p className="text-blue-400 text-sm">
                                        ℹ️ Available for additional appointments
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Predictions & Recommendations */}
            <div className="glass-panel p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <TrendingUp size={24} className="text-green-500" />
                    AI-Powered Predictions & Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <PredictionCard
                        type="peak"
                        title="Peak Demand Expected"
                        description="Saturday shows 100% capacity booking. Consider extending hours or adding staff."
                        action="Add 2 technicians for Saturday"
                    />
                    <PredictionCard
                        type="pattern"
                        title="Seasonal Pattern Detected"
                        description="Historical data shows 40% increase in AC services expected next month."
                        action="Stock up on AC parts & refrigerant"
                    />
                    <PredictionCard
                        type="balance"
                        title="Load Balancing Opportunity"
                        description="Delhi South center is overloaded while Mumbai Central has capacity."
                        action="Offer incentives for Mumbai bookings"
                    />
                    <PredictionCard
                        type="alert"
                        title="Brake Pad Surge"
                        description="3 vehicles show critical brake pad wear. Emergency slots may be needed."
                        action="Reserve 2 emergency slots daily"
                    />
                    <PredictionCard
                        type="success"
                        title="Proactive Contact Impact"
                        description="Voice agent calls have increased service bookings by 34% this month."
                        action="Continue automated outreach"
                    />
                    <PredictionCard
                        type="optimize"
                        title="Resource Optimization"
                        description="Monday and Wednesday have low utilization. Ideal for bulk fleet services."
                        action="Target fleet owners for these days"
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

const PredictionCard = ({ type, title, description, action }) => {
    const getTypeStyle = () => {
        switch (type) {
            case 'peak': return 'border-red-500/30 bg-red-500/5';
            case 'pattern': return 'border-blue-500/30 bg-blue-500/5';
            case 'balance': return 'border-yellow-500/30 bg-yellow-500/5';
            case 'alert': return 'border-orange-500/30 bg-orange-500/5';
            case 'success': return 'border-green-500/30 bg-green-500/5';
            case 'optimize': return 'border-purple-500/30 bg-purple-500/5';
            default: return 'border-white/10 bg-white/5';
        }
    };

    return (
        <div className={`p-4 rounded-xl border ${getTypeStyle()}`}>
            <h4 className="text-white font-medium mb-2">{title}</h4>
            <p className="text-gray-400 text-sm mb-3">{description}</p>
            <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                <span className="text-primary text-sm">{action}</span>
            </div>
        </div>
    );
};

export default DemandForecast;
