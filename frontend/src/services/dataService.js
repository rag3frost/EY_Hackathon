const SETTINGS_KEY = 'auto_aide_settings';

export const dataService = {
    saveSettings: (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    },

    getSettings: () => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        return saved ? JSON.parse(saved) : {
            apiKey: '',
            vehicleModel: 'Mercedes-Benz AMG GT',
            voiceEnabled: false
        };
    },

    getRepairHistory: () => {
        // Mock data - in a real app this would fetch from an API
        return [
            { id: 1, date: '2023-10-15', service: 'Oil Change', status: 'Completed', color: 'text-green-500' },
            { id: 2, date: '2023-09-01', service: 'Brake Pad Replacement', status: 'Completed', color: 'text-green-500' },
            { id: 3, date: '2023-08-12', service: 'Engine Diagnostics', status: 'Pending', color: 'text-yellow-500' },
            { id: 4, date: '2023-07-20', service: 'Battery Check', status: 'Issue Found', color: 'text-red-500' },
        ];
    }
};
