import React, { useState, useEffect } from 'react';
import { Brain, Database, Stethoscope, MessageSquare, Calendar, ThumbsUp, Factory, Shield, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/apiService';

const AgentOrchestration = () => {
    const [agentStatus, setAgentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeWorkflow, setActiveWorkflow] = useState(null);
    const [workflowSteps, setWorkflowSteps] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');

    const agents = [
        { id: 'data_analysis', name: 'Data Analysis', icon: Database, description: 'Analyzes vehicle sensor data', color: 'from-blue-500 to-cyan-500' },
        { id: 'diagnosis', name: 'Diagnosis', icon: Stethoscope, description: 'Predicts potential failures', color: 'from-purple-500 to-pink-500' },
        { id: 'customer_engagement', name: 'Customer Engagement', icon: MessageSquare, description: 'Handles voice conversations', color: 'from-green-500 to-emerald-500' },
        { id: 'scheduling', name: 'Scheduling', icon: Calendar, description: 'Books service appointments', color: 'from-orange-500 to-amber-500' },
        { id: 'feedback', name: 'Feedback', icon: ThumbsUp, description: 'Collects satisfaction data', color: 'from-pink-500 to-rose-500' },
        { id: 'manufacturing', name: 'Manufacturing Insights', icon: Factory, description: 'RCA/CAPA analysis', color: 'from-indigo-500 to-violet-500' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [status, vehicleList] = await Promise.all([
                apiService.getAgentStatus(),
                apiService.getVehicles()
            ]);
            setAgentStatus(status);
            setVehicles(vehicleList);
            if (vehicleList.length > 0) {
                setSelectedVehicle(vehicleList[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const runWorkflow = async () => {
        if (!selectedVehicle) return;
        
        setActiveWorkflow(selectedVehicle);
        setWorkflowSteps([]);

        // Simulate workflow steps
        const steps = [
            { agent: 'data_analysis', status: 'running', message: 'Analyzing sensor data...' },
            { agent: 'diagnosis', status: 'pending', message: 'Waiting...' },
            { agent: 'customer_engagement', status: 'pending', message: 'Waiting...' },
            { agent: 'scheduling', status: 'pending', message: 'Waiting...' },
            { agent: 'feedback', status: 'pending', message: 'Waiting...' },
        ];
        setWorkflowSteps([...steps]);

        try {
            // Step 1: Analysis
            await new Promise(resolve => setTimeout(resolve, 1000));
            steps[0] = { agent: 'data_analysis', status: 'complete', message: 'Analysis complete' };
            steps[1] = { agent: 'diagnosis', status: 'running', message: 'Diagnosing issues...' };
            setWorkflowSteps([...steps]);

            // Step 2: Diagnosis
            await new Promise(resolve => setTimeout(resolve, 1500));
            steps[1] = { agent: 'diagnosis', status: 'complete', message: 'Diagnosis complete' };
            steps[2] = { agent: 'customer_engagement', status: 'running', message: 'Preparing engagement...' };
            setWorkflowSteps([...steps]);

            // Step 3: Customer Engagement
            await new Promise(resolve => setTimeout(resolve, 1200));
            steps[2] = { agent: 'customer_engagement', status: 'complete', message: 'Engagement ready' };
            steps[3] = { agent: 'scheduling', status: 'running', message: 'Finding slots...' };
            setWorkflowSteps([...steps]);

            // Step 4: Scheduling
            await new Promise(resolve => setTimeout(resolve, 800));
            steps[3] = { agent: 'scheduling', status: 'complete', message: 'Appointment scheduled' };
            steps[4] = { agent: 'feedback', status: 'running', message: 'Initializing feedback...' };
            setWorkflowSteps([...steps]);

            // Step 5: Feedback
            await new Promise(resolve => setTimeout(resolve, 500));
            steps[4] = { agent: 'feedback', status: 'complete', message: 'Feedback loop ready' };
            setWorkflowSteps([...steps]);

            // Now call the real API
            const result = await apiService.orchestrateWorkflow(selectedVehicle);
            console.log('Workflow result:', result);

        } catch (error) {
            console.error('Workflow failed:', error);
        } finally {
            setActiveWorkflow(null);
        }
    };

    const getStepIcon = (status) => {
        switch (status) {
            case 'complete': return <CheckCircle size={16} className="text-green-500" />;
            case 'running': return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading agent status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Agent Orchestration</h2>

            {/* Master Agent */}
            <div className="flex justify-center mb-12">
                <div className="glass-panel p-8 text-center relative">
                    <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-t-xl"></div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
                        <Brain size={48} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Master Agent</h3>
                    <p className="text-gray-400 mb-4">Orchestrates all worker agents</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-green-400 text-sm">Active</span>
                    </div>
                </div>
            </div>

            {/* Worker Agents Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {agents.map((agent) => {
                    const step = workflowSteps.find(s => s.agent === agent.id);
                    const isActive = step?.status === 'running';
                    const isComplete = step?.status === 'complete';

                    return (
                        <div
                            key={agent.id}
                            className={`glass-panel p-6 transition-all ${
                                isActive ? 'border-2 border-primary shadow-[0_0_20px_rgba(0,240,255,0.3)]' :
                                isComplete ? 'border-2 border-green-500/50' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.color}`}>
                                    <agent.icon size={24} className="text-white" />
                                </div>
                                {step && getStepIcon(step.status)}
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-1">{agent.name}</h4>
                            <p className="text-gray-400 text-sm mb-3">{agent.description}</p>
                            {step && (
                                <p className={`text-xs ${
                                    step.status === 'complete' ? 'text-green-400' :
                                    step.status === 'running' ? 'text-primary' : 'text-gray-500'
                                }`}>
                                    {step.message}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Workflow Control */}
            <div className="glass-panel p-6">
                <h4 className="text-xl font-semibold text-white mb-4">Run Maintenance Workflow</h4>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                        disabled={activeWorkflow}
                    >
                        {vehicles.map((v) => (
                            <option key={v.id} value={v.id} className="bg-gray-900">
                                {v.id} - {v.model} ({v.owner})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={runWorkflow}
                        disabled={activeWorkflow || !selectedVehicle}
                        className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                            activeWorkflow
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                        }`}
                    >
                        {activeWorkflow ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play size={20} />
                                Execute Workflow
                            </>
                        )}
                    </button>
                </div>

                {/* Workflow Progress */}
                {workflowSteps.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h5 className="text-white font-medium mb-4">Workflow Progress</h5>
                        <div className="space-y-3">
                            {workflowSteps.map((step, idx) => {
                                const agent = agents.find(a => a.id === step.agent);
                                return (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-8 flex justify-center">
                                            {getStepIcon(step.status)}
                                        </div>
                                        <div className={`flex-1 p-3 rounded-lg ${
                                            step.status === 'complete' ? 'bg-green-500/10' :
                                            step.status === 'running' ? 'bg-primary/10' : 'bg-white/5'
                                        }`}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-medium">{agent?.name}</span>
                                                <span className={`text-xs ${
                                                    step.status === 'complete' ? 'text-green-400' :
                                                    step.status === 'running' ? 'text-primary' : 'text-gray-500'
                                                }`}>
                                                    {step.message}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentOrchestration;
