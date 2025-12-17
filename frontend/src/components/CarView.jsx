import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PresentationControls, useGLTF, Html, useProgress } from '@react-three/drei';
import { RotateCw, ZoomIn, MousePointer2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Model = (props) => {
    const { scene } = useGLTF('/models/car.glb');
    return <primitive object={scene} {...props} />;
};

// Preload the model
useGLTF.preload('/models/car.glb');

const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-white font-medium text-sm">{progress.toFixed(0)}%</span>
            </div>
        </Html>
    );
};

const CarView = () => {
    const { user } = useAuth();
    const carModel = user?.carModel || 'sedan';

    return (
        <div className="flex-1 relative flex flex-col items-center justify-center min-h-[600px]">
            {/* 3D Canvas */}
            <div className="relative w-full h-full absolute inset-0">
                <Canvas shadows camera={{ position: [4, 2, 5], fov: 45 }}>
                    <color attach="background" args={['#0a0a0a']} />
                    {/* Fog to blend with background */}
                    <fog attach="fog" args={['#0a0a0a', 5, 20]} />

                    <Suspense fallback={<Loader />}>
                        <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
                            <Stage environment="city" intensity={0.6} contactShadow={false}>
                                <Model scale={0.01} carModel={carModel} />
                            </Stage>
                        </PresentationControls>
                    </Suspense>

                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#00f0ff" />
                </Canvas>

                {/* Overlay Gradients for seamless integration */}
                <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-background/80"></div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-8 pb-8 z-10">
                <ControlBtn icon={RotateCw} label="Rotate" active />
                <ControlBtn icon={ZoomIn} label="Zoom" />
                <ControlBtn icon={MousePointer2} label="Select Part" />
            </div>
        </div>
    );
};

const ControlBtn = ({ icon: Icon, label, active }) => (
    <button className="flex flex-col items-center gap-3 group">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 ${active
            ? 'bg-black/50 border-primary text-primary shadow-[0_0_20px_rgba(0,240,255,0.3)]'
            : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
            }`}>
            <Icon size={24} />
        </div>
        <span className={`text-xs font-medium transition-colors ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
            }`}>
            {label}
        </span>
    </button>
);

export default CarView;
