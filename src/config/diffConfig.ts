import * as core from '@actions/core';

export type DiffMode = 'none' | 'summary' | 'full';

export interface DiffConfig {
  enabled: boolean;
  mode: DiffMode;
  maxLines: number;
  includeFileList: boolean;
}

export function parseDiffMode(value: string): DiffMode {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'none' || normalized === 'summary' || normalized === 'full') {
    return normalized;
  }
  core.warning(`Invalid diff_mode "${value}", defaulting to "none"`);
  return 'none';
}

export function parseMaxLines(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) {
    core.warning(`Invalid diff_max_lines "${value}", defaulting to 20`);
    return 20;
  }
  return parsed;
}

export function parseBooleanFlag(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}

export function loadDiffConfig(): DiffConfig {
  const enabled = parseBooleanFlag(core.getInput('diff_enabled') || 'false');
  const mode = parseDiffMode(core.getInput('diff_mode') || 'none');
  const maxLines = parseMaxLines(core.getInput('diff_max_lines') || '20');
  const includeFileList = parseBooleanFlag(core.getInput('diff_include_file_list') || 'true');

  return {
    enabled,
    mode,
    maxLines,
    includeFileList,
  };
}
