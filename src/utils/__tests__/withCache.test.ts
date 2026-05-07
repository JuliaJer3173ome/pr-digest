import { cacheGet, cacheSet, cacheClear, withCache } from '../withCache';
import { CacheConfig } from '../../config/cacheConfig';

const baseConfig: CacheConfig = {
  enabled: true,
  ttlSeconds: 60,
  cacheKey: 'test-cache',
};

beforeEach(() => {
  cacheClear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('cacheGet / cacheSet', () => {
  it('returns undefined for missing key', () => {
    expect(cacheGet('missing')).toBeUndefined();
  });

  it('stores and retrieves a value', () => {
    cacheSet('key1', { data: 42 }, 60);
    expect(cacheGet('key1')).toEqual({ data: 42 });
  });

  it('returns undefined after TTL expires', () => {
    cacheSet('key2', 'hello', 30);
    jest.advanceTimersByTime(31_000);
    expect(cacheGet('key2')).toBeUndefined();
  });

  it('returns value before TTL expires', () => {
    cacheSet('key3', 'world', 30);
    jest.advanceTimersByTime(29_000);
    expect(cacheGet('key3')).toBe('world');
  });
});

describe('withCache', () => {
  it('calls fn and caches result when enabled', async () => {
    const fn = jest.fn().mockResolvedValue('result-1');
    const val = await withCache(baseConfig, 'prefix1', fn);
    expect(val).toBe('result-1');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('returns cached value on second call', async () => {
    const fn = jest.fn().mockResolvedValue('result-2');
    await withCache(baseConfig, 'prefix2', fn);
    const val = await withCache(baseConfig, 'prefix2', fn);
    expect(val).toBe('result-2');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('bypasses cache when disabled', async () => {
    const fn = jest.fn().mockResolvedValue('result-3');
    const disabledConfig: CacheConfig = { ...baseConfig, enabled: false };
    await withCache(disabledConfig, 'prefix3', fn);
    await withCache(disabledConfig, 'prefix3', fn);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('re-fetches after TTL expires', async () => {
    const fn = jest.fn().mockResolvedValue('result-4');
    const shortConfig: CacheConfig = { ...baseConfig, ttlSeconds: 5 };
    await withCache(shortConfig, 'prefix4', fn);
    jest.advanceTimersByTime(6_000);
    await withCache(shortConfig, 'prefix4', fn);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
