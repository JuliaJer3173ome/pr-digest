import { TeamConfig } from '../config/teamConfig';

export interface PRWithAuthor {
  number: number;
  title: string;
  author: string;
  [key: string]: unknown;
}

export function resolveTeam(
  author: string,
  teams: Record<string, string[]>
): string | null {
  for (const [team, members] of Object.entries(teams)) {
    if (members.includes(author)) return team;
  }
  return null;
}

export function groupPRsByTeam<T extends PRWithAuthor>(
  prs: T[],
  config: TeamConfig
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const pr of prs) {
    const team = resolveTeam(pr.author, config.teams) ?? 'Other';
    if (!groups[team]) groups[team] = [];
    groups[team].push(pr);
  }

  return groups;
}

export function renderTeamDigest<T extends PRWithAuthor>(
  groups: Record<string, T[]>,
  highlightTeams: string[],
  formatLine: (pr: T) => string
): string {
  const sections: string[] = [];

  const sortedTeams = Object.keys(groups).sort((a, b) => {
    const aHighlighted = highlightTeams.includes(a) ? 0 : 1;
    const bHighlighted = highlightTeams.includes(b) ? 0 : 1;
    if (aHighlighted !== bHighlighted) return aHighlighted - bHighlighted;
    return a.localeCompare(b);
  });

  for (const team of sortedTeams) {
    const prs = groups[team];
    const header = highlightTeams.includes(team)
      ? `### 🏷️ ${team} (${prs.length})`
      : `### ${team} (${prs.length})`;
    const lines = prs.map(pr => `- ${formatLine(pr)}`);
    sections.push([header, ...lines].join('\n'));
  }

  return sections.join('\n\n');
}
