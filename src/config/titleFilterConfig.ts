import * as core from '@actions/core';

export interface TitleFilterConfig {
  includeTitlePatterns: RegExp[];
  excludeTitlePatterns: RegExp[];
  caseSensitive: boolean;
  enabled: boolean;
}

export function parsePatternList(input: string): RegExp[] {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => new RegExp(p));
}

export function parseBooleanFlag(input: string, defaultValue: boolean): boolean {
  if (!input.trim()) return defaultValue;
  return input.trim().toLowerCase() === 'true';
}

export function loadTitleFilterConfig(): TitleFilterConfig {
  const includeRaw = core.getInput('title_filter_include');
  const excludeRaw = core.getInput('title_filter_exclude');
  const caseSensitiveRaw = core.getInput('title_filter_case_sensitive');
  const enabledRaw = core.getInput('title_filter_enabled');

  const caseSensitive = parseBooleanFlag(caseSensitiveRaw, false);
  const enabled = parseBooleanFlag(enabledRaw, true);

  const flags = caseSensitive ? '' : 'i';

  const includeTitlePatterns = includeRaw.trim()
    ? includeRaw
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => new RegExp(p, flags))
    : [];

  const excludeTitlePatterns = excludeRaw.trim()
    ? excludeRaw
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => new RegExp(p, flags))
    : [];

  return {
    includeTitlePatterns,
    excludeTitlePatterns,
    caseSensitive,
    enabled,
  };
}
