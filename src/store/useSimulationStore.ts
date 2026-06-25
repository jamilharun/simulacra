import { create } from 'zustand'

interface SimulationState {
  currentScene: 'home' | 'sandbox' | 'theory' | 'about';
  gravity: number;
  timeDilation: number;
  chaosCoefficient: number;
  scrollProgress: number;
  physicsBounciness: number;
  physicsFriction: number;
  isSorting: boolean;
  dpr: number;
  performanceTier: 'high' | 'low';
  setCurrentScene: (scene: 'home' | 'sandbox' | 'theory' | 'about') => void;
  setGravity: (val: number) => void;
  setTimeDilation: (val: number) => void;
  setChaosCoefficient: (val: number) => void;
  setScrollProgress: (val: number) => void;
  setPhysicsBounciness: (val: number) => void;
  setPhysicsFriction: (val: number) => void;
  setIsSorting: (val: boolean) => void;
  setDpr: (val: number) => void;
  setPerformanceTier: (val: 'high' | 'low') => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentScene: 'home',
  gravity: 1.0,
  timeDilation: 1.0,
  chaosCoefficient: 0.5,
  scrollProgress: 0,
  physicsBounciness: 0.6,
  physicsFriction: 0.1,
  isSorting: false,
  dpr: 2,
  performanceTier: 'high',
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setGravity: (val) => set({ gravity: val }),
  setTimeDilation: (val) => set({ timeDilation: val }),
  setChaosCoefficient: (val) => set({ chaosCoefficient: val }),
  setScrollProgress: (val) => set({ scrollProgress: val }),
  setPhysicsBounciness: (val) => set({ physicsBounciness: val }),
  setPhysicsFriction: (val) => set({ physicsFriction: val }),
  setIsSorting: (val) => set({ isSorting: val }),
  setDpr: (val) => set({ dpr: val }),
  setPerformanceTier: (val) => set({ performanceTier: val }),
}));
