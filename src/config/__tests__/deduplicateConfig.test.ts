import * as core from '@actions/core';
import { parseBooleanInput, loadDeduplicateConfig } from '../deduplicateConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInput(value: string): void {
  mockGetInput.mockImplementation((name: string) => {
    if (name === 'deduplicate-prs') return value;
    return '';
  });
}

describe('parseBooleanInput', () => {
  it('returns the defaultValue for an empty string', () => {
    expect(parseBooleanInput('', true)).toBe(true);
    expect(parseBooleanInput('', false)).toBe(false);
  });

  it('returns true for "true" (case-insensitive)', () => {
    expect(parseBooleanInput('true', false)).toBe(true);
    expect(parseBooleanInput('True', false)).toBe(true);
    expect(parseBooleanInput('TRUE', false)).toBe(true);
  });

  it('returns false for "false" (case-insensitive)', () => {
    expect(parseBooleanInput('false', true)).toBe(false);
    expect(parseBooleanInput('False', true)).toBe(false);
    expect(parseBooleanInput('FALSE', true)).toBe(false);
  });

  it('throws for an unrecognised value', () => {
    expect(() => parseBooleanInput('yes', true)).toThrow(
      'Invalid boolean input: "yes"'
    );
  });

  it('trims whitespace before parsing', () => {
    expect(parseBooleanInput('  true  ', false)).toBe(true);
    expect(parseBooleanInput('  false  ', true)).toBe(false);
  });
});

describe('loadDeduplicateConfig', () => {
  afterEach(() => jest.resetAllMocks());

  it('defaults to enabled=true when input is empty', () => {
    setupInput('');
    expect(loadDeduplicateConfig()).toEqual({ enabled: true });
  });

  it('returns enabled=true when input is "true"', () => {
    setupInput('true');
    expect(loadDeduplicateConfig()).toEqual({ enabled: true });
  });

  it('returns enabled=false when input is "false"', () => {
    setupInput('false');
    expect(loadDeduplicateConfig()).toEqual({ enabled: false });
  });

  it('throws when input contains an invalid value', () => {
    setupInput('1');
    expect(() => loadDeduplicateConfig()).toThrow('Invalid boolean input');
  });
});
