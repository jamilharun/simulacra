import { useSimulationStore } from '../../store/useSimulationStore';

export const HeroOverlay = () => {
  const scrollProgress = useSimulationStore((state) => state.scrollProgress);
  const opacity = Math.max(0, 1 - scrollProgress * 5);

  return (
    <div 
      className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10"
      style={{ opacity }}
    >
      <h1 className="text-[8vw] font-bold text-white tracking-tighter leading-none mix-blend-difference">
        REALITY, <br/>
        <span className="text-cyan">PROGRAMMED.</span>
      </h1>
      <p className="mt-8 text-white/50 font-mono text-sm uppercase tracking-widest max-w-md text-center">
        An interactive exploration into the art, science, and philosophy of simulation.
      </p>
    </div>
  );
};
