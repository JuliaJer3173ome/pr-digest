import {
  isBot,
  countByAuthor,
  computeTopContributors,
  renderContributorsBlock,
  injectContributorsIntoDigest,
  PRWithAuthor,
  ContributorStat,
} from '../highlightContributors';
import { ContributorConfig } from '../../config/contributorConfig';

const defaultConfig: ContributorConfig = {
  showContributors: true,
  topContributorsCount: 3,
  excludeBots: true,
  botPatterns: ['[bot]', 'dependabot', 'renovate'],
};

function makePR(author: string, number = 1): PRWithAuthor {
  return { number, title: `PR #${number}`, author, mergedAt: '2024-01-01' };
}

describe('isBot', () => {
  it('detects [bot] suffix', () => {
    expect(isBot('github-actions[bot]', ['[bot]'])).toBe(true);
  });

  it('detects dependabot', () => {
    expect(isBot('dependabot', ['dependabot'])).toBe(true);
  });

  it('returns false for human authors', () => {
    expect(isBot('alice', defaultConfig.botPatterns)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isBot('Dependabot', ['dependabot'])).toBe(true);
  });
});

describe('countByAuthor', () => {
  it('counts PRs per author', () => {
    const prs = [makePR('alice', 1), makePR('bob', 2), makePR('alice', 3)];
    const counts = countByAuthor(prs);
    expect(counts.get('alice')).toBe(2);
    expect(counts.get('bob')).toBe(1);
  });

  it('returns empty map for empty input', () => {
    expect(countByAuthor([]).size).toBe(0);
  });
});

describe('computeTopContributors', () => {
  it('returns top N contributors sorted by PR count', () => {
    const prs = [
      makePR('alice', 1), makePR('alice', 2), makePR('alice', 3),
      makePR('bob', 4), makePR('bob', 5),
      makePR('carol', 6),
    ];
    const result = computeTopContributors(prs, defaultConfig);
    expect(result[0].author).toBe('alice');
    expect(result[0].prCount).toBe(3);
    expect(result.length).toBe(3);
  });

  it('excludes bots when excludeBots is true', () => {
    const prs = [makePR('dependabot', 1), makePR('alice', 2)];
    const result = computeTopContributors(prs, defaultConfig);
    expect(result.every((c) => c.author !== 'dependabot')).toBe(true);
  });

  it('includes bots when excludeBots is false', () => {
    const prs = [makePR('dependabot', 1), makePR('alice', 2)];
    const config = { ...defaultConfig, excludeBots: false };
    const result = computeTopContributors(prs, config);
    expect(result.some((c) => c.author === 'dependabot')).toBe(true);
  });
});

describe('renderContributorsBlock', () => {
  it('renders a formatted contributors block', () => {
    const contributors: ContributorStat[] = [
      { author: 'alice', prCount: 3 },
      { author: 'bob', prCount: 1 },
    ];
    const block = renderContributorsBlock(contributors);
    expect(block).toContain('## 🏆 Top Contributors');
    expect(block).toContain('1. **alice** — 3 PRs');
    expect(block).toContain('2. **bob** — 1 PR');
  });

  it('returns empty string for empty list', () => {
    expect(renderContributorsBlock([])).toBe('');
  });
});

describe('injectContributorsIntoDigest', () => {
  it('appends contributors block to digest', () => {
    const digest = '## Digest\n\nSome content';
    const contributors: ContributorStat[] = [{ author: 'alice', prCount: 2 }];
    const result = injectContributorsIntoDigest(digest, contributors);
    expect(result).toContain('## Digest');
    expect(result).toContain('## 🏆 Top Contributors');
  });

  it('returns original digest when contributors list is empty', () => {
    const digest = '## Digest\n\nSome content';
    expect(injectContributorsIntoDigest(digest, [])).toBe(digest);
  });
});
