import * as core from '@actions/core';

export type SizeBucket = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface SizeThresholds {
  xs: number;
  s: number;
  m: number;
  l: number;
}

export interface SizeConfig {
  enabled: boolean;
  thresholds: SizeThresholds;
  excludeMergeCommits: boolean;
}

const DEFAULT_THRESHOLDS: SizeThresholds = {
  xs: 10,
  s: 50,
  m: 250,
  l: 1000,
};

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

export function parseSizeThresholds(raw: string): SizeThresholds {
  if (!raw || raw.trim() === '') return DEFAULT_THRESHOLDS;

  const parts = raw.split(',').map((p) => p.trim());
  if (parts.length !== 4) {
    core.warning(
      `size-thresholds expects 4 comma-separated values (xs,s,m,l). Got: "${raw}". Using defaults.`
    );
    return DEFAULT_THRESHOLDS;
  }

  const [xs, s, m, l] = parts.map(Number);
  if ([xs, s, m, l].some((n) => isNaN(n) || n < 0)) {
    core.warning(`size-thresholds contains invalid numbers. Using defaults.`);
    return DEFAULT_THRESHOLDS;
  }

  if (xs >= s || s >= m || m >= l) {
    core.warning(`size-thresholds must be strictly ascending (xs < s < m < l). Using defaults.`);
    return DEFAULT_THRESHOLDS;
  }

  return { xs, s, m, l };
}

export function loadSizeConfig(): SizeConfig {
  const enabled = parseBooleanFlag(core.getInput('size-label-enabled'), false);
  const thresholds = parseSizeThresholds(core.getInput('size-thresholds'));
  const excludeMergeCommits = parseBooleanFlag(
    core.getInput('size-exclude-merge-commits'),
    true
  );

  return { enabled, thresholds, excludeMergeCommits };
}
