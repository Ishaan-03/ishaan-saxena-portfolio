'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * The reference's rings are wide, bright and tilted at strong angles, sweeping
 * well past the planet rather than hugging it. They are real 3D circles, so the
 * core sphere occludes whichever half passes behind and the depth reads right.
 */
const RINGS = [
  { radius: 1.32, tilt: [1.15, 0.1, 0.35], speed: 0.07, particles: 2, opacity: 0.95 },
  { radius: 1.52, tilt: [1.38, 0.55, -0.2], speed: -0.05, particles: 2, opacity: 0.8 },
  { radius: 1.78, tilt: [1.02, -0.42, 0.62], speed: 0.04, particles: 1, opacity: 0.6 },
  { radius: 2.05, tilt: [1.3, 0.28, -0.52], speed: -0.03, particles: 1, opacity: 0.42 },
] as const;

const RING_COLOR = new THREE.Color('#5B9BFF');
const PARTICLE_COLOR = new THREE.Color('#DBEAFE');

/**
 * Fades the ring along its own circumference so each one reads as a sweep of
 * light rather than a drawn circle. Vertex alpha, so it costs nothing.
 */
function ringMaterial(opacity: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: RING_COLOR },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      attribute float aAngle;
      varying float vAngle;

      void main() {
        vAngle = aAngle;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAngle;

      void main() {
        // Two bright arcs per revolution, tapering into darkness between them.
        float sweep = pow(abs(sin(vAngle)), 2.5);
        gl_FragColor = vec4(uColor, uOpacity * (0.12 + 0.88 * sweep));
      }
    `,
  });
}

function Ring({ radius, tilt, speed, particles, opacity }: (typeof RINGS)[number]) {
  const particleRefs = useRef<Array<THREE.Mesh | null>>([]);

  const geometry = useMemo(() => {
    const segments = 192;
    const positions = new Float32Array((segments + 1) * 3);
    const angles = new Float32Array(segments + 1);

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
      angles[i] = angle;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
    return geo;
  }, [radius]);

  const material = useMemo(() => ringMaterial(opacity), [opacity]);

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
        <primitive object={material} attach="material" />
      </line>

      {Array.from({ length: particles }).map((_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            particleRefs.current[index] = node;
          }}
        >
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshBasicMaterial
            color={PARTICLE_COLOR}
            toneMapped={false}
            transparent
            blending={THREE.AdditiveBlending}
          />
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
