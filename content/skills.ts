/**
 * Four panels, section 6 of the brief. No percentage bars and no star ratings:
 * section 14 rules both out.
 *
 * `icon` names a Simple Icons export from react-icons/si where one exists; the
 * rest render as plain mono tags.
 */

export type SkillPanel = {
  key: 'cloud' | 'security' | 'devsecops' | 'systems';
  tags: Array<{ label: string; icon?: string }>;
};

export const skillPanels: SkillPanel[] = [
  {
    key: 'cloud',
    tags: [
      { label: 'IAM' },
      { label: 'STS' },
      { label: 'KMS' },
      { label: 'S3' },
      { label: 'VPC' },
      { label: 'CloudTrail' },
      { label: 'Config' },
      { label: 'EventBridge' },
      { label: 'SNS' },
      { label: 'Athena' },
      { label: 'Secrets Manager' },
      { label: 'SSM' },
      { label: 'ECR' },
    ],
  },
  {
    key: 'security',
    tags: [
      { label: 'Least privilege' },
      { label: 'Encryption and key management' },
      { label: 'Logging and detection' },
      { label: 'Network segmentation' },
      { label: 'Splunk', icon: 'SiSplunk' },
      { label: 'OverTheWire Bandit (completed)' },
    ],
  },
  {
    key: 'devsecops',
    tags: [
      { label: 'GitHub Actions', icon: 'SiGithubactions' },
      { label: 'Docker', icon: 'SiDocker' },
      { label: 'Terraform', icon: 'SiTerraform' },
      { label: 'Kubernetes (kind)', icon: 'SiKubernetes' },
      { label: 'Trivy' },
      { label: 'Semgrep' },
      { label: 'gitleaks' },
      { label: 'Checkov' },
      { label: 'OWASP ZAP', icon: 'SiOwasp' },
      { label: 'SBOM' },
    ],
  },
  {
    key: 'systems',
    tags: [
      { label: 'Linux', icon: 'SiLinux' },
      { label: 'Bash', icon: 'SiGnubash' },
      { label: 'Git', icon: 'SiGit' },
      { label: 'SQL' },
      { label: 'Python (basics)', icon: 'SiPython' },
      { label: 'JavaScript', icon: 'SiJavascript' },
      { label: 'TypeScript', icon: 'SiTypescript' },
      { label: 'Node.js', icon: 'SiNodedotjs' },
      { label: 'React', icon: 'SiReact' },
      { label: 'Next.js', icon: 'SiNextdotjs' },
    ],
  },
];
