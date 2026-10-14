# CLAUDE.md

Working rules for this repo. Source of truth is `PORTFOLIO_BRIEF.pdf` (gitignored, in the
project root). This file is the short version; when the two disagree, the brief wins.

## What this is

Ishaan Saxena's portfolio site. Dark, blue, animated. One long page plus project detail
pages. Audience: recruiters and engineers at French cloud security consultancies. A
recruiter must know who he is in 10 seconds, see proof in 60, and reach the CV, a GitHub
write-up or the contact form in one click.

## Hard rules

- **Never invent facts.** Every claim, date and number comes from the brief (section 6),
  the CV in `assets-raw/cv/`, the linked GitHub READMEs, or the certificate files. If
  something is missing, ask Ishaan. Do not fill the gap.
- **Never call a course a certification.** "AWS Cloud Practitioner Essentials" is a
  training course, not the AWS Certified Cloud Practitioner exam. Type badge: Course.
- **Stop at the end of every phase.** Show screenshots, wait for approval before the next.
- **Ask before adding any dependency** not listed in section 2 of the brief, and say why.
- **Check current docs before using an API.** Do not rely on memory for Next.js, next-intl,
  React Three Fiber, Tailwind or Resend. They change.
- **No secrets in the repo.** `.env*` and `env.*` are gitignored, gitleaks runs pre-commit.
  Env vars only, never a hardcoded recipient, key or token.

## Writing style

Simple, first person, short sentences. **No em dashes.** No buzzwords ("passionate",
"leverage", "cutting-edge", "synergy", "rockstar"). No "not just X, but Y". No lorem ipsum.
It should read like Ishaan wrote it. Keep AWS service names, tool names, certificate titles,
company and repo names in English in every language.

## Tech stack

Next.js (App Router, TypeScript strict) · Tailwind · motion (Framer Motion) ·
three + @react-three/fiber + drei + postprocessing (one WebGL canvas, hero only) ·
next-intl (en default, fr, es, hi) · lucide-react + react-icons · Resend + zod +
Cloudflare Turnstile · next/font (Inter, JetBrains Mono, Noto Sans Devanagari) · Vercel.

No database. Content lives in TypeScript files under `content/` and JSON under `messages/`.

## Design

Reference: `design-reference/nexora.png`. Copy the **style only**, never the Nexora name,
logo, text or images. **Red becomes blue.** Dark theme only, no light mode toggle.
Tokens in section 3 of the brief: `--bg #02040A`, `--primary #2563EB`, `--accent #60A5FA`
to `#93C5FD`, glass cards at `rgba(255,255,255,0.03)` with backdrop blur.

Respect `prefers-reduced-motion` everywhere: no floating, no count-up, no auto-rotation.

## Before calling a phase done

1. `npm run lint`, `npm run typecheck`, `npm run build` all pass.
2. Browser console is clean.
3. Playwright screenshots at **1440x900** and **390x844**, compared against the reference.
4. `PROGRESS.md` updated so a fresh session can resume.

## Resuming a session

Read `CLAUDE.md` and `PROGRESS.md`, then continue where the previous session stopped.
