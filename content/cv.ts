/**
 * The CV files that actually exist in /public/cv/.
 *
 * Only the French one exists today. Ishaan is sending a corrected version whose
 * header reads "avril 2027" rather than "janvier 2027"; the site text already
 * says April 2027 everywhere. Drop the new file in, update `sizeLabel`, and add
 * an English entry here when there is one. Nothing else needs to change.
 */

export type CvFile = {
  language: 'fr' | 'en';
  path: string;
  downloadName: string;
  sizeLabel: string;
};

export const CV_FILES: CvFile[] = [
  {
    language: 'fr',
    path: '/cv/Ishaan_Saxena_CV_FR.pdf',
    downloadName: 'Ishaan_Saxena_CV_FR.pdf',
    sizeLabel: '58 KB',
  },
];

/**
 * Section 9: the French site gives the French CV, every other language gives
 * English, falling back to French when there is no English file.
 */
export function pickCv(locale: string): CvFile {
  if (locale === 'fr') {
    return CV_FILES.find((f) => f.language === 'fr') ?? CV_FILES[0];
  }
  return CV_FILES.find((f) => f.language === 'en') ?? CV_FILES[0];
}
