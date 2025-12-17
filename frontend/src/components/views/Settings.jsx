import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import { dataService } from '../../services/dataService';

const Settings = () => {
    const [settings, setSettings] = useState({
        apiKey: '',
        vehicleModel: 'Mercedes-Benz AMG GT',
        voiceEnabled: false
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loaded = dataService.getSettings();
        setSettings(loaded);
    }, []);

    const handleSave = () => {
        dataService.saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Settings</h2>

            <div className="glass-panel p-8 max-w-2xl">
                <h3 className="text-xl font-semibold text-white mb-6">General Configuration</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">API Key (OpenAI / Anthropic)</label>
                        <input
                            type="password"
                            value={settings.apiKey}
                            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                            placeholder="sk-..."
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Vehicle Model</label>
                        <select
                            value={settings.vehicleModel}
                            onChange={(e) => setSettings({ ...settings, vehicleModel: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        >
                            <option>Mercedes-Benz AMG GT</option>
                            <option>Tesla Model S</option>
                            <option>Porsche 911</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-white/10">
                        <span className="text-gray-300">Enable Voice Response</span>
                        <button
                            onClick={() => setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
                            className={`w-12 h-6 rounded-full border relative transition-colors ${settings.voiceEnabled ? 'bg-primary/20 border-primary/50' : 'bg-gray-800 border-gray-600'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${settings.voiceEnabled
                                    ? 'right-1 bg-primary shadow-lg shadow-primary/50'
                                    : 'left-1 bg-gray-400'
                                }`}></div>
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-3 rounded-lg bg-primary text-black font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        {saved ? <Check size={18} /> : <Save size={18} />}
                        {saved ? 'Saved Successfully' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
