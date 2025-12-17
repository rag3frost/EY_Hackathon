import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const RepairHistory = () => {
    const history = [
        { id: 1, date: '2023-10-15', service: 'Oil Change', status: 'Completed', icon: CheckCircle, color: 'text-green-500' },
        { id: 2, date: '2023-09-01', service: 'Brake Pad Replacement', status: 'Completed', icon: CheckCircle, color: 'text-green-500' },
        { id: 3, date: '2023-08-12', service: 'Engine Diagnostics', status: 'Pending', icon: Clock, color: 'text-yellow-500' },
        { id: 4, date: '2023-07-20', service: 'Battery Check', status: 'Issue Found', icon: AlertTriangle, color: 'text-red-500' },
    ];

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Repair History</h2>
            <div className="space-y-4">
                {history.map((item) => (
                    <div key={item.id} className="glass-panel p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center ${item.color}`}>
                                <item.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{item.service}</h3>
                                <p className="text-gray-400 text-sm">{item.date}</p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium bg-white/5 ${item.color}`}>
                            {item.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RepairHistory;
