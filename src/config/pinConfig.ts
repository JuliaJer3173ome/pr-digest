import * as core from '@actions/core';

export interface PinConfig {
  enabled: boolean;
  pinnedLabels: string[];
  pinnedAuthors: string[];
  pinnedPRNumbers: number[];
  pinToTop: boolean;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

export function parsePinnedPRNumbers(value: string): number[] {
  if (!value.trim()) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);
}

export function parseStringList(value: string): string[] {
  if (!value.trim()) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadPinConfig(): PinConfig {
  const enabled = parseBooleanFlag(core.getInput('pin_enabled'), false);
  const pinnedLabels = parseStringList(core.getInput('pin_labels'));
  const pinnedAuthors = parseStringList(core.getInput('pin_authors'));
  const pinnedPRNumbers = parsePinnedPRNumbers(core.getInput('pin_pr_numbers'));
  const pinToTop = parseBooleanFlag(core.getInput('pin_to_top'), true);

  return {
    enabled,
    pinnedLabels,
    pinnedAuthors,
    pinnedPRNumbers,
    pinToTop,
  };
}
