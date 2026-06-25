import { useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { Link } from 'react-router-dom';

export const SandboxMenu = () => {
  const { gravity, physicsBounciness, physicsFriction, setGravity, setPhysicsBounciness, setPhysicsFriction } = useSimulationStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 bg-obsidian/80 backdrop-blur-md border border-white/20 text-white font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-full z-30"
      >
        {isOpen ? 'Close Engine' : 'Configure Engine'}
      </button>

      <div className={`absolute top-0 left-0 h-full w-full md:w-80 bg-obsidian/90 backdrop-blur-xl border-r border-white/10 p-8 text-white font-mono z-20 overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Link to="/" className="text-white/50 hover:text-white mb-12 block text-xs tracking-widest uppercase transition-colors">
          &larr; Back to Home
        </Link>
        
        <h2 className="text-xl font-bold mb-2 font-sans tracking-tight">The Engine</h2>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-10">Plinko Board Preset</p>
        
        <div className="space-y-8">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-cyan">Gravity</span>
              <span>{gravity.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="-5" max="5" step="0.1" 
              value={gravity} 
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              className="w-full accent-cyan"
            />
            <p className="text-[10px] text-white/30 mt-2">Vertical force applied to all rigid bodies.</p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-matrix">Restitution (Bounciness)</span>
              <span>{physicsBounciness.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="2" step="0.05" 
              value={physicsBounciness} 
              onChange={(e) => setPhysicsBounciness(parseFloat(e.target.value))}
              className="w-full accent-matrix"
            />
            <p className="text-[10px] text-white/30 mt-2">Energy preserved during collisions.</p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-phosphor">Friction</span>
              <span>{physicsFriction.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={physicsFriction} 
              onChange={(e) => setPhysicsFriction(parseFloat(e.target.value))}
              className="w-full accent-phosphor"
            />
            <p className="text-[10px] text-white/30 mt-2">Resistance between sliding surfaces.</p>
          </div>
        </div>
      </div>
    </>
  );
};
