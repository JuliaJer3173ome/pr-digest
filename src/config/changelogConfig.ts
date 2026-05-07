import * as core from '@actions/core';

export type ChangelogGroupBy = 'label' | 'author' | 'repo';
export type ChangelogStyle = 'bullet' | 'numbered' | 'checkbox';

export interface ChangelogConfig {
  enabled: boolean;
  groupBy: ChangelogGroupBy;
  style: ChangelogStyle;
  includeBreaking: boolean;
  breakingLabel: string;
  headerPrefix: string;
}

export function parseChangelogGroupBy(value: string): ChangelogGroupBy {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'label' || normalized === 'author' || normalized === 'repo') {
    return normalized;
  }
  core.warning(`Invalid changelog group-by "${value}", falling back to "label"`);
  return 'label';
}

export function parseChangelogStyle(value: string): ChangelogStyle {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'bullet' || normalized === 'numbered' || normalized === 'checkbox') {
    return normalized as ChangelogStyle;
  }
  core.warning(`Invalid changelog style "${value}", falling back to "bullet"`);
  return 'bullet';
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

export function loadChangelogConfig(): ChangelogConfig {
  const enabled = parseBooleanFlag(core.getInput('changelog_enabled'), false);
  const groupBy = parseChangelogGroupBy(core.getInput('changelog_group_by') || 'label');
  const style = parseChangelogStyle(core.getInput('changelog_style') || 'bullet');
  const includeBreaking = parseBooleanFlag(core.getInput('changelog_include_breaking'), true);
  const breakingLabel = core.getInput('changelog_breaking_label') || 'breaking-change';
  const headerPrefix = core.getInput('changelog_header_prefix') || '##';

  return { enabled, groupBy, style, includeBreaking, breakingLabel, headerPrefix };
}
