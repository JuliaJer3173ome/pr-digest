import * as core from '@actions/core';
import { withRetry, RetryError } from '../withRetry';
import { RetryConfig } from '../../config/retryConfig';

jest.mock('@actions/core');
jest.useFakeTimers();

const baseConfig: RetryConfig = {
  maxRetries: 2,
  retryDelayMs: 100,
  retryOnStatusCodes: [429, 503],
};

async function runWithTimers<T>(promise: Promise<T>): Promise<T> {
  const result = promise;
  jest.runAllTimers();
  return result;
}

beforeEach(() => jest.clearAllMocks());

describe('withRetry', () => {
  it('returns result immediately on success', async () => {
    const fn = jest.fn().mockResolvedValue({ status: 200 });
    const result = await withRetry(fn, baseConfig, 'test');
    expect(result).toEqual({ status: 200 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable status codes and eventually succeeds', async () => {
    const fn = jest
      .fn()
      .mockResolvedValueOnce({ status: 429 })
      .mockResolvedValueOnce({ status: 200 });

    const promise = withRetry(fn, baseConfig, 'test');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({ status: 200 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on thrown errors and eventually succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ status: 200 });

    const promise = withRetry(fn, baseConfig, 'test');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({ status: 200 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws RetryError after exhausting all attempts on status codes', async () => {
    const fn = jest.fn().mockResolvedValue({ status: 503 });

    const promise = withRetry(fn, baseConfig, 'test');
    jest.runAllTimers();

    await expect(promise).rejects.toThrow(RetryError);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws RetryError after exhausting all attempts on errors', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('timeout'));

    const promise = withRetry(fn, baseConfig, 'test');
    jest.runAllTimers();

    await expect(promise).rejects.toThrow(RetryError);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('logs warnings on each failed attempt', async () => {
    const fn = jest.fn().mockResolvedValue({ status: 429 });
    const promise = withRetry(fn, { ...baseConfig, maxRetries: 1 }, 'myOp');
    jest.runAllTimers();
    await expect(promise).rejects.toThrow();
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('myOp')
    );
  });
});
