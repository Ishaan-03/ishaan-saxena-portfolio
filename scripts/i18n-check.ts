/**
 * Fails if any locale has drifted from English. Section 7 of the brief.
 *
 * Run with: npm run i18n:check
 *
 * English is the reference. Every other locale must have the same keys, the
 * same shape at each key, arrays of the same length, and the same ICU
 * placeholders. A missing key would render as its own key path on the page; an
 * extra one is dead weight that hides a rename.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const DIR = 'messages';
const REFERENCE = 'en';

type Json = string | string[] | { [key: string]: Json };

function load(locale: string): Json {
  return JSON.parse(readFileSync(path.join(DIR, `${locale}.json`), 'utf8'));
}

/** Flattens to `a.b.c` keys so two files can be compared directly. */
function flatten(value: Json, prefix = '', out = new Map<string, Json>()): Map<string, Json> {
  if (typeof value === 'string' || Array.isArray(value)) {
    out.set(prefix, value);
    return out;
  }

  for (const [key, child] of Object.entries(value)) {
    flatten(child, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

/** `{name}` and `{count, plural, ...}` both start with a name we can compare. */
function placeholders(value: string) {
  return new Set([...value.matchAll(/\{(\w+)/g)].map((m) => m[1]));
}

/**
 * Zero-width joiners, zero-width spaces and byte-order marks are invisible in
 * an editor but render as a stray gap. A mistyped one turned "master's" into
 * "master 's" on the Hindi page and nothing caught it until the screenshot.
 */
const INVISIBLE = /[\u200B-\u200F\uFEFF]/g;

function invisibleCharacters(locale: string) {
  const raw = readFileSync(path.join(DIR, `${locale}.json`), 'utf8');
  const hits: string[] = [];

  for (const line of raw.split('\n')) {
    const matches = [...line.matchAll(INVISIBLE)];
    if (matches.length > 0) {
      const codes = matches.map((m) => `U+${m[0].codePointAt(0)!.toString(16).toUpperCase()}`);
      hits.push(`${codes.join(', ')} in: ${line.trim().slice(0, 70)}`);
    }
  }

  return hits;
}

const reference = flatten(load(REFERENCE));

const locales = readdirSync(DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.basename(file, '.json'))
  .filter((locale) => locale !== REFERENCE)
  .sort();

if (locales.length === 0) {
  console.log(`i18n:check — only ${REFERENCE}.json exists, nothing to compare.`);
  process.exit(0);
}

// The reference file deserves the same scrutiny as the translations.
const referenceInvisible = invisibleCharacters(REFERENCE);
if (referenceInvisible.length > 0) {
  console.error(`\n${REFERENCE}: ${referenceInvisible.length} invisible character(s)`);
  for (const hit of referenceInvisible) console.error(`  ${hit}`);
  process.exit(1);
}

let failures = 0;

for (const locale of locales) {
  const problems: string[] = [];
  const target = flatten(load(locale));

  for (const hit of invisibleCharacters(locale)) {
    problems.push(`invisible char: ${hit}`);
  }

  for (const [key, englishValue] of reference) {
    const value = target.get(key);

    if (value === undefined) {
      problems.push(`missing:        ${key}`);
      continue;
    }

    if (Array.isArray(englishValue) !== Array.isArray(value)) {
      problems.push(`wrong type:     ${key}`);
      continue;
    }

    if (Array.isArray(englishValue) && Array.isArray(value)) {
      if (englishValue.length !== value.length) {
        problems.push(
          `array length:   ${key} (${REFERENCE} has ${englishValue.length}, ${locale} has ${value.length})`,
        );
      }
      continue;
    }

    if (typeof englishValue === 'string' && typeof value === 'string') {
      const expected = placeholders(englishValue);
      const actual = placeholders(value);

      for (const name of expected) {
        if (!actual.has(name)) problems.push(`lost {${name}}:    ${key}`);
      }
      for (const name of actual) {
        if (!expected.has(name)) problems.push(`unknown {${name}}: ${key}`);
      }

      // An untranslated string is not always wrong: tool names, AWS services
      // and company names stay in English on purpose (section 7). Only flag
      // long prose, where an identical copy means the string was missed.
      if (englishValue === value && englishValue.length > 60) {
        problems.push(`not translated: ${key}`);
      }
    }
  }

  for (const key of target.keys()) {
    if (!reference.has(key)) problems.push(`extra:          ${key}`);
  }

  if (problems.length === 0) {
    console.log(`${locale}: ok (${target.size} keys)`);
  } else {
    failures += problems.length;
    console.error(`\n${locale}: ${problems.length} problem(s)`);
    for (const problem of problems) console.error(`  ${problem}`);
  }
}

if (failures > 0) {
  console.error(`\ni18n:check failed with ${failures} problem(s).`);
  process.exit(1);
}

console.log(`\ni18n:check passed for ${locales.join(', ')}.`);
