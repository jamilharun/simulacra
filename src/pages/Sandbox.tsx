import { useEffect } from 'react';
import { SandboxMenu } from '../components/ui/SandboxMenu';
import { useSimulationStore } from '../store/useSimulationStore';

export const Sandbox = () => {
  const setCurrentScene = useSimulationStore((state) => state.setCurrentScene);

  useEffect(() => {
    setCurrentScene('sandbox');
  }, [setCurrentScene]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      <div className="pointer-events-auto h-full">
        <SandboxMenu />
      </div>
    </div>
  );
};
