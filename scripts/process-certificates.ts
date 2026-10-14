/**
 * Build-time only. Turns the raw Drive export in certificates-raw/ into what
 * actually ships: an 800px WebP thumbnail per credential, plus a copy of the
 * original for the "Open original" link.
 *
 * Run with: npm run certificates
 *
 * Section 6 of the brief asks for EXIF to be stripped. sharp drops all metadata
 * unless you explicitly ask it to keep it, so the WebP output carries none. The
 * originals are copied byte for byte, because a certificate PDF is the evidence
 * and re-encoding it would undermine the point.
 *
 * certificates-raw/ is gitignored. Only the processed output in public/ ships.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const RAW = 'certificates-raw';
const THUMBS = 'public/certificates/thumbs';
const FILES = 'public/certificates/files';
const TEMP = '/tmp/claude-1000/cert-render';

/**
 * Source file to slug. Read from each document's own contents in Phase 0, not
 * from its filename: several filenames are wrong about what they hold.
 */
const MAP: Array<{ file: string; slug: string; thumbFrom?: string }> = [
  // The Google program. The PNG badge makes the better thumbnail; the PDF is
  // the file people download.
  {
    file: 'GoogleCybersecurityProfessionalCertificateV2_Badge20251111-31-zqv1ri.pdf',
    slug: 'google-cybersecurity-professional-certificate',
    thumbFrom: 'google-cybersecurity-professional-certificate-v2.png',
  },

  // Its eight component courses, in the order they were completed.
  { file: 'Foundations Of Cybersecurity.pdf', slug: 'foundations-of-cybersecurity' },
  { file: 'Manage Security Risks. Certificate.pdf', slug: 'play-it-safe-manage-security-risks' },
  {
    file: 'Connect and Protect_ Networks and Network Security Certificate.pdf',
    slug: 'connect-and-protect',
  },
  { file: 'Linux and SQL Certificate.pdf', slug: 'tools-of-the-trade-linux-and-sql' },
  {
    file: 'Assets, Threats, and Vulnerabilities Certificate.pdf',
    slug: 'assets-threats-and-vulnerabilities',
  },
  {
    file: 'Sound the Alarm_ Detection and Response Certificate.pdf',
    slug: 'sound-the-alarm-detection-and-response',
  },
  {
    file: 'Automate Cybersecurity Tasks with Python Certificate.pdf',
    slug: 'automate-cybersecurity-tasks-with-python',
  },
  {
    file: 'Put It to Work_ Prepare for Cybersecurity Jobs Certificate.pdf',
    slug: 'put-it-to-work-prepare-for-cybersecurity-jobs',
  },

  // Standalone credentials.
  {
    file: 'Splunk Certificate of Completion.pdf',
    slug: 'splunk-security-operations-defense-analyst',
  },
  { file: 'Liora-cyberSecurity certificate .pdf', slug: 'tech-away-cyber-level-3' },
  { file: 'AWS Cloud Practitioner.pdf', slug: 'aws-cloud-practitioner-essentials' },
  { file: 'Data science certificate.pdf', slug: 'datascientest-programming-level-1' },
  { file: 'Web development , cloud and devops .pdf', slug: 'full-stack-web-development' },
  { file: 'Internship-certificate.pdf', slug: 'navriti-internship-letter' },
];

function renderFirstPage(pdf: string, outBase: string) {
  // -r 150 is enough for an 800px-wide thumbnail off an A4 page.
  execFileSync('pdftoppm', ['-png', '-r', '150', '-f', '1', '-l', '1', pdf, outBase]);

  const dir = path.dirname(outBase);
  const prefix = path.basename(outBase);
  const produced = readdirSync(dir).find((f) => f.startsWith(prefix) && f.endsWith('.png'));
  if (!produced) throw new Error(`pdftoppm produced nothing for ${pdf}`);

  return path.join(dir, produced);
}

async function main() {
  for (const dir of [THUMBS, FILES, TEMP]) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
  }

  const report: Array<{ slug: string; thumbKb: number; original: string; originalKb: number }> = [];

  for (const entry of MAP) {
    const source = path.join(RAW, entry.file);
    if (!existsSync(source)) throw new Error(`missing source: ${source}`);

    const ext = path.extname(entry.file).toLowerCase();
    const originalTarget = path.join(FILES, `${entry.slug}${ext}`);
    copyFileSync(source, originalTarget);

    const thumbSource = entry.thumbFrom ? path.join(RAW, entry.thumbFrom) : source;
    if (!existsSync(thumbSource)) throw new Error(`missing thumbnail source: ${thumbSource}`);

    const raster = thumbSource.toLowerCase().endsWith('.pdf')
      ? renderFirstPage(thumbSource, path.join(TEMP, entry.slug))
      : thumbSource;

    const thumbTarget = path.join(THUMBS, `${entry.slug}.webp`);

    // No .withMetadata(), so sharp writes nothing from the source: no EXIF,
    // no ICC, no XMP.
    const info = await sharp(raster)
      .resize({ width: 800, withoutEnlargement: true })
      .flatten({ background: '#02040A' })
      .webp({ quality: 78 })
      .toFile(thumbTarget);

    const originalKb = statSync(originalTarget).size / 1024;
    report.push({
      slug: entry.slug,
      thumbKb: info.size / 1024,
      original: path.basename(originalTarget),
      originalKb,
    });
  }

  rmSync(TEMP, { recursive: true, force: true });

  const totalThumb = report.reduce((sum, r) => sum + r.thumbKb, 0);
  const totalOriginal = report.reduce((sum, r) => sum + r.originalKb, 0);

  for (const row of report) {
    console.log(
      `${row.slug.padEnd(48)} thumb ${row.thumbKb.toFixed(0).padStart(4)} KB   original ${row.originalKb.toFixed(0).padStart(4)} KB`,
    );
  }
  console.log(
    `\n${report.length} credentials · thumbnails ${(totalThumb / 1024).toFixed(2)} MB · originals ${(totalOriginal / 1024).toFixed(2)} MB`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
