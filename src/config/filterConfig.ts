import * as core from '@actions/core';
import { FilterOptions } from '../digest/filterPRs';

/**
 * Parses a comma-separated input string into a trimmed string array.
 * Returns an empty array if the input is blank.
 */
function parseList(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parses a raw string as a non-negative integer.
 * Throws a descriptive error if the value is not a valid number.
 * Returns the provided default if the raw string is empty.
 */
function parseNonNegativeInt(raw: string, fieldName: string, defaultValue: number): number {
  if (!raw.trim()) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid value for ${fieldName}: "${raw}" must be a non-negative integer`);
  }
  return parsed;
}

/**
 * Loads PR filter configuration from GitHub Actions inputs.
 */
export function loadFilterConfig(): FilterOptions {
  const labels = parseList(core.getInput('filter_labels'));
  const excludeLabels = parseList(core.getInput('exclude_labels'));
  const authors = parseList(core.getInput('filter_authors'));
  const excludeAuthors = parseList(core.getInput('exclude_authors'));
  const minComments = parseNonNegativeInt(core.getInput('min_comments'), 'min_comments', 0);

  const config: FilterOptions = {};

  if (labels.length > 0) config.labels = labels;
  if (excludeLabels.length > 0) config.excludeLabels = excludeLabels;
  if (authors.length > 0) config.authors = authors;
  if (excludeAuthors.length > 0) config.excludeAuthors = excludeAuthors;
  if (minComments > 0) config.minComments = minComments;

  return config;
}
