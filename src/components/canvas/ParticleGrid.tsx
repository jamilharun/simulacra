import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

export const ParticleGrid = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const performanceTier = useSimulationStore((state) => state.performanceTier);
  
  const PARTICLE_COUNT = performanceTier === 'high' ? 5000 : 1500;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05
      );
      temp.push({ position: new THREE.Vector3(x, y, z), velocity, basePosition: new THREE.Vector3(x, y, z) });
    }
    return temp;
  }, [PARTICLE_COUNT]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const { gravity, timeDilation, chaosCoefficient } = useSimulationStore.getState();
    const mouse = new THREE.Vector3(
      (state.pointer.x * state.viewport.width) / 2,
      (state.pointer.y * state.viewport.height) / 2,
      0
    );

    particles.forEach((particle, i) => {
      const dt = 0.016 * timeDilation;
      
      const distToMouse = particle.position.distanceTo(mouse);
      const forceDirection = mouse.clone().sub(particle.position).normalize();
      
      if (distToMouse < 15) {
        particle.velocity.add(forceDirection.multiplyScalar(0.01 * gravity * dt * 60));
      } else {
        const returnDir = particle.basePosition.clone().sub(particle.position).normalize();
        particle.velocity.add(returnDir.multiplyScalar(0.002 * dt * 60));
      }

      particle.velocity.x += (Math.sin(time * 2 + i) * 0.01 * chaosCoefficient) * dt * 60;
      particle.velocity.y += (Math.cos(time * 2 + i) * 0.01 * chaosCoefficient) * dt * 60;
      
      particle.velocity.multiplyScalar(0.95);

      particle.position.add(particle.velocity);

      dummy.position.copy(particle.position);
      
      const scale = 1 + Math.sin(time * 5 + i) * 0.2;
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <icosahedronGeometry args={[0.05, 1]} />
      <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
    </instancedMesh>
  );
};
