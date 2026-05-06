import * as core from '@actions/core';

export interface RetryConfig {
  maxRetries: number;
  retryDelayMs: number;
  retryOnStatusCodes: number[];
}

export function parseMaxRetries(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) {
    core.warning(`Invalid max-retries value "${value}", defaulting to 3`);
    return 3;
  }
  return Math.min(parsed, 10);
}

export function parseRetryDelay(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) {
    core.warning(`Invalid retry-delay-ms value "${value}", defaulting to 1000`);
    return 1000;
  }
  return Math.min(parsed, 30000);
}

export function parseStatusCodes(value: string): number[] {
  if (!value.trim()) return [429, 500, 502, 503, 504];
  return value
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 100 && n <= 599);
}

export function loadRetryConfig(): RetryConfig {
  const maxRetries = parseMaxRetries(core.getInput('max-retries') || '3');
  const retryDelayMs = parseRetryDelay(core.getInput('retry-delay-ms') || '1000');
  const retryOnStatusCodes = parseStatusCodes(
    core.getInput('retry-on-status-codes') || ''
  );

  return { maxRetries, retryDelayMs, retryOnStatusCodes };
}
