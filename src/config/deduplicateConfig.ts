/**
 * Configuration loader for the deduplication feature.
 *
 * Reads the `deduplicate-prs` GitHub Actions input and returns a typed config
 * object consumed by the deduplication step in the digest pipeline.
 */

import * as core from '@actions/core';

export interface DeduplicateConfig {
  /** Whether PR deduplication is enabled. Defaults to true. */
  enabled: boolean;
}

/**
 * Parses a boolean-like string ("true" / "false") coming from an Actions input.
 * Returns the provided `defaultValue` when the input is empty.
 */
export function parseBooleanInput(raw: string, defaultValue: boolean): boolean {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === '') return defaultValue;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  throw new Error(`Invalid boolean input: "${raw}". Expected "true" or "false".`);
}

/**
 * Loads the deduplication configuration from GitHub Actions inputs.
 */
export function loadDeduplicateConfig(): DeduplicateConfig {
  const raw = core.getInput('deduplicate-prs');
  const enabled = parseBooleanInput(raw, true);
  return { enabled };
}
