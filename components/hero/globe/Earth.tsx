'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const DOT_COLOR = new THREE.Color('#3B82F6');
const CITY_COLOR = new THREE.Color('#93C5FD');
const CORE_COLOR = new THREE.Color('#050B1F');
const ATMOSPHERE_COLOR = new THREE.Color('#3B82F6');

/**
 * Round points with size attenuation. A shader rather than a texture, so there
 * is no extra request and no mip blur at small sizes.
 */
function dotMaterial(
  color: THREE.Color,
  size: number,
  opacity: number,
  pixelRatio: number,
  cameraDistance: number,
) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: color },
      uSize: { value: size },
      uOpacity: { value: opacity },
      uPixelRatio: { value: pixelRatio },
      uRefDistance: { value: cameraDistance },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      uniform float uPixelRatio;
      uniform float uRefDistance;
      varying float vFade;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // uSize is the target diameter in CSS pixels at the globe's centre.
        // gl_PointSize is in device pixels, hence the pixel-ratio factor.
        gl_PointSize = uSize * uPixelRatio * (uRefDistance / -mvPosition.z);

        // Dots on the far side dim instead of disappearing, which keeps the
        // sphere readable without drawing a solid silhouette.
        vec3 worldNormal = normalize(mat3(modelMatrix) * position);
        vec3 toCamera = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
        vFade = smoothstep(-0.35, 0.25, dot(worldNormal, toCamera));
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vFade;

      void main() {
        vec2 offset = gl_PointCoord - vec2(0.5);
        float dist = dot(offset, offset);
        if (dist > 0.25) discard;

        float edge = smoothstep(0.25, 0.08, dist);
        gl_FragColor = vec4(uColor, uOpacity * edge * vFade);
      }
    `,
  });
}

/** Fresnel shell. Lights the rim so the edge glows, as in the reference. */
function atmosphereMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: { uColor: { value: ATMOSPHERE_COLOR } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 viewDir = normalize(-vPosition);

        // A tight exponent keeps the glow on the rim. Lower values flood the
        // whole disc and the globe turns into a bright blob.
        float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 6.0);
        gl_FragColor = vec4(uColor, fresnel * 0.55);
      }
    `,
  });
}

/**
 * Soft halo behind the globe. This is the glow the reference has around its
 * planet. Done in-scene rather than as a post-process: a bloom pass over a
 * transparent canvas resolves to an opaque rectangle, which shows up as a
 * visible square against the page background.
 */
function haloMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    uniforms: { uColor: { value: ATMOSPHERE_COLOR } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 viewDir = normalize(-vPosition);
        float edge = 1.0 - abs(dot(vNormal, viewDir));
        float glow = pow(edge, 2.2) * (1.0 - smoothstep(0.55, 1.0, edge));
        gl_FragColor = vec4(uColor, glow * 0.22);
      }
    `,
  });
}

type Props = {
  land: Float32Array;
  city: Float32Array;
  dotSize: number;
};

export function Earth({ land, city, dotSize }: Props) {
  const cityRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, camera } = useThree();

  // Point size is in device pixels, so it has to know the DPR and how far the
  // camera sits, or the dots scale wrongly on retina screens.
  const pixelRatio = Math.min(viewport.dpr, 1.5);
  const cameraDistance = camera.position.length();

  const landGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(land, 3));
    return geometry;
  }, [land]);

  const cityGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(city, 3));
    return geometry;
  }, [city]);

  const landMaterial = useMemo(
    () => dotMaterial(DOT_COLOR, dotSize, 0.9, pixelRatio, cameraDistance),
    [dotSize, pixelRatio, cameraDistance],
  );
  const cityMaterialInstance = useMemo(
    () => dotMaterial(CITY_COLOR, dotSize * 1.7, 1, pixelRatio, cameraDistance),
    [dotSize, pixelRatio, cameraDistance],
  );
  const atmosphere = useMemo(() => atmosphereMaterial(), []);
  const halo = useMemo(() => haloMaterial(), []);

  // Section 4 asks for geometries and materials to be released on unmount.
  // R3F disposes what it created; these were made here, so they are freed here.
  useEffect(
    () => () => {
      landGeometry.dispose();
      cityGeometry.dispose();
      landMaterial.dispose();
      cityMaterialInstance.dispose();
      atmosphere.dispose();
      halo.dispose();
    },
    [landGeometry, cityGeometry, landMaterial, cityMaterialInstance, atmosphere, halo],
  );

  // City lights breathe very slightly so the globe is never completely static.
  useFrame(({ clock }) => {
    if (cityRef.current) {
      cityRef.current.uniforms.uOpacity.value = 0.75 + Math.sin(clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <group>
      {/* Halo first, behind everything, with depth test off. */}
      <mesh material={halo} renderOrder={-1}>
        <sphereGeometry args={[1.38, 32, 32]} />
      </mesh>

      {/* Dark core, just inside the dots, so the far side does not show through. */}
      <mesh>
        <sphereGeometry args={[0.985, 48, 48]} />
        <meshBasicMaterial color={CORE_COLOR} />
      </mesh>

      <points geometry={landGeometry} material={landMaterial} />

      <points geometry={cityGeometry}>
        <primitive object={cityMaterialInstance} ref={cityRef} attach="material" />
      </points>

      <mesh material={atmosphere}>
        <sphereGeometry args={[1.06, 48, 48]} />
      </mesh>
    </group>
  );
}
