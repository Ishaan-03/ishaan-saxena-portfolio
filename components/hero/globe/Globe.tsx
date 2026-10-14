'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Arc } from './Arc';
import { Earth } from './Earth';
import { decodeDots, thinOut } from './geo';
import { Orbits } from './Orbits';

type Markers = { paris: string; stockholm: string };
type Dots = { land: Float32Array; coast: Float32Array; city: Float32Array };

/** One turn every 90 seconds, per section 4. */
const ROTATION_PER_SECOND = (Math.PI * 2) / 90;
const MAX_TILT = (6 * Math.PI) / 180;

function Scene({
  land,
  coast,
  city,
  dotSize,
  animate,
  tiltFromMouse,
  markers,
}: Dots & {
  dotSize: number;
  animate: boolean;
  tiltFromMouse: boolean;
  markers: Markers;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (animate) {
      spin.current += delta * ROTATION_PER_SECOND;
      group.current.rotation.y = spin.current;
    }

    if (tiltFromMouse) {
      const targetX = state.pointer.y * MAX_TILT;
      const targetZ = -state.pointer.x * MAX_TILT;
      group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
      group.current.rotation.z += (targetZ - group.current.rotation.z) * 0.04;
    }
  });

  return (
    <group ref={group} rotation={[0.25, 0, 0.1]}>
      <Earth land={land} coast={coast} city={city} dotSize={dotSize} />
      <Orbits />
      <Arc animate={animate} markers={markers} />
    </group>
  );
}

/** Renders a single frame then stops. Used for prefers-reduced-motion. */
function RenderOnce() {
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
  }, [invalidate]);
  return null;
}

export default function Globe({ markers }: { markers: Markers }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<Dots | null>(null);
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  // Phones and low-core machines get fewer dots and no bloom, per section 4.
  const lowPower = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    return coarse || fewCores;
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch('/globe/dots.bin')
      .then((response) => {
        if (!response.ok) throw new Error(`dots.bin: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (cancelled) return;
        const decoded = decodeDots(buffer);
        setDots(
          lowPower
            ? {
                land: thinOut(decoded.land, 2),
                coast: thinOut(decoded.coast, 2),
                city: thinOut(decoded.city, 2),
              }
            : decoded,
        );
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [lowPower]);

  // Stop rendering when the hero scrolls away.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '100px',
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  if (failed) return <GlobeFallback />;

  return (
    <div ref={hostRef} className="absolute inset-0">
      {dots && (
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: !lowPower,
            powerPreference: 'high-performance',
            alpha: true,
            // The palette is authored in final colours; ACES lifts the dark blues.
            toneMapping: THREE.NoToneMapping,
          }}
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          frameloop={reducedMotion ? 'demand' : visible ? 'always' : 'never'}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          // The canvas is decoration. The hero text carries the meaning.
          aria-hidden
          style={{ pointerEvents: 'auto' }}
        >
          <Scene
            land={dots.land}
            coast={dots.coast}
            city={dots.city}
            dotSize={lowPower ? 2.4 : 2.0}
            animate={!reducedMotion}
            tiltFromMouse={!lowPower && !reducedMotion}
            markers={markers}
          />

          {reducedMotion && <RenderOnce />}
        </Canvas>
      )}
    </div>
  );
}

/**
 * Shown when WebGL is unavailable or the dot file fails to load. A CSS glow
 * with a dot ring, so there is still something in the space the globe owns.
 */
export function GlobeFallback() {
  return (
    <div aria-hidden className="absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square w-[min(78%,520px)]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.45),rgba(37,99,235,0.12)_45%,transparent_70%)]" />
        <div className="absolute inset-[12%] rounded-full border border-[rgba(96,165,250,0.25)]" />
        <div className="absolute inset-[4%] rotate-[18deg] rounded-full border border-[rgba(96,165,250,0.14)]" />
        <div
          className="absolute inset-[12%] rounded-full opacity-60"
          style={{
            backgroundImage: 'radial-gradient(rgba(59,130,246,0.55) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
            maskImage: 'radial-gradient(circle at 50% 50%, #000 55%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 55%, transparent 72%)',
          }}
        />
      </div>
    </div>
  );
}
