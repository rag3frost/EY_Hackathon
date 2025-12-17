import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, Volume2, VolumeX, User, Bot, Play, Pause, MessageSquare, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { apiService } from '../../services/apiService';

const VoiceAgent = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
    const [conversation, setConversation] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [engagementResult, setEngagementResult] = useState(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await apiService.getVehicles();
            // Filter vehicles that need attention
            const vehiclesNeedingAttention = data.filter(v => 
                v.sensors.oil_pressure < 30 || 
                v.sensors.brake_pad_thickness < 4 ||
                v.sensors.engine_temp > 100 ||
                v.sensors.battery_voltage < 12
            );
            setVehicles(data);
            if (vehiclesNeedingAttention.length > 0) {
                setSelectedVehicle(vehiclesNeedingAttention[0]);
            }
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const startCall = async () => {
        if (!selectedVehicle) return;
        
        setCallStatus('calling');
        setConversation([]);
        
        // Simulate dialing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCallStatus('connected');

        try {
            // Get engagement data from API
            const result = await apiService.engageCustomer(selectedVehicle.id);
            setEngagementResult(result);

            // Simulate the conversation with realistic delays
            const conversationScript = generateConversation(selectedVehicle, result);
            
            for (let i = 0; i < conversationScript.length; i++) {
                await new Promise(resolve => setTimeout(resolve, conversationScript[i].delay));
                setConversation(prev => [...prev, conversationScript[i]]);
            }

        } catch (error) {
            console.error('Engagement failed:', error);
            // Use mock conversation if API fails
            const mockConversation = generateMockConversation(selectedVehicle);
            for (let i = 0; i < mockConversation.length; i++) {
                await new Promise(resolve => setTimeout(resolve, mockConversation[i].delay));
                setConversation(prev => [...prev, mockConversation[i]]);
            }
        }
    };

    const generateConversation = (vehicle, result) => {
        const issues = [];
        if (vehicle.sensors.oil_pressure < 30) issues.push('low oil pressure');
        if (vehicle.sensors.brake_pad_thickness < 4) issues.push('worn brake pads');
        if (vehicle.sensors.engine_temp > 100) issues.push('high engine temperature');
        if (vehicle.sensors.battery_voltage < 12) issues.push('low battery voltage');

        const issueText = issues.join(' and ');
        const kmSinceService = vehicle.mileage - vehicle.last_service_km;

        return [
            { sender: 'agent', text: `Good morning ${vehicle.owner}! This is Maya from AutoCare AI. How are you today?`, delay: 1000 },
            { sender: 'customer', text: "I'm good, what's this about?", delay: 2500 },
            { sender: 'agent', text: `I'm calling because our AI monitoring system detected that your ${vehicle.model} needs urgent attention. Your vehicle has covered ${kmSinceService.toLocaleString()} km since the last service, and we're seeing ${issueText}.`, delay: 3000 },
            { sender: 'customer', text: "Is it serious? I'm quite busy this week with work.", delay: 2500 },
            { sender: 'agent', text: `I completely understand your schedule is tight. However, continuing to drive with ${issueText} could cause severe damage - repairs could cost ₹45,000 to ₹80,000. A preventive service today costs just ₹3,500 and takes only 45 minutes.`, delay: 3500 },
            { sender: 'customer', text: "Hmm, that's a big difference. But I really don't have time.", delay: 2000 },
            { sender: 'agent', text: `What if we made this super convenient? We can book you tomorrow at 9 AM at our ${vehicle.location} center - just 2 km from your location. We'll send a courtesy car to pick up your vehicle, service it while you work, and deliver it back by lunch. Would that work?`, delay: 4000 },
            { sender: 'customer', text: "That actually sounds good. Can you guarantee it'll be done by noon?", delay: 2500 },
            { sender: 'agent', text: "Absolutely! We'll confirm the pickup at 8:45 AM, service completion by 11:30 AM, and delivery by 12 PM. You'll get real-time updates on your phone. Shall I book this for you?", delay: 3000 },
            { sender: 'customer', text: "Yes, please go ahead.", delay: 1500 },
            { sender: 'agent', text: `Perfect! Your appointment is confirmed for tomorrow at 9 AM. You'll receive a confirmation SMS shortly with the pickup details. Thank you for trusting AutoCare, ${vehicle.owner.split(' ')[0]}!`, delay: 2500 },
        ];
    };

    const generateMockConversation = (vehicle) => {
        return generateConversation(vehicle, null);
    };

    const endCall = () => {
        setCallStatus('ended');
    };

    const resetCall = () => {
        setCallStatus('idle');
        setConversation([]);
        setEngagementResult(null);
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading voice agent...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Voice Agent - Customer Engagement</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vehicle Selection */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-orange-500" />
                        Vehicles Requiring Contact
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {vehicles.filter(v => 
                            v.sensors.oil_pressure < 30 || 
                            v.sensors.brake_pad_thickness < 4 ||
                            v.sensors.engine_temp > 100
                        ).map((vehicle) => (
                            <div
                                key={vehicle.id}
                                onClick={() => setSelectedVehicle(vehicle)}
                                className={`p-4 rounded-xl cursor-pointer transition-all ${
                                    selectedVehicle?.id === vehicle.id
                                        ? 'bg-primary/20 border border-primary'
                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-white font-medium">{vehicle.id}</span>
                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                        Urgent
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">{vehicle.owner}</p>
                                <p className="text-gray-500 text-xs">{vehicle.model}</p>
                            </div>
                        ))}
                        {vehicles.filter(v => 
                            v.sensors.oil_pressure >= 30 && 
                            v.sensors.brake_pad_thickness >= 4 &&
                            v.sensors.engine_temp <= 100
                        ).slice(0, 3).map((vehicle) => (
                            <div
                                key={vehicle.id}
                                onClick={() => setSelectedVehicle(vehicle)}
                                className={`p-4 rounded-xl cursor-pointer transition-all ${
                                    selectedVehicle?.id === vehicle.id
                                        ? 'bg-primary/20 border border-primary'
                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-white font-medium">{vehicle.id}</span>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                        Routine
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">{vehicle.owner}</p>
                                <p className="text-gray-500 text-xs">{vehicle.model}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call Interface */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Phone size={20} className="text-primary" />
                        Voice Conversation
                    </h3>

                    {selectedVehicle && (
                        <div className="mb-6 p-4 bg-white/5 rounded-xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white font-medium">{selectedVehicle.owner}</p>
                                    <p className="text-gray-400 text-sm">{selectedVehicle.phone}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm">{selectedVehicle.model}</p>
                                    <p className="text-gray-500 text-xs">{selectedVehicle.id}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Call Controls */}
                    <div className="flex justify-center gap-4 mb-6">
                        {callStatus === 'idle' && (
                            <button
                                onClick={startCall}
                                disabled={!selectedVehicle}
                                className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-full text-white font-medium flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PhoneCall size={24} />
                                Start Call
                            </button>
                        )}

                        {callStatus === 'calling' && (
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                                    <PhoneCall size={32} className="text-green-500" />
                                </div>
                                <span className="text-white">Calling {selectedVehicle?.owner}...</span>
                            </div>
                        )}

                        {callStatus === 'connected' && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`p-4 rounded-full transition-all ${
                                        isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'
                                    }`}
                                >
                                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </button>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="p-4 rounded-full bg-white/10 text-white"
                                >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                </button>
                                <button
                                    onClick={endCall}
                                    className="px-6 py-4 bg-red-500 hover:bg-red-600 rounded-full text-white font-medium flex items-center gap-2 transition-all"
                                >
                                    <PhoneOff size={24} />
                                    End Call
                                </button>
                            </div>
                        )}

                        {callStatus === 'ended' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle size={24} />
                                    <span>Call Completed - Appointment Booked!</span>
                                </div>
                                <button
                                    onClick={resetCall}
                                    className="px-6 py-3 bg-primary/20 border border-primary rounded-lg text-primary hover:bg-primary/30 transition-all"
                                >
                                    Start New Call
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Conversation Transcript */}
                    <div className="bg-black/30 rounded-xl p-4 h-80 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                            <MessageSquare size={16} className="text-gray-400" />
                            <span className="text-gray-400 text-sm">Conversation Transcript</span>
                        </div>
                        
                        {conversation.length === 0 && callStatus === 'idle' && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Select a vehicle and start a call to see the conversation
                            </div>
                        )}

                        <div className="space-y-4">
                            {conversation.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex gap-3 ${msg.sender === 'agent' ? '' : 'flex-row-reverse'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        msg.sender === 'agent' ? 'bg-primary/20' : 'bg-purple-500/20'
                                    }`}>
                                        {msg.sender === 'agent' ? (
                                            <Bot size={16} className="text-primary" />
                                        ) : (
                                            <User size={16} className="text-purple-400" />
                                        )}
                                    </div>
                                    <div className={`max-w-[80%] p-3 rounded-xl ${
                                        msg.sender === 'agent' 
                                            ? 'bg-primary/10 text-gray-200' 
                                            : 'bg-purple-500/10 text-gray-200'
                                    }`}>
                                        <p className="text-xs text-gray-500 mb-1">
                                            {msg.sender === 'agent' ? 'Agent Maya' : selectedVehicle?.owner}
                                        </p>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Persuasion Tactics Used */}
                    {callStatus === 'ended' && (
                        <div className="mt-6 p-4 bg-white/5 rounded-xl">
                            <h4 className="text-white font-medium mb-3">Persuasion Tactics Used</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <TacticBadge label="Urgency" description="Engine damage risk highlighted" />
                                <TacticBadge label="Cost Comparison" description="₹3,500 vs ₹80,000" />
                                <TacticBadge label="Convenience" description="Pickup/delivery service offered" />
                                <TacticBadge label="Specific Commitment" description="Time guarantee provided" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TacticBadge = ({ label, description }) => (
    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <p className="text-green-400 font-medium text-sm">{label}</p>
        <p className="text-gray-400 text-xs">{description}</p>
    </div>
);

export default VoiceAgent;
