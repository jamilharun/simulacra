import { useEffect } from 'react';
import { HeroOverlay } from '../components/ui/HeroOverlay';
import { HUD } from '../components/ui/HUD';
import { ScrollManager } from '../components/scroll/ScrollManager';
import { EquationOverlay } from '../components/ui/EquationOverlay';
import { useSimulationStore } from '../store/useSimulationStore';
import { Link } from 'react-router-dom';

export const Home = () => {
  const setCurrentScene = useSimulationStore((state) => state.setCurrentScene);

  useEffect(() => {
    setCurrentScene('home');
  }, [setCurrentScene]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-20">
        <HeroOverlay />
        <EquationOverlay />
      </div>
      
      <div className="fixed inset-0 pointer-events-none z-20">
        <div className="pointer-events-auto">
          <HUD />
          <Link 
            to="/sandbox" 
            className="absolute top-8 right-8 text-cyan hover:text-white font-mono text-sm uppercase tracking-widest border border-cyan/30 hover:border-white px-4 py-2 rounded transition-colors bg-obsidian/40 backdrop-blur-md"
          >
            Enter Sandbox &rarr;
          </Link>
        </div>
      </div>

      <ScrollManager />
    </>
  );
};
