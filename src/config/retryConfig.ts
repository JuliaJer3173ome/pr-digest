import * as core from '@actions/core';

export interface RetryConfig {
  maxRetries: number;
  retryDelayMs: number;
  retryOnStatusCodes: number[];
}

const MAX_RETRIES_LIMIT = 10;
const MAX_RETRY_DELAY_MS = 30000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;
const DEFAULT_STATUS_CODES = [429, 500, 502, 503, 504];

export function parseMaxRetries(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) {
    core.warning(`Invalid max-retries value "${value}", defaulting to ${DEFAULT_MAX_RETRIES}`);
    return DEFAULT_MAX_RETRIES;
  }
  return Math.min(parsed, MAX_RETRIES_LIMIT);
}

export function parseRetryDelay(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) {
    core.warning(`Invalid retry-delay-ms value "${value}", defaulting to ${DEFAULT_RETRY_DELAY_MS}`);
    return DEFAULT_RETRY_DELAY_MS;
  }
  return Math.min(parsed, MAX_RETRY_DELAY_MS);
}

export function parseStatusCodes(value: string): number[] {
  if (!value.trim()) return DEFAULT_STATUS_CODES;
  return value
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 100 && n <= 599);
}

export function loadRetryConfig(): RetryConfig {
  const maxRetries = parseMaxRetries(core.getInput('max-retries') || String(DEFAULT_MAX_RETRIES));
  const retryDelayMs = parseRetryDelay(core.getInput('retry-delay-ms') || String(DEFAULT_RETRY_DELAY_MS));
  const retryOnStatusCodes = parseStatusCodes(
    core.getInput('retry-on-status-codes') || ''
  );

  return { maxRetries, retryDelayMs, retryOnStatusCodes };
}
