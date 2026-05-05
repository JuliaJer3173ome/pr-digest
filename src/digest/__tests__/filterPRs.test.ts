import { filterPRs, matchesLabels, excludesByLabels } from '../filterPRs';
import { PullRequest } from '../../github/fetchMergedPRs';

const makePR = (overrides: Partial<PullRequest> = {}): PullRequest => ({
  number: 1,
  title: 'Test PR',
  url: 'https://github.com/org/repo/pull/1',
  author: 'alice',
  labels: [],
  mergedAt: '2024-01-15T10:00:00Z',
  commentCount: 0,
  ...overrides,
});

describe('matchesLabels', () => {
  it('returns true when no labels filter is specified', () => {
    expect(matchesLabels(makePR({ labels: ['bug'] }), [])).toBe(true);
  });

  it('returns true when PR has a matching label', () => {
    expect(matchesLabels(makePR({ labels: ['feature', 'bug'] }), ['feature'])).toBe(true);
  });

  it('returns false when PR has no matching label', () => {
    expect(matchesLabels(makePR({ labels: ['bug'] }), ['feature'])).toBe(false);
  });
});

describe('excludesByLabels', () => {
  it('returns false when no exclude labels specified', () => {
    expect(excludesByLabels(makePR({ labels: ['wip'] }), [])).toBe(false);
  });

  it('returns true when PR has an excluded label', () => {
    expect(excludesByLabels(makePR({ labels: ['wip', 'bug'] }), ['wip'])).toBe(true);
  });

  it('returns false when PR does not have excluded labels', () => {
    expect(excludesByLabels(makePR({ labels: ['bug'] }), ['wip'])).toBe(false);
  });
});

describe('filterPRs', () => {
  const prs: PullRequest[] = [
    makePR({ number: 1, author: 'alice', labels: ['feature'], commentCount: 3 }),
    makePR({ number: 2, author: 'bob', labels: ['bug', 'wip'], commentCount: 0 }),
    makePR({ number: 3, author: 'carol', labels: ['chore'], commentCount: 1 }),
    makePR({ number: 4, author: 'alice', labels: [], commentCount: 5 }),
  ];

  it('returns all PRs when no options are given', () => {
    expect(filterPRs(prs)).toHaveLength(4);
  });

  it('filters by included labels', () => {
    const result = filterPRs(prs, { labels: ['feature', 'bug'] });
    expect(result.map((p) => p.number)).toEqual([1, 2]);
  });

  it('excludes PRs with excluded labels', () => {
    const result = filterPRs(prs, { excludeLabels: ['wip'] });
    expect(result.map((p) => p.number)).toEqual([1, 3, 4]);
  });

  it('filters by author whitelist', () => {
    const result = filterPRs(prs, { authors: ['alice'] });
    expect(result.map((p) => p.number)).toEqual([1, 4]);
  });

  it('excludes specific authors', () => {
    const result = filterPRs(prs, { excludeAuthors: ['bob', 'carol'] });
    expect(result.map((p) => p.number)).toEqual([1, 4]);
  });

  it('filters by minimum comment count', () => {
    const result = filterPRs(prs, { minComments: 2 });
    expect(result.map((p) => p.number)).toEqual([1, 4]);
  });

  it('combines multiple filter criteria', () => {
    const result = filterPRs(prs, { authors: ['alice'], minComments: 1 });
    expect(result.map((p) => p.number)).toEqual([1, 4]);
  });
});
