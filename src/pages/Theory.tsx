import { useEffect } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';

export const Theory = () => {
  const setCurrentScene = useSimulationStore((state) => state.setCurrentScene);
  const { isSorting, setIsSorting } = useSimulationStore();

  useEffect(() => {
    setCurrentScene('theory');
  }, [setCurrentScene]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-y-auto w-full h-full">
      <div className="pointer-events-auto max-w-4xl mx-auto pt-40 pb-20 px-8 text-white relative z-10">
        
        <header className="mb-20">
          <h1 className="text-5xl font-bold tracking-tighter mb-4 font-sans">The Ledger.</h1>
          <p className="text-white/50 font-mono tracking-widest uppercase text-sm">Data Architecture & Algorithmic Efficiency</p>
        </header>

        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-cyan font-sans">Monte Carlo Methods</h2>
          <p className="text-white/70 leading-relaxed font-sans text-lg mb-6">
            In complex systems where deterministic calculation is impossible, we rely on stochastic randomness to model probability. By running a simulation thousands of times with random inputs, a bell curve of likely outcomes emerges from the noise.
          </p>
          <div className="p-6 bg-obsidian/60 backdrop-blur-md border border-white/10 rounded-lg font-mono text-xs text-white/50">
            {`// Pseudocode: Simple Monte Carlo Pi Estimation
let insideCircle = 0;
for (let i = 0; i < N; i++) {
  const x = Math.random();
  const y = Math.random();
  if (x*x + y*y <= 1) insideCircle++;
}
const pi = 4 * (insideCircle / N);`}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-matrix font-sans">Live Data Visualization</h2>
          <p className="text-white/70 leading-relaxed font-sans text-lg mb-6">
            Below is a real-time WebGL representation of algorithmic efficiency. When triggered, the engine will physically sort 4,000 instanced blocks using a simulated sorting algorithm, demonstrating the sheer computational bandwidth required for macroscopic state changes.
          </p>
          <button 
            onClick={() => setIsSorting(!isSorting)}
            className={`font-mono text-sm uppercase tracking-widest px-6 py-3 rounded border transition-colors cursor-pointer ${
              isSorting ? 'bg-matrix/20 border-matrix text-matrix' : 'bg-obsidian/40 backdrop-blur-md border-white/30 text-white hover:border-white'
            }`}
          >
            {isSorting ? 'Reset Dataset' : 'Execute Sorting Sequence'}
          </button>
        </section>

        <div style={{ height: '60vh' }}></div>

      </div>
    </div>
  );
};
