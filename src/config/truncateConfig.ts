import * as core from '@actions/core';

export function parsePositiveInt(value: string, name: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for '${name}': expected a positive integer, got '${value}'`);
  }
  return parsed;
}

export interface TruncateConfig {
  maxSections: number | undefined;
  maxPRsPerSection: number | undefined;
  maxTotalPRs: number | undefined;
}

export function loadTruncateConfig(): TruncateConfig {
  const maxSections = parsePositiveInt(
    core.getInput('max_sections'),
    'max_sections'
  );
  const maxPRsPerSection = parsePositiveInt(
    core.getInput('max_prs_per_section'),
    'max_prs_per_section'
  );
  const maxTotalPRs = parsePositiveInt(
    core.getInput('max_total_prs'),
    'max_total_prs'
  );

  return { maxSections, maxPRsPerSection, maxTotalPRs };
}
