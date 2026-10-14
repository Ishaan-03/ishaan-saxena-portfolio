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
 *   u16 coastCount
 *   u16 cityCount
 *   i16 * 3 * each, in that order: unit-sphere xyz scaled by 32767
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

/**
 * Uniform latitude/longitude grid. The reference globe is clearly a graticule
 * mesh, not an even scatter: rows run visibly horizontal and the dots bunch
 * toward the pole. A Fibonacci sphere spreads evenly and loses that texture.
 */
function latLonGrid(stepDeg: number) {
  const points: Array<{ lat: number; lon: number }> = [];

  for (let lat = -58; lat <= 84; lat += stepDeg) {
    for (let lon = -180; lon < 180; lon += stepDeg) {
      points.push({ lat, lon });
    }
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

// 1.15 degrees gives a mesh fine enough to read as continents at hero size
// while the individual rows stay visible, which is what the reference shows.
const STEP = 1.15;

const landDots: number[] = [];
const coastDots: number[] = [];

const isLand = (lat: number, lon: number) =>
  land.features.some((feature) => geoContains(feature, [lon, lat]));

for (const { lat, lon } of latLonGrid(STEP)) {
  if (!isLand(lat, lon)) continue;

  // A point with a non-land neighbour is on a coastline. The reference lights
  // those edges brightly, which is what makes the continents legible.
  const onCoast =
    !isLand(lat + STEP, lon) ||
    !isLand(lat - STEP, lon) ||
    !isLand(lat, lon + STEP) ||
    !isLand(lat, lon - STEP);

  const vec = latLonToVec3(lat, lon);
  if (onCoast) coastDots.push(...vec);
  else landDots.push(...vec);
}

// A scattering of brighter dots spread through the land set rather than
// clustered, standing in for city lights.
const cityDots: number[] = [];
const landCount = landDots.length / 3;
const CITY_COUNT = 420;
const stride = Math.floor(landCount / CITY_COUNT);

for (let i = 0; i < CITY_COUNT; i++) {
  const index = ((i * stride + i * 7) % landCount) * 3;
  cityDots.push(landDots[index], landDots[index + 1], landDots[index + 2]);
}

const coastCount = coastDots.length / 3;

const buffer = Buffer.alloc(6 + (landDots.length + coastDots.length + cityDots.length) * 2);
buffer.writeUInt16LE(landCount, 0);
buffer.writeUInt16LE(coastCount, 2);
buffer.writeUInt16LE(CITY_COUNT, 4);

let offset = 6;
for (const value of [...landDots, ...coastDots, ...cityDots]) {
  buffer.writeInt16LE(Math.round(value * 32767), offset);
  offset += 2;
}

mkdirSync('public/globe', { recursive: true });
writeFileSync('public/globe/dots.bin', buffer);

console.log(
  `public/globe/dots.bin: ${landCount} land, ${coastCount} coast, ${CITY_COUNT} city, ${(buffer.length / 1024).toFixed(1)} KB`,
);
