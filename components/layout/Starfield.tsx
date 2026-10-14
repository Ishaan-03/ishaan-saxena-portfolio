/**
 * Faint stars behind everything. The reference's background is not flat black:
 * it carries a scattering of small points that keep the dark areas alive.
 *
 * Inline SVG with positions from a seeded generator, so the markup is identical
 * on the server and the client and there is nothing to hydrate. No JavaScript
 * ships for this.
 */

/** Mulberry32. Small, deterministic, good enough for scattering dots. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { x: number; y: number; r: number; o: number };

function makeStars(count: number, seed: number, maxRadius: number): Star[] {
  const random = seededRandom(seed);
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.round(random() * 1000) / 10,
      y: Math.round(random() * 1000) / 10,
      r: Math.round((0.35 + random() * maxRadius) * 100) / 100,
      o: Math.round((0.18 + random() * 0.55) * 100) / 100,
    });
  }

  return stars;
}

const DIM_STARS = makeStars(190, 20261014, 0.5);
const BRIGHT_STARS = makeStars(26, 7731, 0.9);

export function Starfield() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 size-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Thins the field out behind the globe, where it would compete. */}
        <radialGradient id="star-mask-gradient">
          <stop offset="0%" stopColor="#000" />
          <stop offset="38%" stopColor="#555" />
          <stop offset="100%" stopColor="#fff" />
        </radialGradient>
        <mask id="star-mask">
          <rect width="100" height="100" fill="url(#star-mask-gradient)" />
        </mask>
        <filter id="star-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
      </defs>

      <g mask="url(#star-mask)">
        {DIM_STARS.map((star, index) => (
          <circle
            key={index}
            cx={star.x}
            cy={star.y}
            r={star.r * 0.12}
            fill="#CBD5E1"
            opacity={star.o * 0.6}
          />
        ))}

        {BRIGHT_STARS.map((star, index) => (
          <circle
            key={index}
            cx={star.x}
            cy={star.y}
            r={star.r * 0.16}
            fill="#DBEAFE"
            opacity={star.o}
            filter="url(#star-glow)"
          />
        ))}
      </g>
    </svg>
  );
}
