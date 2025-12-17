import React from 'react';
import { Settings, Clock, Headphones, Activity, Car, Brain, Calendar, Factory, Shield, Phone, Truck, TrendingUp } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'diagnostics', icon: Activity, label: 'Diagnostics' },
        { id: 'fleet', icon: Car, label: 'Fleet' },
        { id: 'agents', icon: Brain, label: 'AI Agents' },
        { id: 'voice', icon: Phone, label: 'Voice Agent' },
        { id: 'scheduling', icon: Calendar, label: 'Schedule' },
        { id: 'tracker', icon: Truck, label: 'Tracker' },
        { id: 'forecast', icon: TrendingUp, label: 'Forecast' },
        { id: 'manufacturing', icon: Factory, label: 'RCA/CAPA' },
        { id: 'security', icon: Shield, label: 'UEBA' },
        { id: 'history', icon: Clock, label: 'History' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="w-24 h-full flex flex-col items-center py-4 space-y-2 glass-panel border-r border-white/10 rounded-none rounded-r-3xl z-20 overflow-y-auto">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-col items-center justify-center w-18 h-16 min-h-[64px] rounded-xl transition-all duration-300 group hover:bg-white/5 ${activeTab === item.id
                        ? 'bg-white/10 border border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'border border-transparent'
                        }`}
                >
                    <item.icon
                        size={20}
                        className={`mb-1 transition-colors duration-300 ${activeTab === item.id ? 'text-primary' : 'text-gray-400 group-hover:text-white'
                            }`}
                    />
                    <span className={`text-[9px] font-medium transition-colors duration-300 text-center leading-tight ${activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                        }`}>
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default Sidebar;
