import { credentials } from '@/content/certifications';
import { profile } from '@/content/profile';
import { SITE_URL } from '@/lib/metadata';

/**
 * JSON-LD Person. Section 11.
 *
 * Every field here is already stated somewhere on the page; this just makes it
 * machine-readable. The email is deliberately absent: section 10 keeps it out
 * of the HTML, and a JSON-LD block is still HTML.
 *
 * No nonce. `application/ld+json` is data rather than code, so a browser never
 * executes it and `script-src` never applies. Reading the nonce would mean
 * calling `headers()` in the layout, which opts every page out of static
 * rendering for no security gain at all.
 */
export function PersonSchema({ jobTitle }: { jobTitle: string }) {
  const knowsAbout = [
    'Cloud security',
    'Amazon Web Services',
    'DevSecOps',
    'Identity and access management',
    'Encryption and key management',
    'Logging and detection',
    'Network segmentation',
    'CI/CD security',
    ...credentials.filter((c) => c.type !== 'letter').map((c) => c.title),
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle,
    url: SITE_URL,
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: 'ECE Paris',
        url: 'https://www.ece.fr/',
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'Bhagwan Mahavir University',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Paris region',
      addressCountry: 'FR',
    },
    sameAs: [profile.linkedin, profile.github],
    knowsAbout,
    knowsLanguage: [
      { '@type': 'Language', name: 'English' },
      { '@type': 'Language', name: 'French' },
      { '@type': 'Language', name: 'Hindi' },
    ],
    seeks: {
      '@type': 'Demand',
      name: 'End-of-studies internship in cloud security or DevSecOps, from April 2027',
    },
  };

  return (
    <script
      type="application/ld+json"
      // The object is built here from our own content, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
