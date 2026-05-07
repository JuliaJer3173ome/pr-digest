import * as core from '@actions/core';
import {
  parseAuthorList,
  parseBooleanFlag,
  loadAuthorConfig,
} from '../authorConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation(
    (name: string) => inputs[name] ?? ''
  );
}

describe('parseAuthorList', () => {
  it('parses a comma-separated list of authors', () => {
    expect(parseAuthorList('alice, Bob, CHARLIE')).toEqual([
      'alice',
      'bob',
      'charlie',
    ]);
  });

  it('returns empty array for empty string', () => {
    expect(parseAuthorList('')).toEqual([]);
  });

  it('trims whitespace around entries', () => {
    expect(parseAuthorList('  dave ,  eve  ')).toEqual(['dave', 'eve']);
  });

  it('filters out blank entries', () => {
    expect(parseAuthorList('alice,,bob')).toEqual(['alice', 'bob']);
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default value for empty string', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(parseBooleanFlag('TRUE', false)).toBe(true);
    expect(parseBooleanFlag('False', true)).toBe(false);
  });
});

describe('loadAuthorConfig', () => {
  it('loads full config from inputs', () => {
    setupInputs({
      include_authors: 'alice, bob',
      exclude_authors: 'bot-user',
      show_author_avatar: 'true',
      show_author_link: 'false',
    });
    const config = loadAuthorConfig();
    expect(config.includeAuthors).toEqual(['alice', 'bob']);
    expect(config.excludeAuthors).toEqual(['bot-user']);
    expect(config.showAuthorAvatar).toBe(true);
    expect(config.showAuthorLink).toBe(false);
  });

  it('uses defaults when inputs are empty', () => {
    setupInputs({});
    const config = loadAuthorConfig();
    expect(config.includeAuthors).toEqual([]);
    expect(config.excludeAuthors).toEqual([]);
    expect(config.showAuthorAvatar).toBe(false);
    expect(config.showAuthorLink).toBe(true);
  });

  it('normalises author names to lowercase', () => {
    setupInputs({ include_authors: 'Alice,BOB', exclude_authors: '' });
    const config = loadAuthorConfig();
    expect(config.includeAuthors).toEqual(['alice', 'bob']);
  });
});
