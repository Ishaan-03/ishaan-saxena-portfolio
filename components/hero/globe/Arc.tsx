'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { arcBetween, latLonToVec3, PLACES } from './geo';

const ARC_COLOR = new THREE.Color('#60A5FA');
const PULSE_COLOR = new THREE.Color('#DBEAFE');
const MARKER_COLOR = new THREE.Color('#93C5FD');

/** Jaipur to Paris. His own path, and the reason the globe is here at all. */
function TravelArc({ animate }: { animate: boolean }) {
  const pulseRef = useRef<THREE.Mesh>(null);

  const points = useMemo(() => arcBetween(PLACES.jaipur, PLACES.paris, 1.01, 96), []);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  useFrame(({ clock }) => {
    if (!pulseRef.current || !animate) return;

    // Travel, then pause at the far end before looping, so it reads as a
    // journey rather than a spinning bead.
    const cycle = (clock.elapsedTime % 5) / 3.4;
    const t = Math.min(cycle, 1);

    pulseRef.current.position.copy(curve.getPointAt(t));
    const material = pulseRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = cycle > 1 ? 0 : 1;
  });

  return (
    <group>
      <line>
        <primitive object={geometry} attach="geometry" />
        <lineBasicMaterial color={ARC_COLOR} transparent opacity={0.55} />
      </line>

      <mesh ref={pulseRef} position={points[0]}>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshBasicMaterial color={PULSE_COLOR} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

type MarkerProps = {
  lat: number;
  lon: number;
  label: string;
  caption: string;
};

/** A labelled point. Tooltip on hover, and on tap for touch. */
function Marker({ lat, lon, label, caption }: MarkerProps) {
  const [open, setOpen] = useState(false);
  const position = useMemo(() => latLonToVec3(lat, lon, 1.015), [lat, lon]);

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => setOpen(true)}
        onPointerOut={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Generous invisible hit area; the visible dot stays small. */}
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color={MARKER_COLOR} toneMapped={false} />
      </mesh>

      {/*
        Tooltip only on hover or tap, per section 4. A permanently visible label
        drifts across the hero buttons as the globe turns.
      */}
      {open && (
        <Html center distanceFactor={7} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="-translate-y-8 text-center whitespace-nowrap">
            <span className="glass block rounded-md px-2 py-1.5">
              <span className="block font-mono text-[9px] tracking-wider text-[var(--accent-2)] uppercase">
                {label}
              </span>
              <span className="mt-0.5 block text-[10px] text-[var(--text)]">{caption}</span>
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export function Arc({
  animate,
  markers,
}: {
  animate: boolean;
  markers: { paris: string; stockholm: string };
}) {
  return (
    <group>
      <TravelArc animate={animate} />
      <Marker {...PLACES.paris} label="Paris" caption={markers.paris} />
      <Marker {...PLACES.stockholm} label="Stockholm" caption={markers.stockholm} />
    </group>
  );
}
