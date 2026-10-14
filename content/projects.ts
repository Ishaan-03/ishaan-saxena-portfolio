/**
 * Structural data only: slugs, links, tags and numbers. Every sentence lives in
 * messages/[locale].json under `projects.items.<slug>`, so Phase 6 can translate
 * the prose without touching this file.
 *
 * Facts come from section 6 of the brief and each repo's README. Nothing here is
 * invented. Where the two disagree, the discrepancy is recorded in PROGRESS.md.
 */

export type CoverId = 'gatekeeper' | 'northbeam-lite' | 'vpc' | 'data-protection' | 'detection';

export type Project = {
  slug: CoverId;
  repo: string;
  /** Anchor the hero cards link to: #project-<slug>. */
  anchor: string;
  tags: string[];
  /** Headline figures for the detail page. Keys resolve in messages. */
  numbers?: Array<{ key: string; value: string }>;
  /** Optional real screenshot, overriding the generated cover. */
  coverImage?: string;
  links?: Array<{ key: string; url: string }>;
};

export const projects: Project[] = [
  {
    slug: 'gatekeeper',
    repo: 'https://github.com/Ishaan-03/gatekeeper',
    anchor: 'project-gatekeeper',
    tags: [
      'GitHub Actions',
      'Docker',
      'Terraform',
      'Kubernetes',
      'Trivy',
      'Semgrep',
      'gitleaks',
      'Checkov',
      'OWASP ZAP',
      'OIDC',
      'ECR',
    ],
    numbers: [
      { key: 'imageSize', value: '1.11 GB → 125 MB' },
      { key: 'cves', value: '344 → 44' },
      { key: 'semgrep', value: '5 → 0' },
      { key: 'checkov', value: '6 → 0' },
      { key: 'zap', value: '1 / 3 → 0 / 0' },
      { key: 'keys', value: '0' },
    ],
    links: [
      {
        key: 'greenRun',
        url: 'https://github.com/Ishaan-03/gatekeeper/actions/runs/38358607355',
      },
      { key: 'blockedPr', url: 'https://github.com/Ishaan-03/gatekeeper/pull/6' },
    ],
  },
  {
    slug: 'northbeam-lite',
    repo: 'https://github.com/Ishaan-03/northbeam-lite',
    anchor: 'project-northbeam-lite',
    tags: ['IAM', 'STS', 'ABAC', 'Permissions boundaries', 'OIDC', 'IMDSv2', 'AWS CLI'],
  },
  {
    slug: 'vpc',
    repo: 'https://github.com/Ishaan-03/aws-multi-tier-vpc-architecture',
    anchor: 'project-vpc',
    tags: ['VPC', 'Subnets', 'Security groups', 'NACL', 'VPC endpoints', 'SSM'],
  },
  {
    slug: 'data-protection',
    repo: 'https://github.com/Ishaan-03/aws-data-protection-secrets-management',
    anchor: 'project-data-protection',
    tags: [
      'KMS',
      'S3',
      'SSE-KMS',
      'Secrets Manager',
      'Parameter Store',
      'Lambda',
      'AWS Encryption SDK',
    ],
    numbers: [{ key: 'cost', value: '< $5' }],
  },
  {
    slug: 'detection',
    repo: 'https://github.com/Ishaan-03/aws-detection-logging-monitoring',
    anchor: 'project-detection',
    tags: ['CloudTrail', 'VPC Flow Logs', 'AWS Config', 'EventBridge', 'SNS', 'Athena', 'S3'],
  },
];

export const projectSlugs = projects.map((project) => project.slug);

export function projectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

/** Previous and next, for the detail page footer. */
export function projectNeighbours(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };

  return {
    previous: index > 0 ? projects[index - 1] : undefined,
    next: index < projects.length - 1 ? projects[index + 1] : undefined,
  };
}

/**
 * The compact row under the featured projects. Section 6 of the brief is
 * explicit that most of these repos have no README, so nothing is added beyond
 * the single line it gives for each. Checked: all five return 200.
 */
export const earlierWork = [
  {
    slug: 'acme',
    repo: 'https://github.com/Ishaan-03/Acme',
    stack: ['Next.js', 'NextAuth', 'Vercel Postgres'],
  },
  {
    slug: 'buzznest',
    repo: 'https://github.com/Ishaan-03/BuzzNest',
    stack: ['TypeScript', 'Express.js'],
  },
  {
    slug: 'echoed-thoughts',
    repo: 'https://github.com/Ishaan-03/Echoed-thoughts',
    stack: ['Hono', 'Cloudflare Workers'],
  },
  { slug: 'payverse', repo: 'https://github.com/Ishaan-03/PayVerse', stack: ['JavaScript'] },
  { slug: 'carluxe', repo: 'https://github.com/Ishaan-03/CarLuxe', stack: ['TypeScript'] },
] as const;
