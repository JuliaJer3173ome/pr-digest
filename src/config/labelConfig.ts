import * as core from '@actions/core';

export interface LabelConfig {
  includeLabels: string[];
  excludeLabels: string[];
  labelAliases: Record<string, string>;
  unlabeledGroupName: string;
}

export function parseLabels(input: string): string[] {
  if (!input || input.trim() === '') return [];
  return input
    .split(',')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export function parseLabelAliases(input: string): Record<string, string> {
  if (!input || input.trim() === '') return {};
  const aliases: Record<string, string> = {};
  const pairs = input.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) {
      core.warning(`Invalid label alias entry (missing '='): "${pair}"`);
      continue;
    }
    const key = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    if (key && value) {
      aliases[key] = value;
    } else {
      core.warning(`Invalid label alias entry (empty key or value): "${pair}"`);
    }
  }
  return aliases;
}

export function loadLabelConfig(): LabelConfig {
  const includeLabels = parseLabels(core.getInput('include_labels'));
  const excludeLabels = parseLabels(core.getInput('exclude_labels'));
  const labelAliases = parseLabelAliases(core.getInput('label_aliases'));
  const unlabeledGroupName =
    core.getInput('unlabeled_group_name').trim() || 'Unlabeled';

  return {
    includeLabels,
    excludeLabels,
    labelAliases,
    unlabeledGroupName,
  };
}
