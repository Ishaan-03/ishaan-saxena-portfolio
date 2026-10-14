import type { CoverId } from '@/content/projects';

/**
 * The main architecture of each project, redrawn in the site's own style.
 * Section 3 of the brief: do not embed Mermaid. These are hand-drawn SVG, so
 * they match the palette, stay crisp at any size and cost one request of zero.
 *
 * Each is a faithful simplification of the diagram in that repo's README.
 */

const BOX = 'fill-[#0A1A3F] stroke-[#1E3A8A]';
const LABEL = 'fill-[#F1F5F9] text-[11px]';
const MUTED = 'fill-[#94A3B8] text-[9px]';
const ARROW = 'stroke-[#3B82F6]';

function Shell({ children, height = 300 }: { children: React.ReactNode; height?: number }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl p-5">
      <svg
        viewBox={`0 0 640 ${height}`}
        className="h-auto w-full min-w-[520px]"
        role="img"
        aria-hidden
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" className="fill-[#3B82F6]" />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  );
}

function Node({
  x,
  y,
  w = 120,
  h = 42,
  title,
  sub,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  sub?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" className={BOX} strokeWidth="1" />
      <text x={x + w / 2} y={sub ? y + 18 : y + h / 2 + 4} textAnchor="middle" className={LABEL}>
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 31} textAnchor="middle" className={MUTED}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ d }: { d: string }) {
  return <path d={d} className={ARROW} strokeWidth="1.2" fill="none" markerEnd="url(#arrow)" />;
}

function GatekeeperDiagram() {
  return (
    <Shell height={270}>
      <Node x={16} y={110} w={110} title="Laptop" sub="pre-commit gitleaks" />
      <Arrow d="M130 131 L168 131" />

      <rect
        x={172}
        y={28}
        width={286}
        height={210}
        rx="12"
        className="fill-[#060F26] stroke-[#1E3A8A]"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <text x={315} y={48} textAnchor="middle" className={MUTED}>
        GitHub Actions
      </text>

      <Node x={186} y={62} w={118} h={38} title="4 scan gates" sub="in parallel" />
      <Arrow d="M245 104 L245 124" />
      <Node x={186} y={128} w={118} h={38} title="build once" sub="image gate + SBOM" />
      <Arrow d="M308 147 L330 147" />
      <Node x={334} y={62} w={108} h={38} title="DAST" />
      <Node x={334} y={128} w={108} h={38} title="kind cluster" sub="Pod Security" />
      <Arrow d="M304 140 L334 100" />
      <Arrow d="M388 104 L388 124" />
      <Node x={262} y={188} w={108} h={38} title="publish" sub="main only" />
      <Arrow d="M388 170 L340 190" />

      <Arrow d="M462 207 L510 207" />
      <text x={486} y={200} textAnchor="middle" className={MUTED}>
        OIDC
      </text>
      <Node x={514} y={60} w={110} title="STS" sub="1 hour creds" />
      <Node x={514} y={128} w={110} title="ECR" sub="immutable tags" />
      <Node x={514} y={188} w={110} title="S3 state" />
      <Arrow d="M569 102 L569 124" />
    </Shell>
  );
}

function NorthbeamDiagram() {
  return (
    <Shell height={250}>
      <Node x={20} y={100} w={120} title="Engineer" sub="no standing admin" />
      <Arrow d="M144 121 L188 121" />
      <text x={166} y={113} textAnchor="middle" className={MUTED}>
        MFA
      </text>

      <Node x={192} y={100} w={120} title="STS" sub="AssumeRole" />
      <Arrow d="M316 110 L360 70" />
      <Arrow d="M316 131 L360 131" />
      <Arrow d="M316 142 L360 190" />

      <Node x={364} y={48} w={140} title="Least-privilege role" />
      <Node x={364} y={110} w={140} title="ABAC role" sub="principal + resource tags" />
      <Node x={364} y={172} w={140} title="Boundary-capped role" />

      <Node x={508} y={48} w={116} title="EC2" sub="IMDSv2" />
      <Node x={508} y={172} w={116} title="GitHub Actions" sub="OIDC, no key" />
      <Arrow d="M508 190 L504 190" />
      <Arrow d="M508 66 L504 66" />
    </Shell>
  );
}

function VpcDiagram() {
  return (
    <Shell height={290}>
      <Node x={20} y={16} w={108} title="Internet" />
      <Arrow d="M74 60 L74 84" />
      <Node x={20} y={88} w={108} title="Internet gateway" />

      <rect
        x={160}
        y={10}
        width={460}
        height={270}
        rx="12"
        className="fill-[#060F26] stroke-[#1E3A8A]"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <text x={390} y={30} textAnchor="middle" className={MUTED}>
        northbeam-vpc · 10.0.0.0/16
      </text>

      <text x={176} y={60} className={MUTED}>
        Public tier
      </text>
      <Node x={176} y={66} w={120} h={36} title="10.0.1.0/24" sub="AZ a" />
      <Node x={312} y={66} w={110} h={36} title="NAT gateway" />
      <Node x={438} y={66} w={120} h={36} title="10.0.2.0/24" sub="AZ b" />

      <text x={176} y={134} className={MUTED}>
        App tier · outbound only
      </text>
      <Node x={176} y={140} w={120} h={36} title="10.0.11.0/24" sub="AZ a" />
      <Node x={438} y={140} w={120} h={36} title="10.0.12.0/24" sub="AZ b" />
      <Arrow d="M236 138 L236 106" />

      <text x={176} y={208} className={MUTED}>
        Data tier · no internet route
      </text>
      <Node x={176} y={214} w={120} h={36} title="10.0.21.0/24" sub="AZ a" />
      <Node x={312} y={214} w={110} h={36} title="VPC endpoints" />
      <Node x={438} y={214} w={120} h={36} title="10.0.22.0/24" sub="AZ b" />
      <Arrow d="M300 232 L310 232" />

      <Arrow d="M128 110 L172 88" />
      <Arrow d="M422 232 L436 232" />
      <text x={390} y={272} textAnchor="middle" className={MUTED}>
        S3 and SSM, privately
      </text>
    </Shell>
  );
}

function DataProtectionDiagram() {
  return (
    <Shell height={266}>
      <Node x={20} y={110} w={130} title="CasefileAppRole" />

      <Arrow d="M154 118 L214 62" />
      <Arrow d="M154 131 L214 131" />
      <Arrow d="M154 144 L214 200" />

      <Node
        x={218}
        y={42}
        w={170}
        h={44}
        title="casefile-public-assets"
        sub="public read, GetObject only"
      />
      <Node
        x={218}
        y={110}
        w={170}
        h={44}
        title="casefile-client-docs"
        sub="SSE-KMS + TLS enforced"
      />
      <Node x={218} y={180} w={170} h={44} title="casefile-sealed-records" sub="ciphertext only" />

      <Arrow d="M392 132 L452 132" />
      <Arrow d="M392 200 L452 200" />
      <Node x={456} y={110} w={168} h={44} title="KMS key" sub="customer-managed" />
      <Node
        x={456}
        y={180}
        w={168}
        h={44}
        title="AWS Encryption SDK"
        sub="client-side, before upload"
      />

      <Node x={456} y={34} w={168} h={44} title="Secrets Manager" sub="rotating, Lambda" />
      <Arrow d="M540 108 L540 82" />
    </Shell>
  );
}

function DetectionDiagram() {
  return (
    <Shell height={250}>
      <Node x={16} y={28} w={132} h={42} title="CloudTrail" sub="every API call" />
      <Node x={16} y={100} w={132} h={42} title="VPC Flow Logs" sub="network traffic" />
      <Node x={16} y={172} w={132} h={42} title="AWS Config" sub="resource settings" />

      <Arrow d="M152 49 L218 110" />
      <Arrow d="M152 121 L218 121" />
      <Arrow d="M152 193 L218 132" />

      <Node x={222} y={100} w={132} h={42} title="One S3 log bucket" />
      <Arrow d="M358 121 L420 121" />
      <Node x={424} y={100} w={132} h={42} title="Athena" sub="SQL over the logs" />

      <Arrow d="M152 186 L420 186" />
      <Node x={424} y={168} w={132} h={42} title="3 Config rules" />

      <Arrow d="M82 26 L82 10 L300 10 L300 26" />
      <Node x={244} y={26} w={112} h={42} title="EventBridge" sub="root login" />
      <Arrow d="M360 47 L420 47" />
      <Node x={424} y={26} w={132} h={42} title="SNS to email" />
    </Shell>
  );
}

const DIAGRAMS: Record<CoverId, () => React.JSX.Element> = {
  gatekeeper: GatekeeperDiagram,
  'northbeam-lite': NorthbeamDiagram,
  vpc: VpcDiagram,
  'data-protection': DataProtectionDiagram,
  detection: DetectionDiagram,
};

export function ArchitectureDiagram({ id }: { id: CoverId }) {
  const Diagram = DIAGRAMS[id];
  return <Diagram />;
}
