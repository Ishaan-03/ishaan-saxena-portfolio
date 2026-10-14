import {
  Activity,
  GitBranch,
  KeyRound,
  Lock,
  Radar,
  ScanLine,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tag } from '@/components/ui/Tag';

/**
 * Development only. Returns 404 in production so it never ships.
 * Build these components here first, then use them in the real sections.
 */
export default async function StyleguidePage({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();

  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeader
        badge="Internal"
        title="Styleguide"
        lead="Development only. Every component in the system, so drift is easy to spot."
      />

      <Row title="Colour tokens">
        <div className="flex flex-wrap gap-3">
          {[
            ['--bg', '#02040A'],
            ['--bg-glow', '#0A1A3F'],
            ['--primary', '#2563EB'],
            ['--primary-hover', '#3B82F6'],
            ['--accent', '#60A5FA'],
            ['--accent-2', '#93C5FD'],
            ['--text', '#F1F5F9'],
            ['--text-muted', '#94A3B8'],
            ['--available', '#34D399'],
            ['--finding', '#F59E0B'],
          ].map(([token, value]) => (
            <div key={token} className="w-[150px]">
              <div
                className="h-14 w-full rounded-lg border border-[var(--border)]"
                style={{ backgroundColor: value }}
              />
              <p className="mt-2 font-mono text-[11px] text-[var(--text)]">{token}</p>
              <p className="font-mono text-[11px] text-[var(--text-muted)]">{value}</p>
            </div>
          ))}
        </div>
      </Row>

      <Row title="Type scale">
        <h1 className="text-[var(--text)]">
          Build it. Break it. <span className="text-gradient-accent">Prove it holds.</span>
        </h1>
        <h2 className="mt-6 text-[var(--text)]">Heading two, clamp(2rem, 4vw, 3rem)</h2>
        <h3 className="mt-4 text-[var(--text)]">Heading three, 1.25rem</h3>
        <p className="mt-4 max-w-xl text-[var(--text-muted)]">
          Body copy at 1rem with line-height 1.6. Simple sentences, first person, no buzzwords. This
          paragraph exists to check line length and colour contrast.
        </p>
        <p className="mt-3 text-[13px] text-[var(--text-muted)]">
          Small text at 0.8125rem, used inside cards.
        </p>
        <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">
          JetBrains Mono 11px for tags and small labels.
        </p>
        <p className="wordmark mt-3 text-[var(--text)]">Ishaan Saxena</p>
      </Row>

      <Row title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="#" size="lg" withArrow>
            View my projects
          </ButtonLink>
          <ButtonLink href="#" variant="secondary" size="lg">
            Download CV
          </ButtonLink>
          <Button withArrow>Get in touch</Button>
          <Button variant="secondary">Explore</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Row>

      <Row title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="green">Open to an end-of-studies internship · April 2027</Badge>
          <Badge>Projects</Badge>
          <Badge>Certificates</Badge>
        </div>
      </Row>

      <Row title="Tags">
        <div className="flex flex-wrap gap-2">
          {['IAM', 'KMS', 'Trivy', 'CloudTrail', 'Terraform', 'OIDC', 'Semgrep', 'SBOM'].map(
            (x) => (
              <Tag key={x}>{x}</Tag>
            ),
          )}
        </div>
      </Row>

      <Row title="Glass cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlassCard icon={KeyRound} title="Identity & Access" href="#">
            MFA-gated roles, ABAC and OIDC. No long-lived keys.
          </GlassCard>
          <GlassCard icon={Radar} title="Detection & Logging" href="#">
            CloudTrail, Config and alerts tested until they fire.
          </GlassCard>
          <GlassCard icon={Lock} title="Data Protection" href="#">
            KMS, SSE-KMS and client-side encryption.
          </GlassCard>
          <GlassCard icon={GitBranch} title="DevSecOps" href="#">
            Security gates on every pull request.
          </GlassCard>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <GlassCard
            icon={ShieldCheck}
            title="Card without a link"
            footer={
              <div className="flex flex-wrap gap-2">
                <Tag>Docker</Tag>
                <Tag>Kubernetes</Tag>
              </div>
            }
          >
            No arrow button, and a tag row in the footer slot.
          </GlassCard>
          <GlassCard icon={Terminal} title="Hover me" href="#">
            Border turns to --border-glow and the card lifts 4px.
          </GlassCard>
        </div>
      </Row>

      <Row title="Finding box">
        <div className="glass max-w-xl rounded-2xl border-l-2 border-l-[var(--finding)] p-5">
          <p className="text-[13px] font-semibold text-[var(--finding)]">
            What broke and how I fixed it
          </p>
          <p className="mt-2 text-[13px] text-[var(--text-muted)]">
            The first image was 1.11 GB with 344 HIGH and CRITICAL CVEs. A hardened Dockerfile
            brought it to 125 MB, 44 HIGH and 0 CRITICAL.
          </p>
        </div>
      </Row>

      <Row title="Section header">
        <SectionHeader
          badge="Projects"
          title="Five builds, five things that broke"
          lead="Each one runs in a real AWS account, on a made-up company scenario."
        />
      </Row>

      <Row title="Icon tiles">
        <div className="flex flex-wrap gap-3">
          {[ShieldCheck, Lock, Terminal, Activity, ScanLine, Radar].map((Icon, i) => (
            <span
              key={i}
              className="flex size-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--primary-hover)] to-[var(--primary)] shadow-[0_4px_14px_rgba(37,99,235,0.35)]"
            >
              <Icon className="size-5 text-white" strokeWidth={2} />
            </span>
          ))}
        </div>
      </Row>
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16 border-t border-[var(--border)] pt-10">
      <h2 className="mb-6 font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
