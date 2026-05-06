import * as core from '@actions/core';

export type DiffMode = 'none' | 'summary' | 'full';

export interface DiffConfig {
  mode: DiffMode;
  maxLines: number;
  showFilenames: boolean;
}

export function parseDiffMode(value: string): DiffMode {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'none' || normalized === 'summary' || normalized === 'full') {
    return normalized;
  }
  throw new Error(`Invalid diff mode: "${value}". Expected one of: none, summary, full`);
}

export function parseMaxLines(value: string): number {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0) {
    throw new Error(`Invalid max_diff_lines value: "${value}". Must be a non-negative integer`);
  }
  return num;
}

export function parseBooleanFlag(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  throw new Error(`Invalid boolean value: "${value}"`);
}

export function loadDiffConfig(): DiffConfig {
  const modeRaw = core.getInput('diff_mode') || 'none';
  const maxLinesRaw = core.getInput('max_diff_lines') || '50';
  const showFilenamesRaw = core.getInput('diff_show_filenames') || 'true';

  const mode = parseDiffMode(modeRaw);
  const maxLines = parseMaxLines(maxLinesRaw);
  const showFilenames = parseBooleanFlag(showFilenamesRaw);

  return { mode, maxLines, showFilenames };
}
