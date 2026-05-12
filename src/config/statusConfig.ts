import * as core from '@actions/core';

export type PRStatusFilter = 'all' | 'merged' | 'closed' | 'open';
export type StatusMatchMode = 'any' | 'all';

export interface StatusConfig {
  includeStatuses: PRStatusFilter[];
  excludeStatuses: PRStatusFilter[];
  matchMode: StatusMatchMode;
  enabled: boolean;
}

const VALID_STATUSES: PRStatusFilter[] = ['all', 'merged', 'closed', 'open'];

export function parseStatusList(input: string): PRStatusFilter[] {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map((s) => s.trim().toLowerCase() as PRStatusFilter)
    .filter((s) => VALID_STATUSES.includes(s));
}

export function parseMatchMode(input: string): StatusMatchMode {
  const val = input.trim().toLowerCase();
  if (val === 'all') return 'all';
  return 'any';
}

export function parseBooleanFlag(input: string): boolean {
  return input.trim().toLowerCase() === 'true';
}

export function loadStatusConfig(): StatusConfig {
  const includeRaw = core.getInput('status_include');
  const excludeRaw = core.getInput('status_exclude');
  const matchModeRaw = core.getInput('status_match_mode');
  const enabledRaw = core.getInput('status_filter_enabled');

  return {
    includeStatuses: parseStatusList(includeRaw),
    excludeStatuses: parseStatusList(excludeRaw),
    matchMode: parseMatchMode(matchModeRaw),
    enabled: enabledRaw === '' ? true : parseBooleanFlag(enabledRaw),
  };
}
