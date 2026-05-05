export interface PR {
  number: number;
  title: string;
  url: string;
  author?: string;
  mergedAt?: string;
  labels: string[];
}

export interface DigestSection {
  label: string;
  prs: PR[];
}

export function groupByLabel(prs: PR[], labelOrder: string[]): DigestSection[] {
  const map = new Map<string, PR[]>();

  for (const pr of prs) {
    const matched = pr.labels.find((l) => labelOrder.includes(l));
    const key = matched ?? 'other';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(pr);
  }

  const ordered: DigestSection[] = [];

  for (const label of labelOrder) {
    if (map.has(label)) {
      ordered.push({ label, prs: map.get(label)! });
    }
  }

  if (map.has('other')) {
    ordered.push({ label: 'other', prs: map.get('other')! });
  }

  return ordered;
}

export function formatPRLine(pr: PR): string {
  return `- [#${pr.number}](${pr.url}) ${pr.title}`;
}

export function generateDigest(prs: PR[], labelOrder: string[]): string {
  const sections = groupByLabel(prs, labelOrder);
  const parts: string[] = ['# Weekly PR Digest'];

  for (const section of sections) {
    parts.push(`\n### ${section.label}\n`);
    for (const pr of section.prs) {
      parts.push(formatPRLine(pr));
    }
  }

  return parts.join('\n');
}
