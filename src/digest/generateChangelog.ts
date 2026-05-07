import type { ChangelogConfig, ChangelogGroupBy, ChangelogStyle } from '../config/changelogConfig';

export interface PREntry {
  number: number;
  title: string;
  author: string;
  labels: string[];
  repo: string;
  url: string;
}

function getGroupKey(pr: PREntry, groupBy: ChangelogGroupBy): string {
  if (groupBy === 'author') return pr.author || 'unknown';
  if (groupBy === 'repo') return pr.repo || 'unknown';
  return pr.labels[0] ?? 'uncategorized';
}

function formatItem(pr: PREntry, style: ChangelogStyle, index: number): string {
  const link = `[#${pr.number}](${pr.url})`;
  const line = `${pr.title} ${link} — @${pr.author}`;
  if (style === 'numbered') return `${index + 1}. ${line}`;
  if (style === 'checkbox') return `- [ ] ${line}`;
  return `- ${line}`;
}

function groupPRs(prs: PREntry[], groupBy: ChangelogGroupBy): Map<string, PREntry[]> {
  const groups = new Map<string, PREntry[]>();
  for (const pr of prs) {
    const key = getGroupKey(pr, groupBy);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(pr);
  }
  return groups;
}

export function generateChangelog(prs: PREntry[], config: ChangelogConfig): string {
  if (!config.enabled || prs.length === 0) return '';

  const filteredPRs = config.includeBreaking
    ? prs
    : prs.filter(pr => !pr.labels.includes(config.breakingLabel));

  const groups = groupPRs(filteredPRs, config.groupBy);
  const lines: string[] = [];

  for (const [group, entries] of groups) {
    lines.push(`${config.headerPrefix} ${group}`);
    entries.forEach((pr, i) => {
      lines.push(formatItem(pr, config.style, i));
    });
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
