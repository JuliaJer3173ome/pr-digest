import * as core from '@actions/core';

export interface BranchConfig {
  includeBranches: string[];
  excludeBranches: string[];
  baseBranch: string;
  enabled: boolean;
}

export function parseBranchList(input: string): string[] {
  if (!input || !input.trim()) return [];
  return input
    .split(',')
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}

export function parseBaseBranch(input: string, fallback = 'main'): string {
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function parseBooleanFlag(input: string, fallback = false): boolean {
  if (!input || !input.trim()) return fallback;
  return input.trim().toLowerCase() === 'true';
}

export function loadBranchConfig(): BranchConfig {
  const includeBranches = parseBranchList(
    core.getInput('filter_include_branches')
  );
  const excludeBranches = parseBranchList(
    core.getInput('filter_exclude_branches')
  );
  const baseBranch = parseBaseBranch(
    core.getInput('filter_base_branch'),
    'main'
  );
  const enabled = parseBooleanFlag(
    core.getInput('filter_branches_enabled'),
    false
  );

  return { includeBranches, excludeBranches, baseBranch, enabled };
}
