import * as core from '@actions/core';
import {
  parseMaxRetries,
  parseRetryDelay,
  parseStatusCodes,
  loadRetryConfig,
} from '../retryConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

beforeEach(() => jest.clearAllMocks());

describe('parseMaxRetries', () => {
  it('parses a valid number', () => {
    expect(parseMaxRetries('5')).toBe(5);
  });

  it('clamps to max of 10', () => {
    expect(parseMaxRetries('99')).toBe(10);
  });

  it('defaults to 3 on invalid input', () => {
    expect(parseMaxRetries('abc')).toBe(3);
    expect(mockWarning).toHaveBeenCalled();
  });

  it('defaults to 3 on negative input', () => {
    expect(parseMaxRetries('-1')).toBe(3);
  });
});

describe('parseRetryDelay', () => {
  it('parses a valid delay', () => {
    expect(parseRetryDelay('2000')).toBe(2000);
  });

  it('clamps to max of 30000', () => {
    expect(parseRetryDelay('99999')).toBe(30000);
  });

  it('defaults to 1000 on invalid input', () => {
    expect(parseRetryDelay('bad')).toBe(1000);
    expect(mockWarning).toHaveBeenCalled();
  });
});

describe('parseStatusCodes', () => {
  it('returns defaults on empty string', () => {
    expect(parseStatusCodes('')).toEqual([429, 500, 502, 503, 504]);
  });

  it('parses comma-separated codes', () => {
    expect(parseStatusCodes('429, 503')).toEqual([429, 503]);
  });

  it('filters out invalid codes', () => {
    expect(parseStatusCodes('200, abc, 503')).toEqual([200, 503]);
  });
});

describe('loadRetryConfig', () => {
  it('loads full config from inputs', () => {
    setupInputs({
      'max-retries': '4',
      'retry-delay-ms': '500',
      'retry-on-status-codes': '429,503',
    });
    expect(loadRetryConfig()).toEqual({
      maxRetries: 4,
      retryDelayMs: 500,
      retryOnStatusCodes: [429, 503],
    });
  });

  it('uses defaults when inputs are empty', () => {
    setupInputs({});
    expect(loadRetryConfig()).toEqual({
      maxRetries: 3,
      retryDelayMs: 1000,
      retryOnStatusCodes: [429, 500, 502, 503, 504],
    });
  });
});
