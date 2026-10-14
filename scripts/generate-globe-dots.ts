/**
 * Build-time only. Turns Natural Earth land polygons into the dot cloud the
 * globe renders, so no geographic data or parsing ships to the browser.
 *
 * Output: public/globe/dots.bin, a small binary the globe fetches in parallel
 * with its own JS chunk. Keeping it out of the bundle matters because the hero
 * text has to be the LCP element, not the canvas.
 *
 * Layout (little-endian):
 *   u16 landCount
 *   u16 cityCount
 *   i16 * 3 * landCount   unit-sphere xyz, scaled by 32767
 *   i16 * 3 * cityCount   same
 *
 * Run with: npm run globe:dots
 *
 * world-atlas, topojson-client and d3-geo are devDependencies used only here.
 * They are never imported by the app.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { geoContains } from 'd3-geo';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';

const require = createRequire(import.meta.url);

/** Fibonacci sphere: even coverage without clustering at the poles. */
function fibonacciSphere(count: number) {
  const points: Array<{ lat: number; lon: number }> = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;

    points.push({
      lat: (Math.asin(y) * 180) / Math.PI,
      lon: (Math.atan2(Math.sin(theta) * radius, Math.cos(theta) * radius) * 180) / Math.PI,
    });
  }

  return points;
}

function latLonToVec3(lat: number, lon: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return [-Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
}

// 110m is the coarsest Natural Earth set, which is what we want: the dots end up
// 2px on screen, so finer coastlines would cost bytes for nothing.
const topology = require('world-atlas/land-110m.json') as Topology;
const land = topojson.feature(topology, topology.objects.land) as unknown as FeatureCollection<
  Polygon | MultiPolygon
>;

// ~7k land dots reads as a solid continent shape at this size without the cloud
// turning into a blob.
const SAMPLES = 26_000;

const landDots: number[] = [];
for (const { lat, lon } of fibonacciSphere(SAMPLES)) {
  // Antarctica reads as a white smear at this dot size and adds nothing.
  if (lat < -60) continue;

  if (land.features.some((feature) => geoContains(feature, [lon, lat]))) {
    landDots.push(...latLonToVec3(lat, lon));
  }
}

// A scattering of brighter dots spread through the land set rather than
// clustered, standing in for city lights.
const cityDots: number[] = [];
const landCount = landDots.length / 3;
const CITY_COUNT = 240;
const stride = Math.floor(landCount / CITY_COUNT);

for (let i = 0; i < CITY_COUNT; i++) {
  const index = ((i * stride + i * 7) % landCount) * 3;
  cityDots.push(landDots[index], landDots[index + 1], landDots[index + 2]);
}

const buffer = Buffer.alloc(4 + (landDots.length + cityDots.length) * 2);
buffer.writeUInt16LE(landCount, 0);
buffer.writeUInt16LE(CITY_COUNT, 2);

let offset = 4;
for (const value of [...landDots, ...cityDots]) {
  buffer.writeInt16LE(Math.round(value * 32767), offset);
  offset += 2;
}

mkdirSync('public/globe', { recursive: true });
writeFileSync('public/globe/dots.bin', buffer);

console.log(
  `public/globe/dots.bin: ${landCount} land dots, ${CITY_COUNT} city dots, ${(buffer.length / 1024).toFixed(1)} KB`,
);
