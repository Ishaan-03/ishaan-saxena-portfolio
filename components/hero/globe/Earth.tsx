'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const LAND_COLOR = new THREE.Color('#2F74F0');
const COAST_COLOR = new THREE.Color('#7DB6FF');
const CITY_COLOR = new THREE.Color('#BFDBFE');
const CORE_COLOR = new THREE.Color('#060F26');
const GRID_COLOR = new THREE.Color('#1E3A8A');
const ATMOSPHERE_COLOR = new THREE.Color('#3B82F6');

/**
 * The scene's key light, in object space. The reference lights its globe from
 * the lower left and front, which is what separates the lit limb from the
 * shadowed side and stops the sphere reading flat.
 */
const LIGHT_DIR = new THREE.Vector3(-0.55, -0.25, 0.8).normalize();

/**
 * Round points, lit by LIGHT_DIR and faded on the far side of the sphere.
 * A shader rather than a sprite texture, so there is no extra request.
 */
function dotMaterial(opts: {
  color: THREE.Color;
  size: number;
  opacity: number;
  pixelRatio: number;
  cameraDistance: number;
  /** How much the key light brightens a dot. 0 is flat. */
  lightInfluence: number;
  /** Lifts the whole cloud so unlit dots never vanish completely. */
  ambient: number;
}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: opts.color },
      uSize: { value: opts.size },
      uOpacity: { value: opts.opacity },
      uPixelRatio: { value: opts.pixelRatio },
      uRefDistance: { value: opts.cameraDistance },
      uLightDir: { value: LIGHT_DIR },
      uLightInfluence: { value: opts.lightInfluence },
      uAmbient: { value: opts.ambient },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      uniform float uPixelRatio;
      uniform float uRefDistance;
      uniform vec3 uLightDir;
      uniform float uLightInfluence;
      uniform float uAmbient;

      varying float vFade;
      varying float vLight;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // uSize is the target diameter in CSS pixels at the globe's centre.
        // gl_PointSize is in device pixels, hence the pixel-ratio factor.
        gl_PointSize = uSize * uPixelRatio * (uRefDistance / -mvPosition.z);

        vec3 normal = normalize(position);

        // Dots on the far side dim instead of disappearing, which keeps the
        // sphere readable without drawing a solid silhouette.
        vec3 worldNormal = normalize(mat3(modelMatrix) * position);
        vec3 toCamera = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
        vFade = smoothstep(-0.3, 0.3, dot(worldNormal, toCamera));

        // Key light in object space, so the lit side turns with the globe.
        float lambert = max(dot(normal, uLightDir), 0.0);
        vLight = uAmbient + uLightInfluence * pow(lambert, 0.8);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;

      varying float vFade;
      varying float vLight;

      void main() {
        vec2 offset = gl_PointCoord - vec2(0.5);
        float dist = dot(offset, offset);
        if (dist > 0.25) discard;

        float edge = smoothstep(0.25, 0.06, dist);
        gl_FragColor = vec4(uColor * vLight, uOpacity * edge * vFade);
      }
    `,
  });
}

/**
 * The core sphere, carrying a faint graticule. The reference's mesh runs across
 * the oceans too; drawing it procedurally here costs nothing, where a second
 * point cloud would have doubled the data file.
 */
function coreMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCore: { value: CORE_COLOR },
      uGrid: { value: GRID_COLOR },
      uLightDir: { value: LIGHT_DIR },
    },
    vertexShader: /* glsl */ `
      varying vec3 vObjectNormal;
      varying vec2 vUv;

      void main() {
        vObjectNormal = normalize(position);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uCore;
      uniform vec3 uGrid;
      uniform vec3 uLightDir;

      varying vec3 vObjectNormal;
      varying vec2 vUv;

      // Screen-space derivative keeps the line a constant width however the
      // sphere is angled, instead of smearing near the poles.
      float gridLine(float coord, float spacing) {
        float f = fract(coord / spacing);
        float d = fwidth(coord / spacing);
        return 1.0 - smoothstep(0.0, d * 1.6, min(f, 1.0 - f));
      }

      void main() {
        float lat = gridLine(vUv.y, 1.0 / 18.0);
        float lon = gridLine(vUv.x, 1.0 / 36.0);
        float grid = clamp(lat + lon, 0.0, 1.0);

        // Fade the graticule out near the poles where the columns converge.
        grid *= smoothstep(0.02, 0.16, vUv.y) * smoothstep(0.98, 0.84, vUv.y);

        float lambert = max(dot(vObjectNormal, uLightDir), 0.0);
        vec3 base = uCore * (0.3 + 0.95 * lambert);

        gl_FragColor = vec4(base + uGrid * grid * (0.05 + 0.16 * lambert), 1.0);
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
    uniforms: {
      uColor: { value: ATMOSPHERE_COLOR },
      uLightDir: { value: LIGHT_DIR },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vObjectNormal;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vObjectNormal = normalize(position);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uLightDir;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vObjectNormal;

      void main() {
        vec3 viewDir = normalize(-vPosition);

        // A tight exponent keeps the glow on the rim. Lower values flood the
        // whole disc and the globe turns into a bright blob.
        float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);

        // Brightest where the rim faces the key light, as on the reference.
        // Weighted hard toward the lit side, so the limb glows where the light
        // falls instead of drawing an even ring around the whole disc.
        float lit = 0.12 + 1.25 * pow(max(dot(vObjectNormal, uLightDir), 0.0), 1.4);

        gl_FragColor = vec4(uColor, fresnel * lit * 0.7);
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
    uniforms: {
      uColor: { value: ATMOSPHERE_COLOR },
      uLightDir: { value: LIGHT_DIR },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vObjectNormal;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vObjectNormal = normalize(position);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uLightDir;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vObjectNormal;

      void main() {
        vec3 viewDir = normalize(-vPosition);
        float edge = 1.0 - abs(dot(vNormal, viewDir));

        // Broad and soft: this is the field of light around the planet, not a
        // ring on it. The taper keeps it from hardening into an outline.
        float glow = pow(edge, 1.5) * (1.0 - smoothstep(0.45, 0.98, edge));
        float lit = 0.5 + 0.8 * max(dot(vObjectNormal, uLightDir), 0.0);

        gl_FragColor = vec4(uColor, glow * lit * 0.5);
      }
    `,
  });
}

type Props = {
  land: Float32Array;
  coast: Float32Array;
  city: Float32Array;
  dotSize: number;
};

export function Earth({ land, coast, city, dotSize }: Props) {
  const cityRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, camera } = useThree();

  // Point size is in device pixels, so it has to know the DPR and how far the
  // camera sits, or the dots scale wrongly on retina screens.
  const pixelRatio = Math.min(viewport.dpr, 1.5);
  const cameraDistance = camera.position.length();

  const geometryFor = (points: Float32Array) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    return geometry;
  };

  const landGeometry = useMemo(() => geometryFor(land), [land]);
  const coastGeometry = useMemo(() => geometryFor(coast), [coast]);
  const cityGeometry = useMemo(() => geometryFor(city), [city]);

  const shared = { pixelRatio, cameraDistance };

  const landMaterial = useMemo(
    () =>
      dotMaterial({
        ...shared,
        color: LAND_COLOR,
        size: dotSize,
        opacity: 1,
        lightInfluence: 1.25,
        ambient: 0.62,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dotSize, pixelRatio, cameraDistance],
  );

  const coastMaterial = useMemo(
    () =>
      dotMaterial({
        ...shared,
        color: COAST_COLOR,
        size: dotSize * 1.2,
        opacity: 1,
        lightInfluence: 1.2,
        ambient: 0.85,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dotSize, pixelRatio, cameraDistance],
  );

  const cityMaterialInstance = useMemo(
    () =>
      dotMaterial({
        ...shared,
        color: CITY_COLOR,
        size: dotSize * 2.1,
        opacity: 1,
        lightInfluence: 0.9,
        ambient: 0.8,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dotSize, pixelRatio, cameraDistance],
  );

  const core = useMemo(() => coreMaterial(), []);
  const atmosphere = useMemo(() => atmosphereMaterial(), []);
  const halo = useMemo(() => haloMaterial(), []);

  // Section 4 asks for geometries and materials to be released on unmount.
  // R3F disposes what it created; these were made here, so they are freed here.
  useEffect(() => {
    const disposables = [
      landGeometry,
      coastGeometry,
      cityGeometry,
      landMaterial,
      coastMaterial,
      cityMaterialInstance,
      core,
      atmosphere,
      halo,
    ];
    return () => disposables.forEach((item) => item.dispose());
  }, [
    landGeometry,
    coastGeometry,
    cityGeometry,
    landMaterial,
    coastMaterial,
    cityMaterialInstance,
    core,
    atmosphere,
    halo,
  ]);

  // City lights breathe very slightly so the globe is never completely static.
  useFrame(({ clock }) => {
    if (cityRef.current) {
      cityRef.current.uniforms.uOpacity.value = 0.78 + Math.sin(clock.elapsedTime * 0.8) * 0.22;
    }
  });

  return (
    <group>
      {/*
        Halo first, behind everything, depth test off. Radius has to stay inside
        the camera frustum: anything wider is clipped by the canvas and shows up
        as a hard-edged rectangle. The broad outer glow is CSS, behind the
        canvas, where it can spill past those bounds.
      */}
      <mesh material={halo} renderOrder={-1}>
        <sphereGeometry args={[1.34, 40, 40]} />
      </mesh>

      {/* Core carries the graticule and occludes the far side of the cloud. */}
      <mesh material={core}>
        <sphereGeometry args={[0.988, 96, 64]} />
      </mesh>

      <points geometry={landGeometry} material={landMaterial} />
      <points geometry={coastGeometry} material={coastMaterial} />

      <points geometry={cityGeometry}>
        <primitive object={cityMaterialInstance} ref={cityRef} attach="material" />
      </points>

      <mesh material={atmosphere}>
        <sphereGeometry args={[1.05, 64, 64]} />
      </mesh>
    </group>
  );
}
