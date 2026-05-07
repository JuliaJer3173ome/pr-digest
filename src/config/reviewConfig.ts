import * as core from '@actions/core';

export type ReviewFilterMode = 'any' | 'approved' | 'changes_requested' | 'none';

export interface ReviewConfig {
  filterMode: ReviewFilterMode;
  minApprovals: number;
  excludeBots: boolean;
}

export function parseReviewFilterMode(value: string): ReviewFilterMode {
  const normalized = value.trim().toLowerCase();
  const valid: ReviewFilterMode[] = ['any', 'approved', 'changes_requested', 'none'];
  if (valid.includes(normalized as ReviewFilterMode)) {
    return normalized as ReviewFilterMode;
  }
  core.warning(`Invalid review_filter_mode "${value}", defaulting to "any"`);
  return 'any';
}

export function parseMinApprovals(value: string): number {
  if (!value || value.trim() === '') return 0;
  const parsed = parseInt(value.trim(), 10);
  if (isNaN(parsed) || parsed < 0) {
    core.warning(`Invalid min_approvals "${value}", defaulting to 0`);
    return 0;
  }
  return parsed;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (!value || value.trim() === '') return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  core.warning(`Invalid boolean value "${value}", using default ${defaultValue}`);
  return defaultValue;
}

export function loadReviewConfig(): ReviewConfig {
  const filterMode = parseReviewFilterMode(
    core.getInput('review_filter_mode') || 'any'
  );
  const minApprovals = parseMinApprovals(
    core.getInput('min_approvals')
  );
  const excludeBots = parseBooleanFlag(
    core.getInput('review_exclude_bots'),
    false
  );

  return { filterMode, minApprovals, excludeBots };
}
