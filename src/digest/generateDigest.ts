import { PullRequest } from '../github/fetchMergedPRs';

export interface DigestOptions {
  weekStart: string;
  weekEnd: string;
  repoName: string;
}

export interface DigestSection {
  title: string;
  prs: PullRequest[];
}

function groupByLabel(prs: PullRequest[]): Record<string, PullRequest[]> {
  const groups: Record<string, PullRequest[]> = {
    features: [],
    bugfixes: [],
    chores: [],
    other: [],
  };

  for (const pr of prs) {
    const labels = pr.labels.map((l) => l.name.toLowerCase());
    if (labels.some((l) => l.includes('feature') || l.includes('enhancement'))) {
      groups.features.push(pr);
    } else if (labels.some((l) => l.includes('bug') || l.includes('fix'))) {
      groups.bugfixes.push(pr);
    } else if (labels.some((l) => l.includes('chore') || l.includes('maintenance'))) {
      groups.chores.push(pr);
    } else {
      groups.other.push(pr);
    }
  }

  return groups;
}

function formatPRLine(pr: PullRequest): string {
  return `- [#${pr.number} ${pr.title}](${pr.html_url}) by @${pr.user.login}`;
}

export function generateDigest(prs: PullRequest[], options: DigestOptions): string {
  const { weekStart, weekEnd, repoName } = options;
  const lines: string[] = [];

  lines.push(`# Weekly PR Digest — ${repoName}`);
  lines.push(`**Period:** ${weekStart} → ${weekEnd}`);
  lines.push(`**Total merged PRs:** ${prs.length}`);
  lines.push('');

  if (prs.length === 0) {
    lines.push('_No pull requests were merged this week._');
    return lines.join('\n');
  }

  const groups = groupByLabel(prs);
  const sectionMap: DigestSection[] = [
    { title: '🚀 Features', prs: groups.features },
    { title: '🐛 Bug Fixes', prs: groups.bugfixes },
    { title: '🔧 Chores', prs: groups.chores },
    { title: '📦 Other', prs: groups.other },
  ];

  for (const section of sectionMap) {
    if (section.prs.length === 0) continue;
    lines.push(`## ${section.title}`);
    lines.push('');
    section.prs.forEach((pr) => lines.push(formatPRLine(pr)));
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
