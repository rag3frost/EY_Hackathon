// API Service for connecting to the Backend
const API_BASE_URL = 'http://localhost:8000';

export const apiService = {
    // Fetch all vehicles
    getVehicles: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles`);
            if (!response.ok) throw new Error('Failed to fetch vehicles');
            const data = await response.json();
            return data.vehicles;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },

    // Fetch single vehicle details
    getVehicle: async (vehicleId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`);
            if (!response.ok) throw new Error('Failed to fetch vehicle');
            return await response.json();
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            throw error;
        }
    },

    // Fetch vehicle health analysis
    getVehicleHealth: async (vehicleId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/health`);
            if (!response.ok) throw new Error('Failed to fetch vehicle health');
            return await response.json();
        } catch (error) {
            console.error('Error fetching vehicle health:', error);
            throw error;
        }
    },

    // Predict vehicle failures
    predictFailures: async (vehicleId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/predict`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to predict failures');
            return await response.json();
        } catch (error) {
            console.error('Error predicting failures:', error);
            throw error;
        }
    },

    // Start customer engagement
    engageCustomer: async (vehicleId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/engage`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to engage customer');
            return await response.json();
        } catch (error) {
            console.error('Error engaging customer:', error);
            throw error;
        }
    },

    // Schedule service
    scheduleService: async (vehicleId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/schedule`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to schedule service');
            return await response.json();
        } catch (error) {
            console.error('Error scheduling service:', error);
            throw error;
        }
    },

    // Run full orchestration workflow
    orchestrateWorkflow: async (vehicleId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/orchestrate`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to orchestrate workflow');
            return await response.json();
        } catch (error) {
            console.error('Error orchestrating workflow:', error);
            throw error;
        }
    },

    // Fetch service centers
    getServiceCenters: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/service-centers`);
            if (!response.ok) throw new Error('Failed to fetch service centers');
            return await response.json();
        } catch (error) {
            console.error('Error fetching service centers:', error);
            throw error;
        }
    },

    // Fetch manufacturing insights (RCA/CAPA)
    getManufacturingInsights: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/manufacturing/insights`);
            if (!response.ok) throw new Error('Failed to fetch manufacturing insights');
            return await response.json();
        } catch (error) {
            console.error('Error fetching manufacturing insights:', error);
            throw error;
        }
    },

    // Fetch security logs
    getSecurityLogs: async (limit = 50) => {
        try {
            const response = await fetch(`${API_BASE_URL}/security/logs?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch security logs');
            return await response.json();
        } catch (error) {
            console.error('Error fetching security logs:', error);
            throw error;
        }
    },

    // Check agent action for security
    checkAgentAction: async (agent, action, data = {}) => {
        try {
            const response = await fetch(`${API_BASE_URL}/security/check-action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent, action, data }),
            });
            if (!response.ok) throw new Error('Failed to check agent action');
            return await response.json();
        } catch (error) {
            console.error('Error checking agent action:', error);
            throw error;
        }
    },

    // Get agent status
    getAgentStatus: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/agent-status`);
            if (!response.ok) throw new Error('Failed to fetch agent status');
            return await response.json();
        } catch (error) {
            console.error('Error fetching agent status:', error);
            throw error;
        }
    },

    // Get feedback summary
    getFeedbackSummary: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/feedback/summary`);
            if (!response.ok) throw new Error('Failed to fetch feedback summary');
            return await response.json();
        } catch (error) {
            console.error('Error fetching feedback summary:', error);
            throw error;
        }
    }
};
