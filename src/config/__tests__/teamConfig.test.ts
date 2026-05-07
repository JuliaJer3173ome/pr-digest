import { parseTeamMap, parseHighlightTeams, parseBooleanFlag, loadTeamConfig } from '../teamConfig';
import * as core from '@actions/core';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

describe('parseTeamMap', () => {
  it('parses a valid team map', () => {
    const result = parseTeamMap('frontend:alice|bob, backend:carol|dave');
    expect(result).toEqual({ frontend: ['alice', 'bob'], backend: ['carol', 'dave'] });
  });

  it('returns empty object for empty input', () => {
    expect(parseTeamMap('')).toEqual({});
  });

  it('skips entries without colon', () => {
    const result = parseTeamMap('frontend:alice|bob, badentry');
    expect(result).toEqual({ frontend: ['alice', 'bob'] });
  });

  it('handles single member teams', () => {
    const result = parseTeamMap('solo:alice');
    expect(result).toEqual({ solo: ['alice'] });
  });
});

describe('parseHighlightTeams', () => {
  it('parses comma-separated team names', () => {
    expect(parseHighlightTeams('frontend, backend')).toEqual(['frontend', 'backend']);
  });

  it('returns empty array for empty input', () => {
    expect(parseHighlightTeams('')).toEqual([]);
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default for unknown value', () => {
    expect(parseBooleanFlag('', false)).toBe(false);
    expect(parseBooleanFlag('yes', true)).toBe(true);
  });
});

describe('loadTeamConfig', () => {
  it('loads full config from inputs', () => {
    setupInputs({
      team_map: 'frontend:alice|bob',
      highlight_teams: 'frontend',
      group_by_team: 'true',
    });
    const config = loadTeamConfig();
    expect(config.teams).toEqual({ frontend: ['alice', 'bob'] });
    expect(config.highlightTeams).toEqual(['frontend']);
    expect(config.groupByTeam).toBe(true);
  });

  it('uses defaults when inputs are empty', () => {
    setupInputs({});
    const config = loadTeamConfig();
    expect(config.teams).toEqual({});
    expect(config.highlightTeams).toEqual([]);
    expect(config.groupByTeam).toBe(false);
  });
});
