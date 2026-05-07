import * as core from '@actions/core';
import {
  parseChangelogGroupBy,
  parseChangelogStyle,
  parseBooleanFlag,
  loadChangelogConfig,
} from '../changelogConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('parseChangelogGroupBy', () => {
  it('accepts valid values', () => {
    expect(parseChangelogGroupBy('label')).toBe('label');
    expect(parseChangelogGroupBy('author')).toBe('author');
    expect(parseChangelogGroupBy('repo')).toBe('repo');
  });

  it('falls back to label on invalid input', () => {
    expect(parseChangelogGroupBy('invalid')).toBe('label');
    expect(mockWarning).toHaveBeenCalled();
  });
});

describe('parseChangelogStyle', () => {
  it('accepts valid styles', () => {
    expect(parseChangelogStyle('bullet')).toBe('bullet');
    expect(parseChangelogStyle('numbered')).toBe('numbered');
    expect(parseChangelogStyle('checkbox')).toBe('checkbox');
  });

  it('falls back to bullet on invalid style', () => {
    expect(parseChangelogStyle('unknown')).toBe('bullet');
    expect(mockWarning).toHaveBeenCalled();
  });
});

describe('parseBooleanFlag', () => {
  it('parses true and false strings', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default on empty string', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });
});

describe('loadChangelogConfig', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadChangelogConfig();
    expect(config.enabled).toBe(false);
    expect(config.groupBy).toBe('label');
    expect(config.style).toBe('bullet');
    expect(config.includeBreaking).toBe(true);
    expect(config.breakingLabel).toBe('breaking-change');
    expect(config.headerPrefix).toBe('##');
  });

  it('loads all inputs correctly', () => {
    setupInputs({
      changelog_enabled: 'true',
      changelog_group_by: 'author',
      changelog_style: 'numbered',
      changelog_include_breaking: 'false',
      changelog_breaking_label: 'breaking',
      changelog_header_prefix: '###',
    });
    const config = loadChangelogConfig();
    expect(config.enabled).toBe(true);
    expect(config.groupBy).toBe('author');
    expect(config.style).toBe('numbered');
    expect(config.includeBreaking).toBe(false);
    expect(config.breakingLabel).toBe('breaking');
    expect(config.headerPrefix).toBe('###');
  });
});
