/**
 * Timeline entries, newest first. Dates are ISO so Intl can format them per
 * locale; the visible text lives in messages/[locale].json.
 *
 * Sources: section 6 of the brief and the CV in assets-raw/cv/.
 */

export type TimelineEntry = {
  key: string;
  kind: 'work' | 'education';
  start: string;
  /** Absent means it is still running. */
  end?: string;
  bullets: number;
};

export const timeline: TimelineEntry[] = [
  { key: 'mcdonalds', kind: 'work', start: '2026-02-01', bullets: 2 },
  { key: 'ece', kind: 'education', start: '2025-09-01', end: '2027-04-30', bullets: 2 },
  { key: 'navriti', kind: 'work', start: '2024-12-17', end: '2025-04-17', bullets: 3 },
  { key: 'bca', kind: 'education', start: '2022-07-01', end: '2025-06-30', bullets: 1 },
];
