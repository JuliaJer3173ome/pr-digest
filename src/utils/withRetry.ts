import * as core from '@actions/core';
import { RetryConfig } from '../config/retryConfig';

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastStatusCode?: number,
    public readonly attempts?: number
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryableResponse {
  status: number;
}

export async function withRetry<T extends RetryableResponse>(
  fn: () => Promise<T>,
  config: RetryConfig,
  label = 'request'
): Promise<T> {
  const { maxRetries, retryDelayMs, retryOnStatusCodes } = config;
  let lastError: Error | undefined;
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await fn();
      if (retryOnStatusCodes.includes(result.status)) {
        lastStatus = result.status;
        core.warning(
          `[${label}] Attempt ${attempt} returned status ${result.status}, retrying...`
        );
      } else {
        return result;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      core.warning(
        `[${label}] Attempt ${attempt} threw: ${lastError.message}`
      );
    }

    if (attempt <= maxRetries) {
      const delay = retryDelayMs * attempt;
      core.debug(`[${label}] Waiting ${delay}ms before retry...`);
      await sleep(delay);
    }
  }

  throw new RetryError(
    `[${label}] Failed after ${maxRetries + 1} attempts: ${
      lastError?.message ?? `status ${lastStatus}`
    }`,
    lastStatus,
    maxRetries + 1
  );
}
