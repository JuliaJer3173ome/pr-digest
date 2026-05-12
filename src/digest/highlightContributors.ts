import { ContributorConfig } from '../config/contributorConfig';

export interface PRWithAuthor {
  number: number;
  title: string;
  author: string;
  mergedAt: string;
}

export interface ContributorStat {
  author: string;
  prCount: number;
}

export function isBot(author: string, botPatterns: string[]): boolean {
  const lower = author.toLowerCase();
  return botPatterns.some((pattern) => lower.includes(pattern.toLowerCase()));
}

export function countByAuthor<T extends PRWithAuthor>(
  prs: T[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const pr of prs) {
    counts.set(pr.author, (counts.get(pr.author) ?? 0) + 1);
  }
  return counts;
}

export function computeTopContributors<T extends PRWithAuthor>(
  prs: T[],
  config: ContributorConfig
): ContributorStat[] {
  const filtered = config.excludeBots
    ? prs.filter((pr) => !isBot(pr.author, config.botPatterns))
    : prs;

  const counts = countByAuthor(filtered);

  return Array.from(counts.entries())
    .map(([author, prCount]) => ({ author, prCount }))
    .sort((a, b) => b.prCount - a.prCount || a.author.localeCompare(b.author))
    .slice(0, config.topContributorsCount);
}

export function renderContributorsBlock(
  contributors: ContributorStat[]
): string {
  if (contributors.length === 0) return '';

  const lines = [
    '## 🏆 Top Contributors',
    '',
    ...contributors.map(
      (c, i) =>
        `${i + 1}. **${c.author}** — ${c.prCount} PR${c.prCount !== 1 ? 's' : ''}`
    ),
    '',
  ];

  return lines.join('\n');
}

export function injectContributorsIntoDigest(
  digest: string,
  contributors: ContributorStat[]
): string {
  const block = renderContributorsBlock(contributors);
  if (!block) return digest;
  return `${digest}\n${block}`;
}
