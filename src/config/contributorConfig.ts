import * as core from '@actions/core';

export interface ContributorConfig {
  showContributors: boolean;
  topContributorsCount: number;
  excludeBots: boolean;
  botPatterns: string[];
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

export function parseTopCount(value: string, defaultValue: number): number {
  if (value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) {
    throw new Error(`Invalid top contributors count: "${value}". Must be a positive integer.`);
  }
  return parsed;
}

export function parseBotPatterns(value: string): string[] {
  if (value === '') return ['[bot]', '-bot', 'dependabot', 'renovate'];
  return value
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function loadContributorConfig(): ContributorConfig {
  const showContributors = parseBooleanFlag(
    core.getInput('show_contributors'),
    false
  );
  const topContributorsCount = parseTopCount(
    core.getInput('top_contributors_count'),
    5
  );
  const excludeBots = parseBooleanFlag(
    core.getInput('exclude_bot_contributors'),
    true
  );
  const botPatterns = parseBotPatterns(
    core.getInput('bot_contributor_patterns')
  );

  return { showContributors, topContributorsCount, excludeBots, botPatterns };
}
