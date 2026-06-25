import { useSimulationStore } from '../../store/useSimulationStore';

export const EquationOverlay = () => {
  const scrollProgress = useSimulationStore((state) => state.scrollProgress);
  
  const opacity = Math.max(0, (scrollProgress - 0.7) * 3.33);
  const translateY = 20 - opacity * 20;

  return (
    <div 
      className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center font-mono z-30"
      style={{ opacity, transform: `translateY(${translateY}px)` }}
    >
      <div className="bg-obsidian/60 backdrop-blur-lg border border-white/10 p-8 rounded-xl max-w-xl text-cyan">
        <h2 className="text-xl mb-4 text-white font-sans font-bold">Navier-Stokes Equations</h2>
        <div className="text-sm space-y-4 tracking-wider">
          <p>∂</p>
          <p>-- (ρu) + ∇ · (ρu ⊗ u) = -∇p + ∇ · τ + ρg</p>
          <p>∂t</p>
          <hr className="border-white/10 my-4" />
          <p>∇ · u = 0</p>
        </div>
        <p className="mt-6 text-xs text-white/40 uppercase tracking-widest font-sans">
          The mathematical basis for fluid simulation models, breaking down local interactions into global complexity.
        </p>
      </div>
    </div>
  );
};
