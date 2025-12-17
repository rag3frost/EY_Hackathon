import React from 'react';
import CarView from './CarView';
import AssistantCard from './AssistantCard';
import RepairHistory from './views/RepairHistory';
import LiveAssistance from './views/LiveAssistance';
import Settings from './views/Settings';
import VehicleFleet from './views/VehicleFleet';
import AgentOrchestration from './views/AgentOrchestration';
import ServiceScheduling from './views/ServiceScheduling';
import ManufacturingInsights from './views/ManufacturingInsights';
import SecurityMonitor from './views/SecurityMonitor';
import VoiceAgent from './views/VoiceAgent';
import ServiceTracker from './views/ServiceTracker';
import DemandForecast from './views/DemandForecast';

const MainContent = ({ activeTab }) => {
    const renderContent = () => {
        switch (activeTab) {
            case 'diagnostics':
                return (
                    <>
                        <CarView />
                        <div className="flex flex-col justify-center">
                            <AssistantCard />
                        </div>
                    </>
                );
            case 'fleet':
                return <VehicleFleet />;
            case 'agents':
                return <AgentOrchestration />;
            case 'voice':
                return <VoiceAgent />;
            case 'scheduling':
                return <ServiceScheduling />;
            case 'tracker':
                return <ServiceTracker />;
            case 'forecast':
                return <DemandForecast />;
            case 'manufacturing':
                return <ManufacturingInsights />;
            case 'security':
                return <SecurityMonitor />;
            case 'history':
                return <RepairHistory />;
            case 'assistance':
                return <LiveAssistance />;
            case 'settings':
                return <Settings />;
            default:
                return null;
        }
    };

    return (
        <main className="flex-1 flex gap-8 p-8 overflow-hidden relative">
            {renderContent()}
        </main>
    );
};

export default MainContent;
