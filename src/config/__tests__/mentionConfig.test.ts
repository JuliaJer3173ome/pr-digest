import { parseSlackUserMap, loadMentionConfig } from '../mentionConfig';
import * as core from '@actions/core';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    mention_authors: 'false',
    slack_user_map: '',
    mention_fallback: '',
  };
  const merged = { ...defaults, ...overrides };
  mockGetInput.mockImplementation((key: string) => merged[key] ?? '');
}

describe('parseSlackUserMap', () => {
  it('returns empty object for empty string', () => {
    expect(parseSlackUserMap('')).toEqual({});
  });

  it('parses single mapping', () => {
    expect(parseSlackUserMap('octocat:U12345')).toEqual({ octocat: '@U12345' });
  });

  it('adds @ prefix when missing', () => {
    expect(parseSlackUserMap('alice:alice_slack')).toEqual({ alice: '@alice_slack' });
  });

  it('preserves @ prefix if already present', () => {
    expect(parseSlackUserMap('bob:@bob_id')).toEqual({ bob: '@bob_id' });
  });

  it('parses multiple mappings', () => {
    const result = parseSlackUserMap('alice:U001, bob:U002, carol:@U003');
    expect(result).toEqual({ alice: '@U001', bob: '@U002', carol: '@U003' });
  });

  it('ignores malformed entries', () => {
    expect(parseSlackUserMap('alice:U001, badentry, bob:U002')).toEqual({
      alice: '@U001',
      bob: '@U002',
    });
  });
});

describe('loadMentionConfig', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns disabled config by default', () => {
    setupInputs();
    const config = loadMentionConfig();
    expect(config.enabled).toBe(false);
    expect(config.slackUserMap).toEqual({});
    expect(config.fallbackMention).toBeNull();
  });

  it('enables mentions when input is true', () => {
    setupInputs({ mention_authors: 'true' });
    expect(loadMentionConfig().enabled).toBe(true);
  });

  it('parses slack user map from input', () => {
    setupInputs({ slack_user_map: 'alice:U001' });
    expect(loadMentionConfig().slackUserMap).toEqual({ alice: '@U001' });
  });

  it('sets fallback mention with @ prefix', () => {
    setupInputs({ mention_fallback: 'team-eng' });
    expect(loadMentionConfig().fallbackMention).toBe('@team-eng');
  });

  it('preserves @ on fallback if already present', () => {
    setupInputs({ mention_fallback: '@team-eng' });
    expect(loadMentionConfig().fallbackMention).toBe('@team-eng');
  });
});
