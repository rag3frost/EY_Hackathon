import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';

const Layout = () => {
    const [activeTab, setActiveTab] = useState('diagnostics');

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30 selection:text-white">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 flex flex-col relative">
                {/* Background Glows */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"></div>
                </div>

                <Header />
                <MainContent activeTab={activeTab} />
            </div>
        </div>
    );
};

export default Layout;
