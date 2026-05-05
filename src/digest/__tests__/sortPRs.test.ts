import { sortPRs, comparePRs, parseSortOptions } from '../sortPRs';
import { PullRequest } from '../../github/fetchMergedPRs';

const makePR = (overrides: Partial<PullRequest>): PullRequest => ({
  number: 1,
  title: 'Default PR',
  url: 'https://github.com/org/repo/pull/1',
  author: 'user',
  mergedAt: '2024-01-15T10:00:00Z',
  labels: [],
  additions: 0,
  comments: 0,
  ...overrides,
});

describe('sortPRs', () => {
  const prs: PullRequest[] = [
    makePR({ number: 1, title: 'Beta feature', mergedAt: '2024-01-10T10:00:00Z', additions: 50, comments: 3 }),
    makePR({ number: 2, title: 'Alpha fix',   mergedAt: '2024-01-15T10:00:00Z', additions: 10, comments: 7 }),
    makePR({ number: 3, title: 'Gamma update',mergedAt: '2024-01-12T10:00:00Z', additions: 30, comments: 1 }),
  ];

  it('sorts by mergedAt descending by default', () => {
    const sorted = sortPRs(prs);
    expect(sorted[0].number).toBe(2);
    expect(sorted[1].number).toBe(3);
    expect(sorted[2].number).toBe(1);
  });

  it('sorts by mergedAt ascending', () => {
    const sorted = sortPRs(prs, { field: 'mergedAt', order: 'asc' });
    expect(sorted[0].number).toBe(1);
    expect(sorted[2].number).toBe(2);
  });

  it('sorts by title ascending', () => {
    const sorted = sortPRs(prs, { field: 'title', order: 'asc' });
    expect(sorted[0].title).toBe('Alpha fix');
    expect(sorted[1].title).toBe('Beta feature');
    expect(sorted[2].title).toBe('Gamma update');
  });

  it('sorts by title descending', () => {
    const sorted = sortPRs(prs, { field: 'title', order: 'desc' });
    expect(sorted[0].title).toBe('Gamma update');
  });

  it('sorts by additions descending', () => {
    const sorted = sortPRs(prs, { field: 'additions', order: 'desc' });
    expect(sorted[0].additions).toBe(50);
    expect(sorted[2].additions).toBe(10);
  });

  it('sorts by comments ascending', () => {
    const sorted = sortPRs(prs, { field: 'comments', order: 'asc' });
    expect(sorted[0].comments).toBe(1);
    expect(sorted[2].comments).toBe(7);
  });

  it('does not mutate the original array', () => {
    const original = [...prs];
    sortPRs(prs, { field: 'title', order: 'asc' });
    expect(prs).toEqual(original);
  });
});

describe('parseSortOptions', () => {
  it('returns defaults for undefined inputs', () => {
    expect(parseSortOptions(undefined, undefined)).toEqual({ field: 'mergedAt', order: 'desc' });
  });

  it('returns defaults for invalid inputs', () => {
    expect(parseSortOptions('invalid', 'bad')).toEqual({ field: 'mergedAt', order: 'desc' });
  });

  it('parses valid field and order', () => {
    expect(parseSortOptions('title', 'asc')).toEqual({ field: 'title', order: 'asc' });
  });

  it('falls back field to default when order is valid', () => {
    expect(parseSortOptions('unknown', 'asc')).toEqual({ field: 'mergedAt', order: 'asc' });
  });
});
