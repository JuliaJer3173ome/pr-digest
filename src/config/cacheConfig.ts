import * as core from '@actions/core';

export interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  cacheKey: string;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

export function parseTTL(value: string, defaultSeconds: number): number {
  if (value === '') return defaultSeconds;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid cache TTL: "${value}". Must be a positive integer.`);
  }
  return parsed;
}

export function parseCacheKey(value: string, defaultKey: string): string {
  const trimmed = value.trim();
  if (trimmed === '') return defaultKey;
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(trimmed)) {
    throw new Error(`Invalid cache key: "${trimmed}". Only alphanumeric, dash, underscore, and dot are allowed.`);
  }
  return trimmed;
}

export function loadCacheConfig(): CacheConfig {
  const enabled = parseBooleanFlag(core.getInput('cache_enabled'), false);
  const ttlSeconds = parseTTL(core.getInput('cache_ttl_seconds'), 3600);
  const cacheKey = parseCacheKey(core.getInput('cache_key'), 'pr-digest-cache');

  return { enabled, ttlSeconds, cacheKey };
}
