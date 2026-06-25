import { useEffect } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';

export const About = () => {
  const setCurrentScene = useSimulationStore((state) => state.setCurrentScene);

  useEffect(() => {
    setCurrentScene('about');
  }, [setCurrentScene]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-y-auto w-full h-full flex items-center justify-center">
      <div className="pointer-events-auto max-w-2xl mx-auto px-8 text-white mt-20 mb-20">
        
        <div className="bg-obsidian/80 backdrop-blur-xl border border-white/10 p-12 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold tracking-tighter mb-2 font-sans text-phosphor">The Manifesto</h1>
          <p className="text-white/50 font-mono tracking-widest uppercase text-xs mb-10">SIMULACRA Research Collective</p>
          
          <div className="space-y-6 text-sm text-white/70 font-sans leading-relaxed">
            <p>
              SIMULACRA was built to bridge the gap between static web design and high-performance software engineering. We believe the browser is a canvas capable of rendering complex, interactive physics environments that rival native desktop applications.
            </p>
            <p>
              By decoupling the UI layer from the WebGL graphics layer, we ensure that DOM updates do not interrupt the 60 FPS physics loop.
            </p>
            
            <h3 className="text-white font-mono uppercase tracking-widest text-xs mt-8 mb-4 border-b border-white/10 pb-2">Technical Architecture</h3>
            <ul className="list-disc pl-4 space-y-2 font-mono text-xs text-white/60">
              <li><span className="text-cyan">Graphics:</span> React Three Fiber & Three.js</li>
              <li><span className="text-matrix">Physics:</span> Rapier (WebAssembly compiled Rust)</li>
              <li><span className="text-phosphor">State:</span> Zustand (Transient Frame Updates)</li>
              <li><span className="text-white">Styling:</span> Tailwind CSS v4 & GSAP ScrollTrigger</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
