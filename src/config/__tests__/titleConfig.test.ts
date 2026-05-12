import * as core from '@actions/core';
import {
  parseTitlePatterns,
  parseBooleanFlag,
  loadTitleConfig,
} from '../titleConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation(
    (key: string) => inputs[key] ?? ''
  );
}

describe('parseTitlePatterns', () => {
  it('returns empty array for blank input', () => {
    expect(parseTitlePatterns('')).toEqual([]);
    expect(parseTitlePatterns('   ')).toEqual([]);
  });

  it('parses a single pattern', () => {
    expect(parseTitlePatterns('fix:')).toEqual(['fix:']);
  });

  it('parses multiple comma-separated patterns', () => {
    expect(parseTitlePatterns('fix:, feat:, chore:')).toEqual([
      'fix:',
      'feat:',
      'chore:',
    ]);
  });

  it('trims whitespace around entries', () => {
    expect(parseTitlePatterns('  foo  ,  bar  ')).toEqual(['foo', 'bar']);
  });

  it('filters out empty entries after split', () => {
    expect(parseTitlePatterns('foo,,bar')).toEqual(['foo', 'bar']);
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default for unknown value', () => {
    expect(parseBooleanFlag('', false)).toBe(false);
    expect(parseBooleanFlag('yes', true)).toBe(true);
  });
});

describe('loadTitleConfig', () => {
  it('returns empty filters and case-insensitive by default', () => {
    setupInputs({});
    const config = loadTitleConfig();
    expect(config.titleFilter).toEqual([]);
    expect(config.titleExclude).toEqual([]);
    expect(config.titleCaseSensitive).toBe(false);
  });

  it('loads title_filter patterns', () => {
    setupInputs({ title_filter: 'fix:, feat:' });
    const config = loadTitleConfig();
    expect(config.titleFilter).toEqual(['fix:', 'feat:']);
  });

  it('loads title_exclude patterns', () => {
    setupInputs({ title_exclude: 'WIP, draft' });
    const config = loadTitleConfig();
    expect(config.titleExclude).toEqual(['WIP', 'draft']);
  });

  it('loads title_case_sensitive as true', () => {
    setupInputs({ title_case_sensitive: 'true' });
    const config = loadTitleConfig();
    expect(config.titleCaseSensitive).toBe(true);
  });

  it('loads all fields together', () => {
    setupInputs({
      title_filter: 'feat:',
      title_exclude: 'WIP',
      title_case_sensitive: 'true',
    });
    const config = loadTitleConfig();
    expect(config).toEqual({
      titleFilter: ['feat:'],
      titleExclude: ['WIP'],
      titleCaseSensitive: true,
    });
  });
});
