import * as core from '@actions/core';
import {
  parseSizeThresholds,
  parseBooleanFlag,
  loadSizeConfig,
  SizeThresholds,
} from '../sizeConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

const DEFAULT: SizeThresholds = { xs: 10, s: 50, m: 250, l: 1000 };

describe('parseSizeThresholds', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns defaults for empty string', () => {
    expect(parseSizeThresholds('')).toEqual(DEFAULT);
  });

  it('parses valid threshold string', () => {
    expect(parseSizeThresholds('5,30,200,800')).toEqual({
      xs: 5,
      s: 30,
      m: 200,
      l: 800,
    });
  });

  it('returns defaults and warns for wrong part count', () => {
    const result = parseSizeThresholds('10,50,250');
    expect(result).toEqual(DEFAULT);
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('4 comma-separated'));
  });

  it('returns defaults and warns for non-numeric values', () => {
    const result = parseSizeThresholds('10,abc,250,1000');
    expect(result).toEqual(DEFAULT);
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('invalid numbers'));
  });

  it('returns defaults and warns when thresholds are not ascending', () => {
    const result = parseSizeThresholds('50,10,250,1000');
    expect(result).toEqual(DEFAULT);
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('strictly ascending'));
  });
});

describe('parseBooleanFlag', () => {
  it('returns default when value is empty', () => {
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

describe('loadSizeConfig', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadSizeConfig();
    expect(config.enabled).toBe(false);
    expect(config.thresholds).toEqual(DEFAULT);
    expect(config.excludeMergeCommits).toBe(true);
  });

  it('loads enabled flag and custom thresholds', () => {
    setupInputs({
      'size-label-enabled': 'true',
      'size-thresholds': '5,30,150,600',
      'size-exclude-merge-commits': 'false',
    });
    const config = loadSizeConfig();
    expect(config.enabled).toBe(true);
    expect(config.thresholds).toEqual({ xs: 5, s: 30, m: 150, l: 600 });
    expect(config.excludeMergeCommits).toBe(false);
  });
});
