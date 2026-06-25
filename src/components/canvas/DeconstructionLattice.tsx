import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

export const DeconstructionLattice = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(4, 3), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const scrollProgress = useSimulationStore.getState().scrollProgress;
    const time = state.clock.elapsedTime;

    groupRef.current.rotation.y = time * 0.05;
    groupRef.current.rotation.x = time * 0.025;
    
    const yPos = THREE.MathUtils.lerp(-15, 0, Math.min(scrollProgress * 3.33, 1));
    groupRef.current.position.y = yPos;
    
    const solidOpacity = THREE.MathUtils.lerp(1, 0, Math.max(0, scrollProgress - 0.3) * 3.33);
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = solidOpacity;
      meshRef.current.visible = solidOpacity > 0;
    }

    const scale = THREE.MathUtils.lerp(1, 2.5, Math.max(0, scrollProgress - 0.6) * 2.5);
    groupRef.current.scale.set(scale, scale, scale);
    
    if (wireframeRef.current) {
      const wireOpacity = THREE.MathUtils.lerp(1, 0.1, Math.max(0, scrollProgress - 0.6) * 2.5);
      (wireframeRef.current.material as THREE.LineBasicMaterial).opacity = wireOpacity;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial color="#0B0B0F" transparent />
      </mesh>
      
      <mesh ref={wireframeRef} geometry={geometry}>
        <meshBasicMaterial color="#00FFFF" wireframe transparent opacity={0.6} />
      </mesh>
      
      <points geometry={geometry}>
        <pointsMaterial color="#00FF41" size={0.05} sizeAttenuation transparent opacity={0.8} />
      </points>
    </group>
  );
};
