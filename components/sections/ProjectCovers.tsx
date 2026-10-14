'use client';

import type { CoverId } from '@/content/projects';

/**
 * Generated covers, one per project. Section 6 of the brief rules out stock
 * photos: every image on this site is drawn in the site's own blue, so it is
 * relevant, consistent, weightless and license-free.
 *
 * Each is a plain inline SVG with CSS animation. They idle slowly and speed up
 * on hover, and `motion-reduce` stops them entirely. The parent card carries
 * `group`, which is what the hover rules key off.
 */

const BASE = 'h-full w-full';

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 160" className={BASE} role="presentation" focusable="false">
      <defs>
        <linearGradient id="cover-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1A3F" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#02040A" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="cover-glow" cx="50%" cy="45%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill="url(#cover-fade)" />
      <rect width="320" height="160" fill="url(#cover-glow)" />
      {children}
    </svg>
  );
}

/** A pipeline line with gates. A package passes, each gate flashes; one blocks a bad package. */
function GatekeeperCover() {
  const gates = [70, 120, 170, 220];

  return (
    <Frame>
      <line x1="20" y1="80" x2="300" y2="80" stroke="#1E3A8A" strokeWidth="2" />

      {gates.map((x, i) => (
        <g key={x}>
          <rect
            x={x - 3}
            y="56"
            width="6"
            height="48"
            rx="2"
            fill={i === 3 ? '#F59E0B' : '#3B82F6'}
            opacity="0.35"
          >
            <animate
              attributeName="opacity"
              values="0.35;1;0.35"
              dur="4s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
              className="motion-reduce:hidden"
            />
          </rect>
        </g>
      ))}

      {/* The passing package. */}
      <rect x="0" y="72" width="16" height="16" rx="3" fill="#93C5FD">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="20,0; 250,0; 250,0"
          keyTimes="0;0.75;1"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>

      {/* The one that gets stopped at the last gate. */}
      <rect x="0" y="72" width="16" height="16" rx="3" fill="#F59E0B" opacity="0.9">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="20,0; 196,0; 196,0; 20,0"
          keyTimes="0;0.5;0.8;1"
          dur="4s"
          begin="2s"
          repeatCount="indefinite"
        />
      </rect>

      <text x="232" y="128" fill="#F59E0B" fontSize="9" fontFamily="monospace">
        blocked
      </text>
    </Frame>
  );
}

/** Identity nodes linked to a key; a short-lived credential travels a link and fades. */
function NorthbeamCover() {
  const nodes = [
    [70, 48],
    [58, 112],
    [122, 40],
    [118, 120],
    [186, 62],
    [196, 116],
  ];
  const key: [number, number] = [258, 80];

  return (
    <Frame>
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={key[0]} y2={key[1]} stroke="#1E3A8A" strokeWidth="1" />
          <circle cx={x} cy={y} r="4" fill="#3B82F6">
            <animate
              attributeName="opacity"
              values="0.45;1;0.45"
              dur="3.5s"
              begin={`${i * 0.35}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}

      {/* Temporary credential: travels one link, then expires. */}
      <circle r="3.5" fill="#DBEAFE">
        <animateMotion dur="3s" repeatCount="indefinite" path="M70,48 L258,80" />
        <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
      </circle>

      <circle cx={key[0]} cy={key[1]} r="13" fill="none" stroke="#60A5FA" strokeWidth="1.5" />
      <circle cx={key[0]} cy={key[1]} r="5" fill="#60A5FA" />
      <rect x={key[0] + 4} y={key[1] - 1.5} width="18" height="3" rx="1.5" fill="#60A5FA" />
      <rect x={key[0] + 17} y={key[1]} width="3" height="6" rx="1.5" fill="#60A5FA" />
    </Frame>
  );
}

/** Three stacked tiers; traffic flows down and some of it stops at a boundary. */
function VpcCover() {
  const tiers = [
    { y: 34, label: 'public' },
    { y: 74, label: 'app' },
    { y: 114, label: 'data' },
  ];

  return (
    <Frame>
      {tiers.map((tier, i) => (
        <g key={tier.label}>
          <rect
            x="56"
            y={tier.y - 14}
            width="208"
            height="28"
            rx="6"
            fill="#3B82F6"
            opacity={0.08 + i * 0.03}
            stroke="#1E3A8A"
          />
          <text x="66" y={tier.y + 4} fill="#60A5FA" fontSize="9" fontFamily="monospace">
            {tier.label}
          </text>
        </g>
      ))}

      {[110, 150, 190, 230].map((x, i) => (
        <circle key={x} cx={x} r="3" fill="#93C5FD">
          <animate
            attributeName="cy"
            values={i === 3 ? '30;74;74' : '30;118;118'}
            keyTimes="0;0.7;1"
            dur="3.2s"
            begin={`${i * 0.45}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="3.2s"
            begin={`${i * 0.45}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* The boundary that stops one of them. */}
      <line x1="214" y1="92" x2="248" y2="92" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
    </Frame>
  );
}

/** Lock rings close around a document and the text inside turns to ciphertext. */
function DataProtectionCover() {
  return (
    <Frame>
      <rect x="132" y="48" width="56" height="68" rx="4" fill="#0A1A3F" stroke="#3B82F6" />

      {[60, 70, 80, 90, 100].map((y, i) => (
        <g key={y}>
          <rect x="140" y={y} width="40" height="3" rx="1.5" fill="#60A5FA" opacity="0.8">
            <animate
              attributeName="width"
              values="40;12;40"
              dur="4s"
              begin={`${i * 0.2}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0.25;0.8"
              dur="4s"
              begin={`${i * 0.2}s`}
              repeatCount="indefinite"
            />
          </rect>
          <rect x="156" y={y} width="24" height="3" rx="1.5" fill="#93C5FD" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0.9;0"
              dur="4s"
              begin={`${i * 0.2}s`}
              repeatCount="indefinite"
            />
          </rect>
        </g>
      ))}

      {[38, 52, 66].map((r, i) => (
        <circle
          key={r}
          cx="160"
          cy="82"
          r={r}
          fill="none"
          stroke="#2563EB"
          strokeWidth="1"
          strokeDasharray="6 10"
          opacity={0.6 - i * 0.15}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 160 82`}
            to={`${i % 2 === 0 ? 360 : -360} 160 82`}
            dur={`${14 + i * 6}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </Frame>
  );
}

/** A radar sweep over streaming log lines; one blip turns amber. */
function DetectionCover() {
  return (
    <Frame>
      {[44, 62, 80, 98, 116].map((y, i) => (
        <rect key={y} x="26" y={y} height="2.5" rx="1.25" fill="#1E3A8A">
          <animate
            attributeName="width"
            values="40;120;70;120;40"
            dur={`${5 + i}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}

      <g transform="translate(228 80)">
        {[20, 36, 52].map((r) => (
          <circle key={r} r={r} fill="none" stroke="#1E3A8A" strokeWidth="1" />
        ))}

        <path d="M0 0 L52 0 A52 52 0 0 1 36 36 Z" fill="#3B82F6" opacity="0.28">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>

        <circle cx="-18" cy="-24" r="2.5" fill="#60A5FA" />
        <circle cx="26" cy="18" r="2.5" fill="#60A5FA" />

        {/* The alert. */}
        <circle cx="14" cy="-30" r="3.5" fill="#F59E0B">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </Frame>
  );
}

const COVERS: Record<CoverId, () => React.JSX.Element> = {
  gatekeeper: GatekeeperCover,
  'northbeam-lite': NorthbeamCover,
  vpc: VpcCover,
  'data-protection': DataProtectionCover,
  detection: DetectionCover,
};

export function ProjectCover({ id }: { id: CoverId }) {
  const Cover = COVERS[id];
  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[#02040A] motion-reduce:[&_*]:[animation:none!important]">
      <Cover />
    </div>
  );
}
