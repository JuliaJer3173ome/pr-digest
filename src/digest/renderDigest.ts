import { generateDigest, DigestOptions } from './generateDigest';
import { PullRequest } from '../github/fetchMergedPRs';

export interface RenderResult {
  markdown: string;
  slackText: string;
  stats: {
    total: number;
    byLabel: Record<string, number>;
  };
}

function toSlackText(markdown: string): string {
  return markdown
    .replace(/^#{1,3} (.+)$/gm, '*$1*')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>')
    .replace(/^- /gm, '• ')
    .replace(/_([^_]+)_/g, '_$1_');
}

function computeStats(prs: PullRequest[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const pr of prs) {
    if (pr.labels.length === 0) {
      counts['unlabeled'] = (counts['unlabeled'] ?? 0) + 1;
    }
    for (const label of pr.labels) {
      counts[label.name] = (counts[label.name] ?? 0) + 1;
    }
  }
  return counts;
}

export function renderDigest(
  prs: PullRequest[],
  options: DigestOptions
): RenderResult {
  const markdown = generateDigest(prs, options);
  const slackText = toSlackText(markdown);
  const byLabel = computeStats(prs);

  return {
    markdown,
    slackText,
    stats: {
      total: prs.length,
      byLabel,
    },
  };
}
