import * as core from '@actions/core';

export type MilestoneFilterMode = 'any' | 'none' | 'specific';

export interface MilestoneConfig {
  filterMode: MilestoneFilterMode;
  milestones: string[];
  includeNoMilestone: boolean;
}

export function parseMilestoneFilterMode(value: string): MilestoneFilterMode {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'any' || normalized === 'none' || normalized === 'specific') {
    return normalized;
  }
  core.warning(`Invalid milestone_filter_mode "${value}", defaulting to "any"`);
  return 'any';
}

export function parseMilestoneList(value: string): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (!value || !value.trim()) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  core.warning(`Invalid boolean value "${value}", using default ${defaultValue}`);
  return defaultValue;
}

export function loadMilestoneConfig(): MilestoneConfig {
  const filterMode = parseMilestoneFilterMode(
    core.getInput('milestone_filter_mode') || 'any'
  );
  const milestones = parseMilestoneList(core.getInput('milestones') || '');
  const includeNoMilestone = parseBooleanFlag(
    core.getInput('include_no_milestone'),
    true
  );

  if (filterMode === 'specific' && milestones.length === 0) {
    core.warning(
      'milestone_filter_mode is "specific" but no milestones provided; all PRs will be included'
    );
  }

  return { filterMode, milestones, includeNoMilestone };
}
