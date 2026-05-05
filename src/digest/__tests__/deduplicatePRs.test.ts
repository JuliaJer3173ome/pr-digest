import { isDuplicate, pickNewer, deduplicatePRs, PRLike } from '../deduplicatePRs';

const makePR = (number: number, updatedAt: string, title = `PR ${number}`): PRLike => ({
  number,
  updatedAt,
  title,
});

describe('isDuplicate', () => {
  it('returns false when the PR number has not been seen', () => {
    const seen = new Set<number>([1, 2]);
    expect(isDuplicate(seen, makePR(3, '2024-01-01T00:00:00Z'))).toBe(false);
  });

  it('returns true when the PR number is already in the set', () => {
    const seen = new Set<number>([1, 2]);
    expect(isDuplicate(seen, makePR(2, '2024-01-01T00:00:00Z'))).toBe(true);
  });
});

describe('pickNewer', () => {
  it('returns the PR with the later updatedAt', () => {
    const older = makePR(1, '2024-01-01T00:00:00Z');
    const newer = makePR(1, '2024-01-10T00:00:00Z');
    expect(pickNewer(older, newer)).toBe(newer);
    expect(pickNewer(newer, older)).toBe(newer);
  });

  it('returns the first PR when both have the same updatedAt', () => {
    const a = makePR(1, '2024-01-05T00:00:00Z');
    const b = makePR(1, '2024-01-05T00:00:00Z');
    expect(pickNewer(a, b)).toBe(a);
  });
});

describe('deduplicatePRs', () => {
  it('returns an empty array when given an empty array', () => {
    expect(deduplicatePRs([])).toEqual([]);
  });

  it('returns the same PRs when there are no duplicates', () => {
    const prs = [
      makePR(1, '2024-01-01T00:00:00Z'),
      makePR(2, '2024-01-02T00:00:00Z'),
      makePR(3, '2024-01-03T00:00:00Z'),
    ];
    expect(deduplicatePRs(prs)).toHaveLength(3);
  });

  it('removes duplicate PR numbers, keeping the newer entry', () => {
    const prs = [
      makePR(1, '2024-01-01T00:00:00Z', 'Old title'),
      makePR(2, '2024-01-02T00:00:00Z'),
      makePR(1, '2024-01-05T00:00:00Z', 'New title'),
    ];
    const result = deduplicatePRs(prs);
    expect(result).toHaveLength(2);
    const pr1 = result.find((p) => p.number === 1);
    expect(pr1?.title).toBe('New title');
  });

  it('handles multiple duplicates of the same PR', () => {
    const prs = [
      makePR(42, '2024-01-01T00:00:00Z', 'v1'),
      makePR(42, '2024-01-03T00:00:00Z', 'v2'),
      makePR(42, '2024-01-02T00:00:00Z', 'v3'),
    ];
    const result = deduplicatePRs(prs);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('v2');
  });

  it('preserves insertion order for non-duplicate entries', () => {
    const prs = [
      makePR(3, '2024-01-03T00:00:00Z'),
      makePR(1, '2024-01-01T00:00:00Z'),
      makePR(2, '2024-01-02T00:00:00Z'),
    ];
    const result = deduplicatePRs(prs);
    expect(result.map((p) => p.number)).toEqual([3, 1, 2]);
  });
});
