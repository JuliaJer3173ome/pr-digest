import * as core from '@actions/core';
import { loadPRAgeConfig, parseAgeDays } from '../prAgeConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

describe('parseAgeDays', () => {
  it('returns null for empty string', () => {
    expect(parseAgeDays('', 'field')).toBeNull();
  });

  it('parses valid integer', () => {
    expect(parseAgeDays('30', 'field')).toBe(30);
  });

  it('parses zero', () => {
    expect(parseAgeDays('0', 'field')).toBe(0);
  });

  it('throws on negative value', () => {
    expect(() => parseAgeDays('-1', 'field')).toThrow('non-negative integer');
  });

  it('throws on non-numeric value', () => {
    expect(() => parseAgeDays('abc', 'field')).toThrow('non-negative integer');
  });
});

describe('loadPRAgeConfig', () => {
  it('returns defaults when no inputs set', () => {
    setupInputs({});
    const config = loadPRAgeConfig();
    expect(config).toEqual({
      enabled: false,
      maxAgeDays: null,
      minAgeDays: null,
      warnOldPRs: false,
    });
  });

  it('parses all fields correctly', () => {
    setupInputs({
      pr_age_filter_enabled: 'true',
      pr_max_age_days: '90',
      pr_min_age_days: '7',
      pr_warn_old: 'true',
    });
    const config = loadPRAgeConfig();
    expect(config.enabled).toBe(true);
    expect(config.maxAgeDays).toBe(90);
    expect(config.minAgeDays).toBe(7);
    expect(config.warnOldPRs).toBe(true);
  });

  it('throws when minAgeDays > maxAgeDays', () => {
    setupInputs({
      pr_age_filter_enabled: 'true',
      pr_max_age_days: '5',
      pr_min_age_days: '10',
    });
    expect(() => loadPRAgeConfig()).toThrow('pr_min_age_days (10) cannot be greater than pr_max_age_days (5)');
  });

  it('allows minAgeDays equal to maxAgeDays', () => {
    setupInputs({ pr_max_age_days: '7', pr_min_age_days: '7' });
    const config = loadPRAgeConfig();
    expect(config.minAgeDays).toBe(7);
    expect(config.maxAgeDays).toBe(7);
  });
});
