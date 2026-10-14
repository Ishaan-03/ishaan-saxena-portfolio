'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Three thin tilted rings. They are real 3D circles, so the part behind the
 * globe is occluded by the core sphere and the depth reads correctly.
 */
const RINGS = [
  { radius: 1.45, tilt: [0.42, 0, 0.18], speed: 0.13, particles: 2 },
  { radius: 1.68, tilt: [-0.3, 0.5, -0.24], speed: -0.09, particles: 1 },
  { radius: 1.92, tilt: [0.62, -0.25, 0.4], speed: 0.06, particles: 2 },
] as const;

const RING_COLOR = new THREE.Color('#2563EB');
const PARTICLE_COLOR = new THREE.Color('#93C5FD');

function Ring({ radius, tilt, speed, particles }: (typeof RINGS)[number]) {
  const particleRefs = useRef<Array<THREE.Mesh | null>>([]);

  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(128).map((p) => new THREE.Vector3(p.x, p.y, 0));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  useFrame(({ clock }) => {
    particleRefs.current.forEach((mesh, index) => {
      if (!mesh) return;

      const offset = (index / particles) * Math.PI * 2;
      const angle = clock.elapsedTime * speed * Math.PI * 2 + offset;

      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    });
  });

  return (
    <group rotation={tilt as unknown as THREE.Euler}>
      <line>
        <primitive object={geometry} attach="geometry" />
        <lineBasicMaterial color={RING_COLOR} transparent opacity={0.28} />
      </line>

      {Array.from({ length: particles }).map((_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            particleRefs.current[index] = node;
          }}
        >
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshBasicMaterial color={PARTICLE_COLOR} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Orbits() {
  return (
    <group>
      {RINGS.map((ring) => (
        <Ring key={ring.radius} {...ring} />
      ))}
    </group>
  );
}
