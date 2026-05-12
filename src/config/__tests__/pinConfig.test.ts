import * as core from '@actions/core';
import {
  parseBooleanFlag,
  parsePinnedPRNumbers,
  parseStringList,
  loadPinConfig,
} from '../pinConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default when empty', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });
});

describe('parsePinnedPRNumbers', () => {
  it('parses comma-separated PR numbers', () => {
    expect(parsePinnedPRNumbers('1,2,3')).toEqual([1, 2, 3]);
  });

  it('ignores invalid values', () => {
    expect(parsePinnedPRNumbers('1,abc,3')).toEqual([1, 3]);
  });

  it('returns empty array for empty string', () => {
    expect(parsePinnedPRNumbers('')).toEqual([]);
  });

  it('ignores non-positive numbers', () => {
    expect(parsePinnedPRNumbers('0,-1,5')).toEqual([5]);
  });
});

describe('parseStringList', () => {
  it('parses comma-separated strings', () => {
    expect(parseStringList('bug,feature,hotfix')).toEqual(['bug', 'feature', 'hotfix']);
  });

  it('trims whitespace', () => {
    expect(parseStringList(' bug , feature ')).toEqual(['bug', 'feature']);
  });

  it('returns empty array for empty input', () => {
    expect(parseStringList('')).toEqual([]);
  });
});

describe('loadPinConfig', () => {
  it('loads defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadPinConfig();
    expect(config.enabled).toBe(false);
    expect(config.pinnedLabels).toEqual([]);
    expect(config.pinnedAuthors).toEqual([]);
    expect(config.pinnedPRNumbers).toEqual([]);
    expect(config.pinToTop).toBe(true);
  });

  it('loads full config from inputs', () => {
    setupInputs({
      pin_enabled: 'true',
      pin_labels: 'critical,hotfix',
      pin_authors: 'alice,bob',
      pin_pr_numbers: '10,20,30',
      pin_to_top: 'false',
    });
    const config = loadPinConfig();
    expect(config.enabled).toBe(true);
    expect(config.pinnedLabels).toEqual(['critical', 'hotfix']);
    expect(config.pinnedAuthors).toEqual(['alice', 'bob']);
    expect(config.pinnedPRNumbers).toEqual([10, 20, 30]);
    expect(config.pinToTop).toBe(false);
  });
});
