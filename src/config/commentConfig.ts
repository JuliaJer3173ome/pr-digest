import * as core from '@actions/core';

export type CommentFilterMode = 'any' | 'none' | 'min';

export interface CommentConfig {
  filterMode: CommentFilterMode;
  minComments: number;
  includeReviewComments: boolean;
}

export function parseCommentFilterMode(value: string): CommentFilterMode {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'any' || normalized === 'none' || normalized === 'min') {
    return normalized;
  }
  throw new Error(`Invalid comment filter mode: "${value}". Expected 'any', 'none', or 'min'.`);
}

export function parseMinComments(value: string): number {
  const parsed = parseInt(value.trim(), 10);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid min-comments value: "${value}". Must be a non-negative integer.`);
  }
  return parsed;
}

export function parseBooleanFlag(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === '') return false;
  throw new Error(`Invalid boolean value: "${value}".`);
}

export function loadCommentConfig(): CommentConfig {
  const rawMode = core.getInput('comment-filter-mode') || 'any';
  const rawMin = core.getInput('min-comments') || '0';
  const rawIncludeReview = core.getInput('include-review-comments') || 'true';

  return {
    filterMode: parseCommentFilterMode(rawMode),
    minComments: parseMinComments(rawMin),
    includeReviewComments: parseBooleanFlag(rawIncludeReview),
  };
}
