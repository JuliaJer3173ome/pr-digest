import * as core from '@actions/core';

export interface PRAgeLimitConfig {
  enabled: boolean;
  maxAgeDays: number | null;
  minAgeDays: number | null;
  warnOldPRs: boolean;
}

export function parseBooleanFlag(value: string, defaultValue = false): boolean {
  if (!value) return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

export function parseAgeDays(value: string, label: string): number | null {
  if (!value || value.trim() === '') return null;
  const parsed = parseInt(value.trim(), 10);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid ${label}: must be a non-negative integer, got "${value}"`);
  }
  return parsed;
}

export function loadPRAgeConfig(): PRAgeLimitConfig {
  const enabled = parseBooleanFlag(core.getInput('pr_age_filter_enabled'), false);
  const maxAgeDays = parseAgeDays(core.getInput('pr_max_age_days'), 'pr_max_age_days');
  const minAgeDays = parseAgeDays(core.getInput('pr_min_age_days'), 'pr_min_age_days');
  const warnOldPRs = parseBooleanFlag(core.getInput('pr_warn_old'), false);

  if (
    minAgeDays !== null &&
    maxAgeDays !== null &&
    minAgeDays > maxAgeDays
  ) {
    throw new Error(
      `pr_min_age_days (${minAgeDays}) cannot be greater than pr_max_age_days (${maxAgeDays})`
    );
  }

  return { enabled, maxAgeDays, minAgeDays, warnOldPRs };
}
