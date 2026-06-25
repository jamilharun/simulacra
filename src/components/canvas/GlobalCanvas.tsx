import { Canvas } from '@react-three/fiber';
import { ParticleGrid } from './ParticleGrid';
import { DeconstructionLattice } from './DeconstructionLattice';
import { PhysicsSandbox } from './PhysicsSandbox';
import { SortVisualizer } from './visualizations/SortVisualizer';
import { Environment, PerformanceMonitor } from '@react-three/drei';
import { useSimulationStore } from '../../store/useSimulationStore';

export const GlobalCanvas = () => {
  const currentScene = useSimulationStore((state) => state.currentScene);
  const dpr = useSimulationStore((state) => state.dpr);
  const setDpr = useSimulationStore((state) => state.setDpr);
  const setPerformanceTier = useSimulationStore((state) => state.setPerformanceTier);

  return (
    <div className="absolute inset-0 z-0 bg-obsidian">
      <Canvas camera={{ position: [0, 0, 20], fov: 45 }} dpr={dpr}>
        <PerformanceMonitor 
          onIncline={() => {
            setDpr(2);
            setPerformanceTier('high');
          }} 
          onDecline={() => {
            setDpr(1); // Reduce resolution on frame drop
            setPerformanceTier('low'); // Reduce object count
          }} 
        />
        <color attach="background" args={['#0B0B0F']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        {currentScene === 'home' && (
          <>
            <ParticleGrid />
            <DeconstructionLattice />
          </>
        )}

        {currentScene === 'sandbox' && (
          <PhysicsSandbox />
        )}
        
        {currentScene === 'theory' && (
          <SortVisualizer />
        )}
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
