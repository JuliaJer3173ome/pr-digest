import * as core from '@actions/core';
import { loadTimeRangeConfig, parseISODate, getDefaultWeekRange } from '../timeRangeConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('parseISODate', () => {
  it('parses a valid ISO date string', () => {
    const date = parseISODate('2024-01-15T00:00:00Z', 'since');
    expect(date).toBeInstanceOf(Date);
    expect(date.toISOString()).toBe('2024-01-15T00:00:00.000Z');
  });

  it('throws on invalid date string', () => {
    expect(() => parseISODate('not-a-date', 'since')).toThrow(
      'Invalid date for input "since"'
    );
  });
});

describe('getDefaultWeekRange', () => {
  it('returns a range of exactly 7 days', () => {
    const { since, until } = getDefaultWeekRange();
    const diffMs = until.getTime() - since.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(7, 0);
  });
});

describe('loadTimeRangeConfig', () => {
  it('returns default 7-day range when no inputs provided', () => {
    setupInputs({});
    const config = loadTimeRangeConfig();
    expect(config.customRange).toBe(false);
    const diffDays =
      (config.until.getTime() - config.since.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(7, 0);
  });

  it('uses current time as until when only since is provided', () => {
    setupInputs({ since: '2024-03-01T00:00:00Z' });
    const config = loadTimeRangeConfig();
    expect(config.customRange).toBe(true);
    expect(config.since.toISOString()).toBe('2024-03-01T00:00:00.000Z');
    expect(config.until.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it('derives since as 7 days before until when only until is provided', () => {
    setupInputs({ until: '2024-03-08T00:00:00Z' });
    const config = loadTimeRangeConfig();
    expect(config.customRange).toBe(true);
    expect(config.until.toISOString()).toBe('2024-03-08T00:00:00.000Z');
    expect(config.since.toISOString()).toBe('2024-03-01T00:00:00.000Z');
  });

  it('returns both dates when since and until are provided', () => {
    setupInputs({ since: '2024-02-01T00:00:00Z', until: '2024-02-15T00:00:00Z' });
    const config = loadTimeRangeConfig();
    expect(config.customRange).toBe(true);
    expect(config.since.toISOString()).toBe('2024-02-01T00:00:00.000Z');
    expect(config.until.toISOString()).toBe('2024-02-15T00:00:00.000Z');
  });

  it('throws when since is after until', () => {
    setupInputs({ since: '2024-03-10T00:00:00Z', until: '2024-03-01T00:00:00Z' });
    expect(() => loadTimeRangeConfig()).toThrow('"since"');
    expect(() => loadTimeRangeConfig()).toThrow('must be before');
  });

  it('throws when since equals until', () => {
    setupInputs({ since: '2024-03-01T00:00:00Z', until: '2024-03-01T00:00:00Z' });
    expect(() => loadTimeRangeConfig()).toThrow('must be before');
  });
});
