/**
 * Every fact here was read out of the files in certificates-raw/, not from
 * their filenames. Phase 4 adds thumbnails, file paths and the viewer UI.
 *
 * Rule from section 6 of the brief: a course is never called a certification.
 * "AWS Cloud Practitioner Essentials" is a training course, not the AWS
 * Certified Cloud Practitioner exam, and it is typed accordingly.
 */

export type CredentialType = 'certificate' | 'course' | 'exam' | 'letter';

export type CredentialCategory =
  'cloud' | 'security-operations' | 'cybersecurity-foundations' | 'development';

export type Credential = {
  slug: string;
  title: string;
  issuer: string;
  /** ISO date of issue, for sorting and Intl formatting per locale. */
  date: string;
  type: CredentialType;
  category: CredentialCategory;
  credentialId?: string;
  verifyUrl?: string;
  /** Courses that make up a program, shown as an expandable list. */
  courses?: Array<{
    title: string;
    date: string;
    verifyUrl: string;
  }>;
};

export const credentials: Credential[] = [
  {
    slug: 'google-cybersecurity-professional-certificate',
    title: 'Google Cybersecurity Professional Certificate',
    issuer: 'Google · Coursera',
    date: '2025-11-11',
    type: 'certificate',
    category: 'cybersecurity-foundations',
    verifyUrl: 'https://www.credly.com/go/e29dL7D1',
    courses: [
      {
        title: 'Foundations of Cybersecurity',
        date: '2025-09-24',
        verifyUrl: 'https://coursera.org/verify/UW3E6OJYCNGS',
      },
      {
        title: 'Play It Safe: Manage Security Risks',
        date: '2025-10-05',
        verifyUrl: 'https://coursera.org/verify/51YPLZDH0Z08',
      },
      {
        title: 'Connect and Protect: Networks and Network Security',
        date: '2025-10-12',
        verifyUrl: 'https://coursera.org/verify/WY156E9EMKP4',
      },
      {
        title: 'Tools of the Trade: Linux and SQL',
        date: '2025-10-28',
        verifyUrl: 'https://coursera.org/verify/RL14YTCR2R06',
      },
      {
        title: 'Assets, Threats, and Vulnerabilities',
        date: '2025-10-30',
        verifyUrl: 'https://coursera.org/verify/EWTDA72VIID4',
      },
      {
        title: 'Sound the Alarm: Detection and Response',
        date: '2025-10-31',
        verifyUrl: 'https://coursera.org/verify/2Q6ZH5V6AL1F',
      },
      {
        title: 'Automate Cybersecurity Tasks with Python',
        date: '2025-11-11',
        verifyUrl: 'https://coursera.org/verify/PWA3ISMKK8TZ',
      },
      {
        title: 'Put It to Work: Prepare for Cybersecurity Jobs',
        date: '2025-11-11',
        verifyUrl: 'https://coursera.org/verify/ZG9UEDKY0XE7',
      },
    ],
  },
  {
    slug: 'splunk-security-operations-defense-analyst',
    title: 'Security Operations and the Defense Analyst',
    issuer: 'Splunk',
    date: '2025-12-27',
    type: 'course',
    category: 'security-operations',
  },
  {
    slug: 'tech-away-cyber-level-3',
    title: 'Tech Away Cyber, level 3 (final exam)',
    issuer: 'Liora (ex-DataScientest)',
    date: '2026-03-23',
    type: 'exam',
    category: 'security-operations',
    credentialId: 'f31a4f33-c2ef-433f-915e-e3dfe2d6d05e',
  },
  {
    slug: 'aws-cloud-practitioner-essentials',
    title: 'AWS Cloud Practitioner Essentials',
    issuer: 'AWS Training & Certification',
    date: '2026-09-07',
    type: 'course',
    category: 'cloud',
  },
  {
    slug: 'datascientest-programming-level-1',
    title: 'Programming, level 1 (exam)',
    issuer: 'DataScientest',
    date: '2025-11-20',
    type: 'exam',
    category: 'development',
    credentialId: '654541aa-45f8-4061-b370-2ce4feb7a819',
  },
  {
    slug: 'full-stack-web-development',
    title: 'Full Stack Web Development (incl. cloud and DevOps basics)',
    issuer: '100xdevs',
    date: '2024-08-30',
    type: 'course',
    category: 'development',
    credentialId: '4ZBBR076',
  },
  {
    slug: 'navriti-internship-letter',
    title: 'Internship completion letter',
    issuer: 'Navriti Technologies',
    date: '2025-04-17',
    type: 'letter',
    category: 'development',
  },
];

/**
 * What the hero stats bar counts. Every individually verifiable credential:
 * the program badge plus each of its eight course certificates, plus the
 * standalone ones. The Navriti letter is proof of employment, not a
 * credential, so it is excluded.
 */
export const credentialCount = credentials.reduce((total, credential) => {
  if (credential.type === 'letter') return total;
  return total + 1 + (credential.courses?.length ?? 0);
}, 0);
