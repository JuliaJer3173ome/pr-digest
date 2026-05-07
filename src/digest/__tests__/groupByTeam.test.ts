import { resolveTeam, groupPRsByTeam, renderTeamDigest } from '../groupByTeam';
import { TeamConfig } from '../../config/teamConfig';

const teams: Record<string, string[]> = {
  frontend: ['alice', 'bob'],
  backend: ['carol'],
};

const makeConfig = (overrides: Partial<TeamConfig> = {}): TeamConfig => ({
  teams,
  highlightTeams: [],
  groupByTeam: true,
  ...overrides,
});

const makePR = (number: number, author: string) => ({
  number,
  title: `PR #${number}`,
  author,
});

describe('resolveTeam', () => {
  it('resolves known author to their team', () => {
    expect(resolveTeam('alice', teams)).toBe('frontend');
    expect(resolveTeam('carol', teams)).toBe('backend');
  });

  it('returns null for unknown author', () => {
    expect(resolveTeam('unknown', teams)).toBeNull();
  });
});

describe('groupPRsByTeam', () => {
  it('groups PRs by team correctly', () => {
    const prs = [makePR(1, 'alice'), makePR(2, 'carol'), makePR(3, 'bob')];
    const result = groupPRsByTeam(prs, makeConfig());
    expect(result['frontend']).toHaveLength(2);
    expect(result['backend']).toHaveLength(1);
  });

  it('puts unknown authors in "Other" group', () => {
    const prs = [makePR(1, 'ghost')];
    const result = groupPRsByTeam(prs, makeConfig());
    expect(result['Other']).toHaveLength(1);
  });

  it('returns empty object for empty PR list', () => {
    expect(groupPRsByTeam([], makeConfig())).toEqual({});
  });
});

describe('renderTeamDigest', () => {
  const formatLine = (pr: { number: number; title: string }) =>
    `[#${pr.number}] ${pr.title}`;

  it('renders sections for each team', () => {
    const groups = {
      frontend: [makePR(1, 'alice')],
      backend: [makePR(2, 'carol')],
    };
    const output = renderTeamDigest(groups, [], formatLine);
    expect(output).toContain('### frontend (1)');
    expect(output).toContain('### backend (1)');
  });

  it('highlights specified teams with emoji', () => {
    const groups = { frontend: [makePR(1, 'alice')] };
    const output = renderTeamDigest(groups, ['frontend'], formatLine);
    expect(output).toContain('### 🏷️ frontend (1)');
  });

  it('sorts highlighted teams before others', () => {
    const groups = {
      other: [makePR(3, 'ghost')],
      frontend: [makePR(1, 'alice')],
    };
    const output = renderTeamDigest(groups, ['frontend'], formatLine);
    const frontendIdx = output.indexOf('frontend');
    const otherIdx = output.indexOf('other');
    expect(frontendIdx).toBeLessThan(otherIdx);
  });
});
