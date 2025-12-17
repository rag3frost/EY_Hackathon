import React from 'react';
import { Phone, Video, MessageSquare } from 'lucide-react';

const LiveAssistance = () => {
    return (
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
            <div className="glass-panel p-12 max-w-2xl w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600"></div>

                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Phone size={40} className="text-primary" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">Connect with an Expert</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Our certified mechanics are available 24/7 to help you diagnose issues remotely.
                </p>

                <div className="grid grid-cols-3 gap-4">
                    <button className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                        <Phone size={24} className="text-gray-300 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-gray-300">Voice Call</span>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                        <Video size={24} className="text-gray-300 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-gray-300">Video Call</span>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                        <MessageSquare size={24} className="text-gray-300 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-gray-300">Chat</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveAssistance;
