import * as core from '@actions/core';
import { parseDiffMode, parseMaxLines, parseBooleanFlag, loadDiffConfig, DiffMode } from '../diffConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseDiffMode', () => {
  it.each([['none'], ['summary'], ['full']])('accepts valid mode "%s"', (mode) => {
    expect(parseDiffMode(mode)).toBe(mode as DiffMode);
  });

  it('normalizes uppercase input', () => {
    expect(parseDiffMode('SUMMARY')).toBe('summary');
  });

  it('returns "none" and warns for invalid mode', () => {
    expect(parseDiffMode('invalid')).toBe('none');
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('invalid'));
  });
});

describe('parseMaxLines', () => {
  it('parses a valid positive integer', () => {
    expect(parseMaxLines('50')).toBe(50);
  });

  it('returns default 20 for NaN', () => {
    expect(parseMaxLines('abc')).toBe(20);
    expect(mockWarning).toHaveBeenCalled();
  });

  it('returns 0 when explicitly set to 0', () => {
    expect(parseMaxLines('0')).toBe(0);
  });

  it('returns default 20 for negative value', () => {
    expect(parseMaxLines('-5')).toBe(20);
    expect(mockWarning).toHaveBeenCalled();
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true')).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false')).toBe(false);
  });

  it('handles mixed case', () => {
    expect(parseBooleanFlag('TRUE')).toBe(true);
  });
});

describe('loadDiffConfig', () => {
  it('returns defaults when no inputs are set', () => {
    setupInputs({});
    const config = loadDiffConfig();
    expect(config).toEqual({
      enabled: false,
      mode: 'none',
      maxLines: 20,
      includeFileList: true,
    });
  });

  it('loads all inputs correctly', () => {
    setupInputs({
      diff_enabled: 'true',
      diff_mode: 'summary',
      diff_max_lines: '30',
      diff_include_file_list: 'false',
    });
    const config = loadDiffConfig();
    expect(config).toEqual({
      enabled: true,
      mode: 'summary',
      maxLines: 30,
      includeFileList: false,
    });
  });

  it('handles full mode', () => {
    setupInputs({ diff_enabled: 'true', diff_mode: 'full' });
    const config = loadDiffConfig();
    expect(config.mode).toBe('full');
    expect(config.enabled).toBe(true);
  });
});
