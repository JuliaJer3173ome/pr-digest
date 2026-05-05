import {
  resolveAuthorMention,
  formatPRLineWithMention,
  annotatePRsWithMentions,
  AuthoredPR,
} from '../mentionAuthors';
import { MentionConfig } from '../../config/mentionConfig';

const basePR: AuthoredPR = {
  number: 42,
  title: 'Fix critical bug',
  author: 'alice',
};

function makeConfig(overrides: Partial<MentionConfig> = {}): MentionConfig {
  return {
    enabled: true,
    slackUserMap: {},
    fallbackMention: null,
    ...overrides,
  };
}

describe('resolveAuthorMention', () => {
  it('returns null when mentions disabled', () => {
    const config = makeConfig({ enabled: false });
    expect(resolveAuthorMention('alice', config)).toBeNull();
  });

  it('returns mapped slack handle when present', () => {
    const config = makeConfig({ slackUserMap: { alice: '@alice_slack' } });
    expect(resolveAuthorMention('alice', config)).toBe('@alice_slack');
  });

  it('returns fallback when author not in map', () => {
    const config = makeConfig({ fallbackMention: '@team-eng' });
    expect(resolveAuthorMention('unknown', config)).toBe('@team-eng');
  });

  it('returns null when no map entry and no fallback', () => {
    const config = makeConfig();
    expect(resolveAuthorMention('unknown', config)).toBeNull();
  });

  it('prefers map over fallback', () => {
    const config = makeConfig({
      slackUserMap: { alice: '@alice_slack' },
      fallbackMention: '@team-eng',
    });
    expect(resolveAuthorMention('alice', config)).toBe('@alice_slack');
  });
});

describe('formatPRLineWithMention', () => {
  it('formats line without mention when disabled', () => {
    const config = makeConfig({ enabled: false });
    expect(formatPRLineWithMention(basePR, config)).toBe(
      '- [#42] Fix critical bug (@alice)'
    );
  });

  it('appends mention when resolved', () => {
    const config = makeConfig({ slackUserMap: { alice: '@alice_slack' } });
    expect(formatPRLineWithMention(basePR, config)).toBe(
      '- [#42] Fix critical bug (@alice) → @alice_slack'
    );
  });

  it('appends fallback mention', () => {
    const config = makeConfig({ fallbackMention: '@team' });
    expect(formatPRLineWithMention(basePR, config)).toBe(
      '- [#42] Fix critical bug (@alice) → @team'
    );
  });
});

describe('annotatePRsWithMentions', () => {
  it('returns annotated lines for all PRs', () => {
    const prs: AuthoredPR[] = [
      { number: 1, title: 'PR one', author: 'alice' },
      { number: 2, title: 'PR two', author: 'bob' },
    ];
    const config = makeConfig({
      slackUserMap: { alice: '@alice_s', bob: '@bob_s' },
    });
    const lines = annotatePRsWithMentions(prs, config);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('@alice_s');
    expect(lines[1]).toContain('@bob_s');
  });

  it('returns empty array for empty input', () => {
    expect(annotatePRsWithMentions([], makeConfig())).toEqual([]);
  });
});
