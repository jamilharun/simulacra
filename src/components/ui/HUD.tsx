import { useSimulationStore } from '../../store/useSimulationStore';

export const HUD = () => {
  const { gravity, timeDilation, chaosCoefficient, setGravity, setTimeDilation, setChaosCoefficient } = useSimulationStore();

  return (
    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-64 md:w-80 bg-obsidian/40 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6 text-white font-mono z-20">
      <h3 className="text-[10px] md:text-sm text-cyan uppercase tracking-widest mb-4">Parameters</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[10px] md:text-xs mb-1">
            <span>Gravity</span>
            <span>{gravity.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            min="0" max="5" step="0.1" 
            value={gravity} 
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full accent-cyan"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] md:text-xs mb-1">
            <span>Time-Dilation</span>
            <span>{timeDilation.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            min="0.1" max="3" step="0.1" 
            value={timeDilation} 
            onChange={(e) => setTimeDilation(parseFloat(e.target.value))}
            className="w-full accent-matrix"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] md:text-xs mb-1">
            <span>Chaos Coefficient</span>
            <span>{chaosCoefficient.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            min="0" max="2" step="0.05" 
            value={chaosCoefficient} 
            onChange={(e) => setChaosCoefficient(parseFloat(e.target.value))}
            className="w-full accent-phosphor"
          />
        </div>
      </div>
    </div>
  );
};
