import { CacheConfig } from '../config/cacheConfig';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function cacheClear(): void {
  store.clear();
}

export async function withCache<T>(
  config: CacheConfig,
  keyPrefix: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!config.enabled) {
    return fn();
  }

  const key = `${config.cacheKey}:${keyPrefix}`;
  const cached = cacheGet<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const result = await fn();
  cacheSet(key, result, config.ttlSeconds);
  return result;
}
