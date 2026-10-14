# PROGRESS.md

Updated at the end of every phase so a new session can resume. Last update: 14 October 2026.

## Current state

**Phase 0 (Setup) — complete. Waiting for Ishaan's OK to start Phase 1.**

Two things still need Ishaan to act (B1 and B2 below). Neither blocks Phase 1.

## Phase 0 — done

### Files staged from Part A

- `design-reference/nexora.png` — the red globe screenshot, style reference only
- `certificates-raw/` — 16 files, unzipped from the Drive export
- `assets-raw/cv/CV_Ishaan_Saxena_FR.pdf`
- `PORTFOLIO_BRIEF.pdf` in the root (gitignored)

### Project setup

- Node 22.23.3 via nvm (`.nvmrc` pins 22). System Node 18.19.1 is untouched.
- Next.js 16.4.0, React 19.3.0, App Router, TypeScript strict, Tailwind 4, ESLint 9.
- Prettier 3.9.10 with `.prettierrc.json` and `.prettierignore`.
- Playwright 1.64.0, chromium + headless shell installed. `playwright.config.ts` has the
  two viewports the brief asks for: desktop 1440x900, mobile 390x844 (Pixel 7 profile).
- `tests/smoke.spec.ts` — loads the page, asserts HTTP 200, captures both screenshots,
  fails on any console error. Grows each phase.
- `next.config.ts` pins `turbopack.root` to the repo. Without it Next walks up and finds a
  stray `package-lock.json` in the home directory and warns on every build.
- `.claude/launch.json` starts the dev server with nvm's Node on PATH.
- `git init` on `main`. No commits pushed anywhere; Ishaan handles GitHub auth himself.
- `.gitignore` covers `.env*`, `env.*`, `*.pem`, `*.key`, the three raw working folders and
  the brief. Verified with `git check-ignore`.
- gitleaks 8.30.1 pre-commit hook at `.githooks/pre-commit`, wired via `core.hooksPath`.
  Tested both ways: it blocks a staged secret and passes a clean file set.
- `.env.example` with the four variables from section 8.

### Gates (all passing)

| Gate | Command | Result |
|---|---|---|
| Lint | `npm run lint` | pass |
| Typecheck | `npm run typecheck` | pass |
| Format | `npm run format:check` | pass |
| Build | `npm run build` | pass, no warnings |
| Audit | `npm run audit:ci` | pass, 0 vulnerabilities |
| Smoke | `npx playwright test` | 2 passed, console clean |

**Note on `audit:ci`.** It runs `npm audit --omit=dev --audit-level=high`. A plain
`npm audit` reports 5 high findings, all one dev-only chain:
`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`.
The installed `braces` is already 3.0.3, the patched version, and npm's only offered fix is
to downgrade `eslint-config-next` to 14.2.35, which is a breaking downgrade onto much older
code. Production dependencies are clean. Revisit when `eslint-config-next` bumps
`fast-glob`. Flagged for Ishaan because a security portfolio should not weaken its own gate
silently.

## Decisions taken (section 16, answered 14 Oct 2026)

| # | Question | Answer |
|---|---|---|
| 1 | Hero headline | **A** — "Build it. Break it." / "Prove it holds." (line 2 in accent) |
| 2 | Photo in About | **No photo.** Glass ID card |
| 3 | Internship location | **Open to relocation** (not the brief's "Paris region" default) |
| 4 | Indian city for the globe arc | **Jaipur** |
| 5 | Domain | **Keep ishaansaxena.vercel.app.** Move it off the old Vercel project |
| 6 | English CV | Not answered. None found on disk; French only |
| 7 | McDonald's + earlier web dev | **Both**, framed as the brief describes |
| 8 | Node install | nvm + Node 22 LTS. Done |
| 9 | Extra certificates | Include the DataScientest exam **and** the Navriti letter |

**Q3 knock-on:** "Open to relocation" overrides the brief's section 7 line, which reads
"Paris region". The internship band and the contact panel must say open to relocation
instead. The contact panel still shows "Paris region · CET" as his current location.

**Q9 is ambiguous and needs one word from Ishaan.** Both "include the Navriti letter" and
"Navriti as timeline proof only" were selected, and they contradict each other. Current
plan: show it in the Certificates grid **and** link it from the Navriti entry in the
Experience timeline. If he meant timeline only, drop it from the grid.

## Open items for Ishaan

### B1 · Rotate two exposed keys (not blocking Phase 1)

`/.env.local` and `/env.local` are byte-identical and hold, as free text rather than
`KEY=VALUE`, a **GitHub personal access token** (`github_pat_11BHY…`) and a **Resend API
key** (`re_PRAB…`), pasted around a JavaScript snippet. The same values are in
`token for portfolio.pdf` in Downloads.

Both were read into an AI session on 14 October 2026 and should be treated as compromised.
**Revoke and reissue both**, then write only the four variables from `.env.example` into
`.env.local` in proper `KEY=VALUE` form.

The GitHub token does not belong in this project's env at all. The site never calls the
GitHub API. `git push` and Vercel's GitHub integration authenticate on their own.

Neither file has been edited or deleted, pending Ishaan's go-ahead. Both are gitignored, and
the pre-commit hook blocks them. Next currently loads `.env.local` at build time and parses
that JavaScript snippet as junk variables; harmless today, worth cleaning up.

### B2 · CV start date (blocks the CV copy in Phase 5)

The CV header reads **"6 mois dès janvier 2027"**. The brief (A3, section 9) requires
**April 2027**, so it must become **"Stage de fin d'études de 4 à 6 mois dès avril 2027"**
before it is copied to `/public/cv/`. Section 9 blocks the copy until then.

Only a French CV exists. An English one matters because English is the site default.

### B3 · One number to confirm (Phase 3)

The brief flags it: the Gatekeeper README's table says **44 HIGH** CVEs after hardening but
one diagram step says 46. The site will use 44. Ishaan should fix the diagram in the repo.

## Certificates found (16 files, 15 distinct credentials)

Read from the files themselves, not from the filenames.

### Google Cybersecurity Professional Certificate — program, Coursera

Badge issued **11 Nov 2025**, verify `credly.com/go/e29dL7D1`. Present twice:
`GoogleCybersecurityProfessionalCertificateV2_Badge…pdf` and
`google-cybersecurity-professional-certificate-v2.png` — same credential, dedupe to one.

All 8 component courses are present, so the program is complete. Group them under the
program card as an expandable list (brief, section 6 pipeline):

| # | Course (exact title on the certificate) | Date | Coursera verify code |
|---|---|---|---|
| 1 | Foundations of Cybersecurity | 24 Sep 2025 | UW3E6OJYCNGS |
| 2 | Play It Safe: Manage Security Risks | 5 Oct 2025 | 51YPLZDH0Z08 |
| 3 | Connect and Protect: Networks and Network Security | 12 Oct 2025 | WY156E9EMKP4 |
| 4 | Tools of the Trade: Linux and SQL | 28 Oct 2025 | RL14YTCR2R06 |
| 5 | Assets, Threats, and Vulnerabilities | 30 Oct 2025 | EWTDA72VIID4 |
| 6 | Sound the Alarm: Detection and Response | 31 Oct 2025 | 2Q6ZH5V6AL1F |
| 7 | Automate Cybersecurity Tasks with Python | 11 Nov 2025 | PWA3ISMKK8TZ |
| 8 | Put It to Work: Prepare for Cybersecurity Jobs | 11 Nov 2025 | ZG9UEDKY0XE7 |

### Standalone credentials

| Title (as printed) | Issuer | Date | Type | Note |
|---|---|---|---|---|
| Security Operations and the Defense Analyst (eLearning) | Splunk | 27 Dec 2025 | Course | 2 credit hours |
| Final Test - Tech Away Cyber lvl3 (EN) | Liora (ex-DataScientest) | 23 Mar 2026 | Exam | cert f31a4f33-c2ef-433f-915e-e3dfe2d6d05e |
| Exam - Programming - Level 1 (EN) | DataScientest | 20 Nov 2025 | Exam | cert 654541aa-45f8-4061-b370-2ce4feb7a819. Category: Development |
| AWS Cloud Practitioner Essentials | AWS Training & Certification | 7 Sep 2026 | **Course** | training course, **not** the AWS Certified exam |
| 0-100 Full Stack Web Development Course | 100xdevs | 30 Aug 2024 | Course | cert 4ZBBR076 |
| Internship completion letter | Navriti Technologies | 17 Dec 2024 to 17 Apr 2025 | Letter | see Q9 ambiguity above |

The Navriti letter's dates match the CV and the brief (Dec 2024 to Apr 2025).

### Count for the hero stats bar

The brief's stats bar shows `{count} certificates`, computed from the data, never
hardcoded. Settle in Phase 4 whether the 8 Coursera courses count individually (15) or as
one program (7 cards), and whether the Navriti letter counts at all. The honest figure for
a recruiter is probably the per-credential count with the Google program expandable.

## Next

**Phase 1 — Design system.** Tokens from section 3, fonts, Button, Badge, GlassCard,
SectionHeader, Tag, Navbar with switcher placeholder, Footer, section background, a dev-only
`/styleguide` page, and next-intl routing with English strings.

Done when screenshots at 1440x900 and 390x844 show components matching the reference style
in blue.

## Translations

Not started. When written, note here that all four locales are machine-written and need
review: Ishaan reviews Hindi (native) and French; Spanish stays simple.
