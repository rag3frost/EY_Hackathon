import React, { useState, useEffect } from 'react';
import { Car, AlertTriangle, CheckCircle, Clock, Thermometer, Droplet, Battery, Disc } from 'lucide-react';
import { apiService } from '../../services/apiService';

const VehicleFleet = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicleHealth, setVehicleHealth] = useState(null);
    const [healthLoading, setHealthLoading] = useState(false);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await apiService.getVehicles();
            setVehicles(data);
        } catch (err) {
            setError('Failed to load vehicles. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleHealth = async (vehicleId) => {
        try {
            setHealthLoading(true);
            const health = await apiService.getVehicleHealth(vehicleId);
            setVehicleHealth(health);
        } catch (err) {
            console.error('Failed to fetch health:', err);
        } finally {
            setHealthLoading(false);
        }
    };

    const handleVehicleClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        fetchVehicleHealth(vehicle.id);
    };

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getHealthBg = (score) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/50';
        if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
        return 'bg-red-500/20 border-red-500/50';
    };

    const getSensorStatus = (type, value) => {
        switch (type) {
            case 'oil_pressure':
                return value < 30 ? 'critical' : value < 40 ? 'warning' : 'normal';
            case 'engine_temp':
                return value > 110 ? 'critical' : value > 100 ? 'warning' : 'normal';
            case 'brake_pad_thickness':
                return value < 4 ? 'critical' : value < 5 ? 'warning' : 'normal';
            case 'battery_voltage':
                return value < 11.5 ? 'critical' : value < 12 ? 'warning' : 'normal';
            default:
                return 'normal';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            default: return 'text-green-500';
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading fleet data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="glass-panel p-8 text-center max-w-md">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button 
                        onClick={fetchVehicles}
                        className="px-6 py-2 bg-primary/20 border border-primary rounded-lg text-primary hover:bg-primary/30 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Vehicle Fleet Monitoring</h2>
                <button 
                    onClick={fetchVehicles}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <Clock size={16} />
                    Refresh
                </button>
            </div>

            <div className="flex gap-8">
                {/* Vehicle Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {vehicles.map((vehicle) => {
                            const hasIssues = 
                                vehicle.sensors.oil_pressure < 30 ||
                                vehicle.sensors.engine_temp > 100 ||
                                vehicle.sensors.brake_pad_thickness < 4 ||
                                vehicle.sensors.battery_voltage < 12;
                            
                            const healthScore = hasIssues ? (
                                vehicle.sensors.oil_pressure < 30 ? 45 :
                                vehicle.sensors.engine_temp > 100 ? 55 :
                                vehicle.sensors.brake_pad_thickness < 4 ? 50 : 65
                            ) : 85 + Math.floor(Math.random() * 10);

                            return (
                                <div
                                    key={vehicle.id}
                                    onClick={() => handleVehicleClick(vehicle)}
                                    className={`glass-panel p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
                                        selectedVehicle?.id === vehicle.id 
                                            ? 'border-primary shadow-[0_0_20px_rgba(0,240,255,0.3)]' 
                                            : 'border-transparent hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`p-2 rounded-lg ${getHealthBg(healthScore)}`}>
                                            <Car size={20} className={getHealthColor(healthScore)} />
                                        </div>
                                        {hasIssues && (
                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                Alert
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-white font-semibold text-sm truncate">{vehicle.id}</h3>
                                    <p className="text-gray-400 text-xs truncate">{vehicle.model}</p>
                                    <p className="text-gray-500 text-xs">{vehicle.owner}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className={`text-lg font-bold ${getHealthColor(healthScore)}`}>
                                            {healthScore}%
                                        </span>
                                        <span className="text-gray-500 text-xs">{vehicle.location}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Vehicle Details Panel */}
                {selectedVehicle && (
                    <div className="w-96 glass-panel p-6 h-fit sticky top-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-primary/20">
                                <Car size={24} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedVehicle.id}</h3>
                                <p className="text-gray-400 text-sm">{selectedVehicle.model}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Owner</span>
                                <span className="text-white">{selectedVehicle.owner}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Phone</span>
                                <span className="text-white">{selectedVehicle.phone}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Mileage</span>
                                <span className="text-white">{selectedVehicle.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Last Service</span>
                                <span className="text-white">{selectedVehicle.last_service_date}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Location</span>
                                <span className="text-white">{selectedVehicle.location}</span>
                            </div>
                        </div>

                        <h4 className="text-white font-semibold mb-3">Sensor Readings</h4>
                        <div className="space-y-3">
                            <SensorReading 
                                icon={Droplet} 
                                label="Oil Pressure" 
                                value={`${selectedVehicle.sensors.oil_pressure} PSI`}
                                status={getSensorStatus('oil_pressure', selectedVehicle.sensors.oil_pressure)}
                            />
                            <SensorReading 
                                icon={Thermometer} 
                                label="Engine Temp" 
                                value={`${selectedVehicle.sensors.engine_temp}°C`}
                                status={getSensorStatus('engine_temp', selectedVehicle.sensors.engine_temp)}
                            />
                            <SensorReading 
                                icon={Disc} 
                                label="Brake Pads" 
                                value={`${selectedVehicle.sensors.brake_pad_thickness} mm`}
                                status={getSensorStatus('brake_pad_thickness', selectedVehicle.sensors.brake_pad_thickness)}
                            />
                            <SensorReading 
                                icon={Battery} 
                                label="Battery" 
                                value={`${selectedVehicle.sensors.battery_voltage} V`}
                                status={getSensorStatus('battery_voltage', selectedVehicle.sensors.battery_voltage)}
                            />
                        </div>

                        {vehicleHealth && !healthLoading && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="text-white font-semibold mb-3">Health Analysis</h4>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`text-3xl font-bold ${getHealthColor(vehicleHealth.health_score)}`}>
                                        {vehicleHealth.health_score}
                                    </div>
                                    <span className="text-gray-400">/ 100</span>
                                </div>
                                {vehicleHealth.anomalies && vehicleHealth.anomalies.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-gray-400 text-sm">Issues Detected:</p>
                                        {vehicleHealth.anomalies.map((anomaly, idx) => (
                                            <div key={idx} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                <p className="text-red-400 text-sm font-medium">{anomaly.component}</p>
                                                <p className="text-gray-400 text-xs">{anomaly.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {healthLoading && (
                            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const SensorReading = ({ icon: Icon, label, value, status }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            default: return 'text-green-500';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'critical': return 'bg-red-500/20';
            case 'warning': return 'bg-yellow-500/20';
            default: return 'bg-green-500/20';
        }
    };

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg ${getStatusBg(status)}`}>
            <div className="flex items-center gap-3">
                <Icon size={18} className={getStatusColor(status)} />
                <span className="text-gray-300 text-sm">{label}</span>
            </div>
            <span className={`font-medium ${getStatusColor(status)}`}>{value}</span>
        </div>
    );
};

export default VehicleFleet;
