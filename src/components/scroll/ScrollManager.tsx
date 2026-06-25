import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSimulationStore } from '../../store/useSimulationStore';

gsap.registerPlugin(ScrollTrigger);

export const ScrollManager = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const setScrollProgress = useSimulationStore.getState().setScrollProgress;

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10 w-full" style={{ height: '400vh' }}>
      {/* Invisible spacer div to create native scroll bar */}
    </div>
  );
};
