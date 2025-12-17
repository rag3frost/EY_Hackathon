// AI Chat Service connecting to the backend LLM
const API_BASE_URL = 'http://localhost:8000';

// Store conversation history
let conversationHistory = [];

export const sendMessageToAI = async (message, vehicleId = null) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory,
                vehicle_id: vehicleId
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        
        // Update conversation history
        conversationHistory.push({ role: 'user', content: message });
        conversationHistory.push({ role: 'assistant', content: data.response });
        
        // Keep history manageable (last 20 messages)
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        return {
            text: data.response,
            sender: 'ai',
            id: Date.now(),
            contextUsed: data.context_used
        };
    } catch (error) {
        console.error('AI Service Error:', error);
        
        // Fallback response when API fails
        return {
            text: "I'm having trouble connecting to the server. Please make sure the backend is running on localhost:8000. In the meantime, I can tell you that I'm Maya, your AI assistant for automotive maintenance. How can I help you?",
            sender: 'ai',
            id: Date.now(),
            error: true
        };
    }
};

// Reset conversation history
export const resetConversation = () => {
    conversationHistory = [];
};

// Get current conversation history
export const getConversationHistory = () => {
    return [...conversationHistory];
};
