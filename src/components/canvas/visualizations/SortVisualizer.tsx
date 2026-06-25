import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../../store/useSimulationStore';

const COUNT = 4000;
const GRID_SIZE = 80;

export const SortVisualizer = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const data = useMemo(() => {
    const arr = [];
    for (let i = 0; i < COUNT; i++) {
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;
      
      const x = (col - GRID_SIZE / 2) * 0.4;
      const z = (row - (COUNT / GRID_SIZE) / 2) * 0.4;
      
      const randomHeight = Math.random() * 6 + 0.1;
      const sortedHeight = ((col + row) / (GRID_SIZE * 2)) * 6 + 0.1;
      
      arr.push({
        x, z,
        currentHeight: randomHeight,
        targetHeight: randomHeight,
        randomHeight,
        sortedHeight,
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const isSorting = useSimulationStore.getState().isSorting;
    const time = state.clock.elapsedTime;

    data.forEach((d, i) => {
      d.targetHeight = isSorting ? d.sortedHeight : d.randomHeight;
      d.currentHeight = THREE.MathUtils.lerp(d.currentHeight, d.targetHeight, 0.05);

      let finalHeight = d.currentHeight;
      if (!isSorting) {
        finalHeight += Math.sin(time * 2 + d.x * 0.5 + d.z * 0.5) * 0.5;
        finalHeight = Math.max(0.1, finalHeight);
      }

      dummy.position.set(d.x, finalHeight / 2 - 8, d.z - 5);
      dummy.scale.set(0.3, finalHeight, 0.3);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      color.setHSL((finalHeight / 7) * 0.6 + 0.4, 0.8, 0.5); 
      meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
    
    meshRef.current.rotation.y = Math.sin(time * 0.05) * 0.3;
    meshRef.current.rotation.x = 0.3;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
};
