import { useMemo } from 'react';
import * as THREE from 'three';
import { Physics, RigidBody, InstancedRigidBodies, CuboidCollider } from '@react-three/rapier';
import type { InstancedRigidBodyProps } from '@react-three/rapier';
import { useSimulationStore } from '../../store/useSimulationStore';

export const PhysicsSandbox = () => {
  const { gravity, physicsBounciness, physicsFriction, performanceTier } = useSimulationStore();
  
  const BALL_COUNT = performanceTier === 'high' ? 300 : 100;
  
  const pegs = useMemo(() => {
    const arr = [];
    const rows = 12;
    const spacing = 1.4;
    for (let r = 0; r < rows; r++) {
      const cols = r % 2 === 0 ? 8 : 7;
      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2 + 0.5) * spacing;
        const y = 8 - r * spacing;
        arr.push(new THREE.Vector3(x, y, 0));
      }
    }
    return arr;
  }, []);

  const ballInstances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];
    for (let i = 0; i < BALL_COUNT; i++) {
      instances.push({
        key: 'ball_' + i,
        position: [(Math.random() - 0.5) * 4, 15 + Math.random() * 15, (Math.random() - 0.5) * 0.5],
      });
    }
    return instances;
  }, [BALL_COUNT]);

  const scaledGravity = -9.81 * gravity;

  return (
    <Physics gravity={[0, scaledGravity, 0]} timeStep="vary">
      
      {/* Pegs */}
      {pegs.map((pos, i) => (
        <RigidBody key={i} type="fixed" position={pos} restitution={physicsBounciness} friction={physicsFriction}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 1, 16]} />
            <meshStandardMaterial color="#8A2BE2" />
          </mesh>
        </RigidBody>
      ))}

      {/* Instanced Dynamic Balls */}
      <InstancedRigidBodies
        instances={ballInstances}
        colliders="ball"
        restitution={physicsBounciness}
        friction={physicsFriction}
      >
        <instancedMesh args={[undefined, undefined, BALL_COUNT]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#00FF41" />
        </instancedMesh>
      </InstancedRigidBodies>

      {/* Boundary Colliders */}
      <RigidBody type="fixed" position={[0, -12, 0]} restitution={physicsBounciness}>
        <CuboidCollider args={[20, 1, 5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[-10, 0, 0]} restitution={0.1}>
        <CuboidCollider args={[1, 20, 5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[10, 0, 0]} restitution={0.1}>
        <CuboidCollider args={[1, 20, 5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 0, -1]} restitution={0.1}>
        <CuboidCollider args={[20, 20, 0.5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 0, 1]} restitution={0.1}>
        <CuboidCollider args={[20, 20, 0.5]} />
      </RigidBody>
      
    </Physics>
  );
};
