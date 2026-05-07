import * as core from '@actions/core';

export interface TeamConfig {
  teams: Record<string, string[]>; // team name -> list of GitHub logins
  highlightTeams: string[];
  groupByTeam: boolean;
}

export function parseTeamMap(input: string): Record<string, string[]> {
  if (!input.trim()) return {};
  const result: Record<string, string[]> = {};
  const entries = input.split(',').map(e => e.trim()).filter(Boolean);
  for (const entry of entries) {
    const colonIdx = entry.indexOf(':');
    if (colonIdx === -1) continue;
    const teamName = entry.slice(0, colonIdx).trim();
    const members = entry
      .slice(colonIdx + 1)
      .split('|')
      .map(m => m.trim())
      .filter(Boolean);
    if (teamName && members.length > 0) {
      result[teamName] = members;
    }
  }
  return result;
}

export function parseHighlightTeams(input: string): string[] {
  if (!input.trim()) return [];
  return input.split(',').map(t => t.trim()).filter(Boolean);
}

export function parseBooleanFlag(input: string, defaultValue: boolean): boolean {
  const val = input.trim().toLowerCase();
  if (val === 'true') return true;
  if (val === 'false') return false;
  return defaultValue;
}

export function loadTeamConfig(): TeamConfig {
  const teamsRaw = core.getInput('team_map');
  const highlightRaw = core.getInput('highlight_teams');
  const groupByTeamRaw = core.getInput('group_by_team');

  return {
    teams: parseTeamMap(teamsRaw),
    highlightTeams: parseHighlightTeams(highlightRaw),
    groupByTeam: parseBooleanFlag(groupByTeamRaw, false),
  };
}
