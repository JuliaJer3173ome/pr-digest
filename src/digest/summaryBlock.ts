import { SummaryConfig } from '../config/summaryConfig';

export interface PRSummaryInput {
  title: string;
  author: string;
  labels: string[];
}

export interface DigestSummary {
  totalCount: number;
  uniqueAuthors: number;
  labelCounts: Record<string, number>;
}

export function computeDigestSummary(prs: PRSummaryInput[]): DigestSummary {
  const authors = new Set(prs.map((pr) => pr.author));
  const labelCounts: Record<string, number> = {};

  for (const pr of prs) {
    for (const label of pr.labels) {
      labelCounts[label] = (labelCounts[label] ?? 0) + 1;
    }
  }

  return {
    totalCount: prs.length,
    uniqueAuthors: authors.size,
    labelCounts,
  };
}

export function renderSummaryBlock(
  summary: DigestSummary,
  config: SummaryConfig
): string {
  if (!config.includeSummary || config.summaryPosition === 'none') {
    return '';
  }

  const lines: string[] = ['## Summary'];

  if (config.showTotalCount) {
    lines.push(`- **Total PRs merged:** ${summary.totalCount}`);
  }

  if (config.showAuthorCount) {
    lines.push(`- **Unique authors:** ${summary.uniqueAuthors}`);
  }

  if (config.showLabelBreakdown && Object.keys(summary.labelCounts).length > 0) {
    lines.push('- **Labels:**');
    // Sort labels by count descending for easier scanning
    const sortedLabels = Object.entries(summary.labelCounts).sort(
      ([, a], [, b]) => b - a
    );
    for (const [label, count] of sortedLabels) {
      lines.push(`  - \`${label}\`: ${count}`);
    }
  }

  return lines.join('\n');
}

export function injectSummaryIntoDigest(
  digest: string,
  summaryBlock: string,
  position: 'top' | 'bottom'
): string {
  if (!summaryBlock) return digest;
  if (position === 'top') {
    return `${summaryBlock}\n\n${digest}`;
  }
  return `${digest}\n\n${summaryBlock}`;
}
