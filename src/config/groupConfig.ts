import * as core from '@actions/core';

export type GroupByField = 'label' | 'author' | 'repository' | 'none';

export interface GroupConfig {
  groupBy: GroupByField;
  showUngrouped: boolean;
  ungroupedLabel: string;
}

export function parseGroupByField(value: string): GroupByField {
  const normalized = value.trim().toLowerCase();
  const valid: GroupByField[] = ['label', 'author', 'repository', 'none'];
  if (valid.includes(normalized as GroupByField)) {
    return normalized as GroupByField;
  }
  core.warning(`Invalid group_by value "${value}", defaulting to "label"`);
  return 'label';
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

export function loadGroupConfig(): GroupConfig {
  const groupBy = parseGroupByField(core.getInput('group_by') || 'label');
  const showUngrouped = parseBooleanFlag(core.getInput('show_ungrouped'), true);
  const ungroupedLabel = core.getInput('ungrouped_label') || 'Other';

  return {
    groupBy,
    showUngrouped,
    ungroupedLabel,
  };
}
