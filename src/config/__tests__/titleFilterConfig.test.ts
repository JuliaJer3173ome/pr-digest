import * as core from '@actions/core';
import {
  loadTitleFilterConfig,
  parsePatternList,
  parseBooleanFlag,
} from '../titleFilterConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation(
    (key: string) => inputs[key] ?? ''
  );
}

describe('parsePatternList', () => {
  it('returns empty array for empty string', () => {
    expect(parsePatternList('')).toEqual([]);
  });

  it('parses single pattern', () => {
    const result = parsePatternList('fix:');
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(RegExp);
  });

  it('parses multiple comma-separated patterns', () => {
    const result = parsePatternList('fix:,feat:,chore:');
    expect(result).toHaveLength(3);
  });

  it('trims whitespace around patterns', () => {
    const result = parsePatternList(' fix: , feat: ');
    expect(result).toHaveLength(2);
  });
});

describe('parseBooleanFlag', () => {
  it('returns default when input is empty', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });

  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(parseBooleanFlag('TRUE', false)).toBe(true);
  });
});

describe('loadTitleFilterConfig', () => {
  it('returns defaults when no inputs are set', () => {
    setupInputs({});
    const config = loadTitleFilterConfig();
    expect(config.includeTitlePatterns).toEqual([]);
    expect(config.excludeTitlePatterns).toEqual([]);
    expect(config.caseSensitive).toBe(false);
    expect(config.enabled).toBe(true);
  });

  it('parses include and exclude patterns', () => {
    setupInputs({
      title_filter_include: 'feat:,fix:',
      title_filter_exclude: 'WIP',
    });
    const config = loadTitleFilterConfig();
    expect(config.includeTitlePatterns).toHaveLength(2);
    expect(config.excludeTitlePatterns).toHaveLength(1);
  });

  it('respects case_sensitive flag', () => {
    setupInputs({ title_filter_case_sensitive: 'true', title_filter_include: 'FIX' });
    const config = loadTitleFilterConfig();
    expect(config.caseSensitive).toBe(true);
    expect(config.includeTitlePatterns[0].flags).not.toContain('i');
  });

  it('applies case-insensitive flag by default', () => {
    setupInputs({ title_filter_include: 'fix' });
    const config = loadTitleFilterConfig();
    expect(config.includeTitlePatterns[0].flags).toContain('i');
  });

  it('disables filter when enabled is false', () => {
    setupInputs({ title_filter_enabled: 'false' });
    const config = loadTitleFilterConfig();
    expect(config.enabled).toBe(false);
  });
});
