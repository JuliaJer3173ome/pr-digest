import * as core from '@actions/core';

export interface AssigneeConfig {
  includeAssignees: string[];
  excludeAssignees: string[];
  requireAssigned: boolean;
  showAssignees: boolean;
}

export function parseAssigneeList(input: string): string[] {
  if (!input || !input.trim()) return [];
  return input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function parseBooleanFlag(input: string, defaultValue: boolean): boolean {
  const normalized = input.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return defaultValue;
}

export function loadAssigneeConfig(): AssigneeConfig {
  const includeAssignees = parseAssigneeList(
    core.getInput('include_assignees')
  );
  const excludeAssignees = parseAssigneeList(
    core.getInput('exclude_assignees')
  );
  const requireAssigned = parseBooleanFlag(
    core.getInput('require_assigned'),
    false
  );
  const showAssignees = parseBooleanFlag(
    core.getInput('show_assignees'),
    true
  );

  return {
    includeAssignees,
    excludeAssignees,
    requireAssigned,
    showAssignees,
  };
}
