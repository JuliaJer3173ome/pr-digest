import { groupPRsByTeam, renderTeamDigest } from '../groupByTeam';
import { loadTeamConfig } from '../../config/teamConfig';
import * as core from '@actions/core';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

interface PR {
  number: number;
  title: string;
  author: string;
}

const samplePRs: PR[] = [
  { number: 1, title: 'Fix login bug', author: 'alice' },
  { number: 2, title: 'Add API endpoint', author: 'carol' },
  { number: 3, title: 'Update styles', author: 'bob' },
  { number: 4, title: 'Refactor utils', author: 'dave' },
];

describe('groupByTeam integration', () => {
  it('groups and renders PRs using loaded config', () => {
    setupInputs({
      team_map: 'frontend:alice|bob, backend:carol',
      highlight_teams: 'backend',
      group_by_team: 'true',
    });

    const config = loadTeamConfig();
    const groups = groupPRsByTeam(samplePRs, config);

    expect(groups['frontend']).toHaveLength(2);
    expect(groups['backend']).toHaveLength(1);
    expect(groups['Other']).toHaveLength(1);

    const output = renderTeamDigest(
      groups,
      config.highlightTeams,
      pr => `[#${pr.number}] ${pr.title} by ${pr.author}`
    );

    expect(output).toContain('🏷️ backend');
    expect(output).toContain('[#2] Add API endpoint by carol');
    expect(output).toContain('### frontend (2)');
    expect(output).toContain('### Other (1)');
  });

  it('renders all PRs under Other when no teams configured', () => {
    setupInputs({ team_map: '', highlight_teams: '', group_by_team: 'false' });
    const config = loadTeamConfig();
    const groups = groupPRsByTeam(samplePRs, config);
    expect(Object.keys(groups)).toEqual(['Other']);
    expect(groups['Other']).toHaveLength(4);
  });
});
