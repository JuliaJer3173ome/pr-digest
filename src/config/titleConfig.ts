import * as core from '@actions/core';

export interface TitleConfig {
  titleFilter: string[];
  titleExclude: string[];
  titleCaseSensitive: boolean;
}

export function parseTitlePatterns(input: string): string[] {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function parseBooleanFlag(input: string, defaultValue: boolean): boolean {
  const val = input.trim().toLowerCase();
  if (val === 'true') return true;
  if (val === 'false') return false;
  return defaultValue;
}

export function loadTitleConfig(): TitleConfig {
  const titleFilter = parseTitlePatterns(
    core.getInput('title_filter')
  );
  const titleExclude = parseTitlePatterns(
    core.getInput('title_exclude')
  );
  const titleCaseSensitive = parseBooleanFlag(
    core.getInput('title_case_sensitive'),
    false
  );

  return { titleFilter, titleExclude, titleCaseSensitive };
}
