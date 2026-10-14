import * as THREE from 'three';

/** Places on the globe that mean something on this site. */
export const PLACES = {
  jaipur: { lat: 26.9124, lon: 75.7873 },
  paris: { lat: 48.8566, lon: 2.3522 },
  stockholm: { lat: 59.3293, lon: 18.0686 },
} as const;

export type PlaceKey = keyof typeof PLACES;

/** Same projection the build-time dot script uses. They must agree. */
export function latLonToVec3(lat: number, lon: number, radius = 1) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Great-circle-ish arc between two points, bowed outward so it reads as a
 * flight path rather than a chord through the planet. Height scales with
 * distance, so short hops stay low.
 */
export function arcBetween(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  radius = 1,
  segments = 64,
) {
  const start = latLonToVec3(from.lat, from.lon, radius);
  const end = latLonToVec3(to.lat, to.lon, radius);

  const angle = start.angleTo(end);
  const lift = 1 + angle * 0.32;

  const mid = start
    .clone()
    .add(end)
    .normalize()
    .multiplyScalar(radius * lift);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

  return curve.getPoints(segments);
}

/** Decodes public/globe/dots.bin. See scripts/generate-globe-dots.ts. */
export function decodeDots(buffer: ArrayBuffer) {
  const header = new DataView(buffer);
  const landCount = header.getUint16(0, true);
  const coastCount = header.getUint16(2, true);
  const cityCount = header.getUint16(4, true);

  const values = new Int16Array(buffer, 6, (landCount + coastCount + cityCount) * 3);

  const toFloats = (source: Int16Array) => {
    const out = new Float32Array(source.length);
    for (let i = 0; i < source.length; i++) out[i] = source[i] / 32767;
    return out;
  };

  const landEnd = landCount * 3;
  const coastEnd = landEnd + coastCount * 3;

  return {
    land: toFloats(values.subarray(0, landEnd)),
    coast: toFloats(values.subarray(landEnd, coastEnd)),
    city: toFloats(values.subarray(coastEnd)),
  };
}

/**
 * Keeps every nth dot. Used on phones and low-power devices, where the brief
 * asks for fewer dots rather than a different asset.
 */
export function thinOut(points: Float32Array, keepEvery: number) {
  if (keepEvery <= 1) return points;

  const count = Math.floor(points.length / 3 / keepEvery);
  const out = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const from = i * keepEvery * 3;
    out[i * 3] = points[from];
    out[i * 3 + 1] = points[from + 1];
    out[i * 3 + 2] = points[from + 2];
  }

  return out;
}
