import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Clock, AlertCircle, Star, MessageSquare, Phone, MapPin, Wrench, Package } from 'lucide-react';
import { apiService } from '../../services/apiService';

const ServiceTracker = () => {
    const [activeServices, setActiveServices] = useState([]);
    const [completedServices, setCompletedServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [feedbackModal, setFeedbackModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            // Simulate fetching service data
            const mockActiveServices = [
                {
                    id: 'SVC001',
                    vehicleId: 'VEH001',
                    owner: 'Manoj Tiwari',
                    model: 'Toyota Fortuner',
                    serviceType: 'Oil Change & Filter Replacement',
                    status: 'in-progress',
                    progress: 65,
                    technician: 'Amit Patel',
                    center: 'AutoCare Mumbai Central',
                    startTime: '09:00 AM',
                    estimatedCompletion: '11:30 AM',
                    steps: [
                        { name: 'Vehicle Received', status: 'complete', time: '09:00 AM' },
                        { name: 'Initial Inspection', status: 'complete', time: '09:15 AM' },
                        { name: 'Oil Drain', status: 'complete', time: '09:30 AM' },
                        { name: 'Filter Replacement', status: 'in-progress', time: '10:00 AM' },
                        { name: 'New Oil Fill', status: 'pending', time: null },
                        { name: 'Quality Check', status: 'pending', time: null },
                        { name: 'Ready for Delivery', status: 'pending', time: null },
                    ]
                },
                {
                    id: 'SVC002',
                    vehicleId: 'VEH004',
                    owner: 'Vikram Rao',
                    model: 'Volkswagen Polo',
                    serviceType: 'Brake Pad Replacement',
                    status: 'in-progress',
                    progress: 30,
                    technician: 'Ravi Kumar',
                    center: 'AutoCare Delhi South',
                    startTime: '10:00 AM',
                    estimatedCompletion: '01:00 PM',
                    steps: [
                        { name: 'Vehicle Received', status: 'complete', time: '10:00 AM' },
                        { name: 'Wheel Removal', status: 'in-progress', time: '10:30 AM' },
                        { name: 'Brake Inspection', status: 'pending', time: null },
                        { name: 'Pad Replacement', status: 'pending', time: null },
                        { name: 'Assembly', status: 'pending', time: null },
                        { name: 'Test Drive', status: 'pending', time: null },
                        { name: 'Ready for Delivery', status: 'pending', time: null },
                    ]
                }
            ];

            const mockCompletedServices = [
                {
                    id: 'SVC000',
                    vehicleId: 'VEH003',
                    owner: 'Rajesh Kumar',
                    model: 'Maruti Swift VXI',
                    serviceType: 'Full Service',
                    status: 'completed',
                    completedAt: '2025-12-16',
                    cost: 4500,
                    hasFeedback: true,
                    rating: 5
                },
                {
                    id: 'SVC999',
                    vehicleId: 'VEH007',
                    owner: 'Priya Sharma',
                    model: 'Hyundai Creta',
                    serviceType: 'AC Service',
                    status: 'completed',
                    completedAt: '2025-12-15',
                    cost: 3200,
                    hasFeedback: false,
                    rating: null
                }
            ];

            setActiveServices(mockActiveServices);
            setCompletedServices(mockCompletedServices);
            if (mockActiveServices.length > 0) {
                setSelectedService(mockActiveServices[0]);
            }
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async () => {
        // Simulate feedback submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeedbackModal(false);
        setRating(0);
        setFeedbackText('');
        // Update the completed service to show feedback submitted
        setCompletedServices(prev => prev.map(s => 
            s.id === selectedService?.id ? { ...s, hasFeedback: true, rating } : s
        ));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'complete': return <CheckCircle size={16} className="text-green-500" />;
            case 'in-progress': return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
            default: return <Clock size={16} className="text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading service tracker...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Service Progress Tracker</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Service List */}
                <div className="space-y-6">
                    {/* Active Services */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Wrench size={20} className="text-primary" />
                            Active Services
                        </h3>
                        <div className="space-y-3">
                            {activeServices.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                                        selectedService?.id === service.id
                                            ? 'bg-primary/20 border border-primary'
                                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-white font-medium">{service.vehicleId}</span>
                                        <span className="text-primary text-sm">{service.progress}%</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{service.owner}</p>
                                    <p className="text-gray-500 text-xs">{service.serviceType}</p>
                                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${service.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed - Awaiting Feedback */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-500" />
                            Completed Services
                        </h3>
                        <div className="space-y-3">
                            {completedServices.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => {
                                        setSelectedService(service);
                                        if (!service.hasFeedback) {
                                            setFeedbackModal(true);
                                        }
                                    }}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                                        selectedService?.id === service.id
                                            ? 'bg-green-500/20 border border-green-500'
                                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-white font-medium">{service.vehicleId}</span>
                                        {service.hasFeedback ? (
                                            <div className="flex items-center gap-1">
                                                {[...Array(service.rating)].map((_, i) => (
                                                    <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                Feedback Needed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm">{service.owner}</p>
                                    <p className="text-gray-500 text-xs">{service.serviceType}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Service Details */}
                <div className="lg:col-span-2">
                    {selectedService && selectedService.status !== 'completed' && (
                        <div className="glass-panel p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{selectedService.serviceType}</h3>
                                    <p className="text-gray-400">{selectedService.vehicleId} - {selectedService.model}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-primary">{selectedService.progress}%</div>
                                    <p className="text-gray-500 text-sm">Complete</p>
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <InfoCard icon={MapPin} label="Service Center" value={selectedService.center} />
                                <InfoCard icon={Wrench} label="Technician" value={selectedService.technician} />
                                <InfoCard icon={Clock} label="Started" value={selectedService.startTime} />
                                <InfoCard icon={Truck} label="Est. Completion" value={selectedService.estimatedCompletion} />
                            </div>

                            {/* Progress Timeline */}
                            <h4 className="text-white font-medium mb-4">Service Progress</h4>
                            <div className="space-y-3">
                                {selectedService.steps.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-8 flex justify-center">
                                            {getStatusIcon(step.status)}
                                        </div>
                                        <div className={`flex-1 p-3 rounded-lg ${
                                            step.status === 'complete' ? 'bg-green-500/10' :
                                            step.status === 'in-progress' ? 'bg-primary/10' : 'bg-white/5'
                                        }`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-sm ${
                                                    step.status === 'complete' ? 'text-green-400' :
                                                    step.status === 'in-progress' ? 'text-primary' : 'text-gray-500'
                                                }`}>
                                                    {step.name}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {step.time || '--:--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Notification Preferences */}
                            <div className="mt-6 p-4 bg-white/5 rounded-xl">
                                <h4 className="text-white font-medium mb-3">Real-Time Updates</h4>
                                <div className="flex gap-4">
                                    <button className="flex-1 p-3 bg-primary/20 border border-primary rounded-lg text-primary text-sm flex items-center justify-center gap-2">
                                        <MessageSquare size={16} />
                                        SMS Updates: ON
                                    </button>
                                    <button className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-gray-300 text-sm flex items-center justify-center gap-2">
                                        <Phone size={16} />
                                        Call on Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedService && selectedService.status === 'completed' && (
                        <div className="glass-panel p-6">
                            <div className="text-center py-8">
                                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Service Completed!</h3>
                                <p className="text-gray-400 mb-6">{selectedService.serviceType} for {selectedService.model}</p>
                                <div className="flex justify-center gap-6 text-sm">
                                    <div>
                                        <p className="text-gray-500">Completed</p>
                                        <p className="text-white font-medium">{selectedService.completedAt}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Cost</p>
                                        <p className="text-white font-medium">₹{selectedService.cost}</p>
                                    </div>
                                </div>
                                {!selectedService.hasFeedback && (
                                    <button
                                        onClick={() => setFeedbackModal(true)}
                                        className="mt-6 px-8 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium"
                                    >
                                        Leave Feedback
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback Modal */}
            {feedbackModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="glass-panel p-8 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-white mb-6">Rate Your Experience</h3>
                        
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="p-2"
                                >
                                    <Star
                                        size={32}
                                        className={`transition-colors ${
                                            star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Tell us about your experience..."
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none mb-6"
                        />

                        <div className="flex gap-4">
                            <button
                                onClick={() => setFeedbackModal(false)}
                                className="flex-1 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitFeedback}
                                disabled={rating === 0}
                                className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="p-3 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className="text-gray-500" />
            <span className="text-gray-500 text-xs">{label}</span>
        </div>
        <p className="text-white text-sm font-medium">{value}</p>
    </div>
);

export default ServiceTracker;
