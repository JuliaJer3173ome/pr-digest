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
 * Loads PR filter configuration from GitHub Actions inputs.
 */
export function loadFilterConfig(): FilterOptions {
  const labels = parseList(core.getInput('filter_labels'));
  const excludeLabels = parseList(core.getInput('exclude_labels'));
  const authors = parseList(core.getInput('filter_authors'));
  const excludeAuthors = parseList(core.getInput('exclude_authors'));
  const minCommentsRaw = core.getInput('min_comments');
  const minComments = minCommentsRaw ? parseInt(minCommentsRaw, 10) : 0;

  if (minCommentsRaw && isNaN(minComments)) {
    throw new Error(`Invalid value for min_comments: "${minCommentsRaw}" is not a number`);
  }

  const config: FilterOptions = {};

  if (labels.length > 0) config.labels = labels;
  if (excludeLabels.length > 0) config.excludeLabels = excludeLabels;
  if (authors.length > 0) config.authors = authors;
  if (excludeAuthors.length > 0) config.excludeAuthors = excludeAuthors;
  if (minComments > 0) config.minComments = minComments;

  return config;
}
