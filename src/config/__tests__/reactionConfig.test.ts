import * as core from '@actions/core';
import {
  parseBooleanFlag,
  parseReactionList,
  parseMinCount,
  parseShowTopN,
  loadReactionConfig,
} from '../reactionConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => expect(parseBooleanFlag('true', false)).toBe(true));
  it('returns false for "false"', () => expect(parseBooleanFlag('false', true)).toBe(false));
  it('returns default for unknown', () => expect(parseBooleanFlag('', true)).toBe(true));
});

describe('parseReactionList', () => {
  it('returns all valid reactions for empty string', () => {
    const result = parseReactionList('');
    expect(result).toContain('+1');
    expect(result).toContain('heart');
    expect(result.length).toBe(8);
  });

  it('parses comma-separated valid reactions', () => {
    expect(parseReactionList('+1, heart, rocket')).toEqual(['+1', 'heart', 'rocket']);
  });

  it('filters out invalid reactions', () => {
    expect(parseReactionList('+1, invalid, heart')).toEqual(['+1', 'heart']);
  });
});

describe('parseMinCount', () => {
  it('returns parsed int', () => expect(parseMinCount('5')).toBe(5));
  it('returns 1 for NaN', () => expect(parseMinCount('abc')).toBe(1));
  it('returns 1 for negative', () => expect(parseMinCount('-3')).toBe(1));
  it('allows zero', () => expect(parseMinCount('0')).toBe(0));
});

describe('parseShowTopN', () => {
  it('returns parsed int', () => expect(parseShowTopN('5')).toBe(5));
  it('returns 3 for NaN', () => expect(parseShowTopN('abc')).toBe(3));
  it('returns 3 for zero', () => expect(parseShowTopN('0')).toBe(3));
});

describe('loadReactionConfig', () => {
  it('loads full config', () => {
    setupInputs({
      reactions_enabled: 'true',
      reactions_include: '+1,heart',
      reactions_min_count: '2',
      reactions_show_top: '4',
    });
    const config = loadReactionConfig();
    expect(config.enabled).toBe(true);
    expect(config.includeReactions).toEqual(['+1', 'heart']);
    expect(config.minCount).toBe(2);
    expect(config.showTopN).toBe(4);
  });

  it('uses defaults when inputs are empty', () => {
    setupInputs({});
    const config = loadReactionConfig();
    expect(config.enabled).toBe(false);
    expect(config.includeReactions.length).toBe(8);
    expect(config.minCount).toBe(1);
    expect(config.showTopN).toBe(3);
  });
});
