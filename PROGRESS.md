# PROGRESS.md

Updated at the end of every phase so a new session can resume. Last update: 14 October 2026.

## Current state

**Phase 2 (Hero and globe) — complete. Waiting for Ishaan's OK to start Phase 3.**

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


## Phase 1 — done

### i18n routing (section 7)

- next-intl 4.14.9. `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`,
  `middleware.ts`, plugin wired in `next.config.ts`.
- `localePrefix: 'as-needed'` so **en** is served at `/` and the others take a prefix.
- **`localeDetection: false`** on purpose. The brief: "No automatic redirect based on the
  browser language (recruiters share links; the link must show what they saw)." Phase 6 adds
  the dismissible "Voir ce site en français ?" pill instead.
- Locale cookie kept on, named `NEXT_LOCALE`, one year, sameSite lax. A choice made in the
  switcher survives a reload but never triggers a redirect by itself.
- **`routing.locales` is `['en']` for now.** Listing fr, es and hi before their message
  files exist would serve English under a French URL, which is worse than an inert switcher.
  Phase 6 adds them in one line. `plannedLocales` already holds all four with native names.
- Every visible string is in `messages/en.json`. No hardcoded copy in components.

### Fonts

next/font self-hosts Inter and JetBrains Mono, so there are no external font requests and
the CSP in section 10 stays simple. Noto Sans Devanagari is Phase 6, Hindi only.

### Tokens

All of section 3 is in `app/globals.css` as CSS variables, re-exported through Tailwind 4's
`@theme inline`. Utilities: `glass`, `text-gradient-accent`, `wordmark`, `page-backdrop`,
`dot-grid`, `section-glow`, `skip-link`, `animate-pulse-dot`.

**Contrast checked, not assumed.** Every token pair passes WCAG AA on `--bg`:

| Pair | Ratio |
|---|---|
| `--text` on `--bg` | 18.71:1 |
| `--text-muted` on `--bg` | 8.00:1 |
| white on `--primary` | 5.17:1 |
| `--accent` on `--bg` | 8.06:1 |
| `--accent-2` on `--bg` | 11.37:1 |
| `--finding` on `--bg` | 9.55:1 |
| `--available` on `--bg` | 10.66:1 |
| `--primary-hover` on `--bg` | 5.57:1 |

### Components

`components/ui/`: Button (primary and secondary, md and lg, arrow chip in a circle),
Badge (blue or green pulsing dot), GlassCard (icon tile, title, body, optional tag footer,
optional arrow button, hover lifts 4px and border turns `--border-glow`), SectionHeader
(badge + H2 + muted line, centered, max-width 640px, glow behind), Tag (mono 11px).

`components/layout/`: Navbar (64px, transparent at top, glass after 24px of scroll, active
link tracked with IntersectionObserver, full-screen sheet on mobile), Footer, 
LanguageSwitcher, ScrollProgress (2px `--primary` line), BackToTop (after one screen),
Reveal (fade in + 16px up, 0.5s, 0.06s stagger, once).

Reduced motion is handled globally in `globals.css` and by `motion-safe:` on the hover
lifts, so nothing floats, counts up or rotates when the user asks it not to.

`/styleguide` renders every component and returns 404 when `NODE_ENV` is production.

### Two fixes worth remembering

- **lucide-react v1 dropped brand icons.** GitHub now comes from `react-icons/si`
  (`SiGithub`) and LinkedIn from `react-icons/fa6` (`FaLinkedinIn`), because Simple Icons
  removed LinkedIn over trademark policy. `react-icons` is listed in section 2 of the brief.
- **`new Date()` breaks the build under `cacheComponents`.** The footer year is injected at
  build time through `env.NEXT_PUBLIC_BUILD_YEAR` in `next.config.ts`, which keeps the page
  static and avoids a client-rendered year shifting the layout.
- `devIndicators: false` so the Next dev badge stops landing on the footer in screenshots.

### Gates

lint, typecheck, format, build and `audit:ci` all pass. Playwright: 9 passed, 1 skipped
(a mobile-only test under the desktop project). Browser console clean.

Screenshots in `test-results/`: home and styleguide at both sizes, the scrolled glass
navbar, and the mobile menu sheet.

### Known gaps, deliberate

- The home page is a placeholder. Hero, globe and the nine sections are Phases 2 and 3.
- `/security` is linked from the footer but does not exist yet (Phase 7).
- `npm run i18n:check` is not written yet. Section 7 asks for it; it belongs with Phase 6
  when there is more than one locale to compare.


## Phase 2 — done

### The globe

- **Dot cloud is generated at build time.** `scripts/generate-globe-dots.ts` samples a
  Fibonacci sphere against Natural Earth land polygons and writes
  `public/globe/dots.bin`: 6,866 land dots and 240 city dots, Int16-quantised, 41.6 KB.
  Run it with `npm run globe:dots`.
  Nothing geographic ships in the JS bundle and there is no parsing at runtime. The first
  attempt inlined the points as a TypeScript array, which came to 244 KB of bundle.
  `world-atlas`, `topojson-client` and `d3-geo` are devDependencies used only by that
  script. Antarctica is dropped: at this dot size it reads as a white smear.
- Dots are a custom `ShaderMaterial` with round points and depth-based fading, so no sprite
  texture is needed. Far-side dots dim rather than disappear.
- Dark core sphere, a tight Fresnel atmosphere on the rim, and a wide soft halo behind.
- Three tilted orbit rings with glowing particles travelling along them. They are real 3D
  circles, so the core sphere occludes the half that passes behind.
- **Jaipur to Paris arc** with a travelling light pulse that pauses before looping.
  Markers on Paris and Stockholm, tooltip on hover or tap.
- Auto-rotation at one turn per 90 seconds; mouse tilt capped at 6 degrees, desktop only.

### Performance rules from section 4

| Rule | How |
|---|---|
| Canvas after the text paints | `next/dynamic` with `ssr: false`, mounted in `requestIdleCallback` |
| No layout shift | `GlobeFallback` occupies the same box as the canvas |
| DPR capped at 1.5 | `dpr={[1, 1.5]}` |
| Pause when off-screen | IntersectionObserver flips `frameloop` to `never` |
| Dispose on unmount | geometries and materials freed in a cleanup effect |
| Fewer dots, no bloom on mobile | `pointer: coarse` or 4 cores or fewer thins the cloud by half |
| Reduced motion | `frameloop: 'demand'`, one frame, no rotation, no float, no count-up |
| WebGL missing | capability check falls through to the CSS fallback |

### Hero cards and stats bar

Four glass cards: Identity & Access, Data Protection, Detection & Logging, DevSecOps. Two
left, two right, staggered, each floating on its own out-of-phase 6s loop and linking to its
project anchor. Below `lg` they become a 2x2 grid under the globe.

The stats bar replaces the reference's "Trusted by 10,000+ teams": four icon chips plus
"Every project runs in a real AWS account", then **5** AWS security builds, **14**
certificates, **344 to 44** image CVEs cut, **0** AWS keys stored in CI. Numbers count up on
entry and respect reduced motion.

**The 14 is computed, never typed.** `content/certifications.ts` now holds all seven
credential entries read from the files in Phase 0, and `credentialCount` sums every entry
that is not the Navriti letter, counting the Google program plus each of its eight course
certificates. Phase 4 adds thumbnails, categories and the viewer on top of this same data.

### Three things worth remembering

- **A production run caught a bug that dev mode hid.** `CountUp` seeded its state from
  `useReducedMotion()`, which is null on the server and true on a client that asks for
  reduced motion, so the server rendered `0` and the client rendered `14`. That is React
  hydration error #418, and it only surfaces in a minified production build. There is now
  `npm run test:prod`, which serves the built site and fails on any console error. Worth
  running before every phase is called done.
- **The dots were a solid blue disc at first.** `gl_PointSize` is in device pixels, and the
  original formula produced roughly 175px per dot. It now takes the device pixel ratio and
  the camera distance as uniforms and `uSize` means "diameter in CSS pixels at the globe's
  centre".
- **@react-three/postprocessing was removed.** Its bloom pass resolves to an opaque
  rectangle over a transparent canvas, which showed as a visible square against the page.
  The halo is now an additive in-scene shell, which is cheaper and has no alpha problem.
  Section 2 lists the package, so this is a deliberate departure from the brief.

### Known console warning

`THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`

It comes from `@react-three/fiber` 9.8.1, which constructs `new THREE.Clock()` in its own
store (`events-*.esm.js`). three deprecated Clock in r183 and the installed three is r186.
Nothing in this repo calls it, and there is no newer fiber release. It is a warning, not an
error; the smoke test fails on errors only. It clears when fiber moves to THREE.Timer.

### Gates

lint, typecheck, format, build and `audit:ci` pass. Playwright: 11 passed, 1 skipped.
`npm run test:prod`: 2 passed, zero console errors on the built site.

**Screenshots now run with reduced motion forced on.** That is not a workaround: the globe
draws a single frame under `prefers-reduced-motion` by design, which makes captures
deterministic and exercises that path. Screenshotting a continuously animating WebGL canvas
times out waiting for the page to settle.

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

### B1 · Keys · RESOLVED 14 Oct, Ishaan's call

Ishaan decided to keep the existing keys and accept that they appear in the chat
transcript, on the condition that they never reach git or GitHub. That condition is
enforced: `.gitignore` covers `.env*` and the dotless `env.*`, the gitleaks pre-commit hook
is tested in both directions, and `git ls-files` confirms nothing matching is tracked.

`.env.local` was rewritten into proper `KEY=VALUE` form with `RESEND_API_KEY` and
`CONTACT_TO_EMAIL` set, chmod 600. The two Turnstile variables are empty because the
Cloudflare widget does not exist yet (brief A2) and Phase 5 needs it.

The GitHub PAT was deliberately left out of `.env.local`. The site never calls the GitHub
API, and `git push` and Vercel's GitHub integration authenticate on their own.

The original free-text `env.local` (no dot) still sits in the project root, holding both
keys. It is gitignored and unused. Say the word and it goes.

<details><summary>Original finding</summary>

`/.env.local` and `/env.local` are byte-identical and hold, as free text rather than
`KEY=VALUE`, a **GitHub personal access token** (`github_pat_11BHY…`) and a **Resend API
key** (`re_PRAB…`), pasted around a JavaScript snippet. The same values are in
`token for portfolio.pdf` in Downloads.

Both were read into an AI session on 14 October 2026 and should be treated as compromised.
**Revoke and reissue both**, then write only the four variables from `.env.example` into
`.env.local` in proper `KEY=VALUE` form.

The GitHub token does not belong in this project's env at all. The site never calls the
GitHub API. `git push` and Vercel's GitHub integration authenticate on their own.

</details>

### B2 · CV start date · Ishaan is handling it

The CV PDF still reads **"6 mois dès janvier 2027"**. Ishaan's instruction on 14 Oct: the
site uses **April 2027** everywhere, and he will send a corrected PDF later to replace
`assets-raw/cv/CV_Ishaan_Saxena_FR.pdf`.

So section 9's "stop and tell Ishaan" check is answered: proceed with April 2027 copy, and
swap the PDF when the new one arrives. Phase 5 must not ship the current file to
`/public/cv/` without checking whether the replacement has landed.

Only a French CV exists. An English one matters because English is the site default.

### B3 · Gatekeeper number · acknowledged 14 Oct

The Gatekeeper README's table says **44 HIGH** CVEs after hardening, one diagram step says
46. The site uses **44**. Ishaan will fix the diagram in the repo himself.

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

**Phase 3 — Content sections.** About with the method stepper, Projects with generated SVG
covers and detail pages, the earlier web development row, Skills, and the Experience and
Education timeline.

Done when every fact traces to section 6, the CV or a README, and every GitHub link
returns 200.

Two things to carry in: the internship location is **open to relocation**, not the brief's
"Paris region"; and the Gatekeeper CVE figure is **44**, not the 46 in one README diagram.

## Translations

Not started. When written, note here that all four locales are machine-written and need
review: Ishaan reviews Hindi (native) and French; Spanish stays simple.
