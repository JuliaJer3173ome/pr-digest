import { filterByAge, getPRAgeInDays, meetsMaxAge, meetsMinAge } from '../filterByAge';
import { PRAgeLimitConfig } from '../../config/prAgeConfig';

const REF_DATE = new Date('2024-06-15T12:00:00Z');

function makePR(number: number, daysAgo: number, useMergedAt = true) {
  const date = new Date(REF_DATE.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  return {
    number,
    merged_at: useMergedAt ? date : null,
    created_at: date,
  };
}

function makeConfig(overrides: Partial<PRAgeLimitConfig> = {}): PRAgeLimitConfig {
  return {
    enabled: true,
    maxAgeDays: null,
    minAgeDays: null,
    warnOldPRs: false,
    ...overrides,
  };
}

describe('getPRAgeInDays', () => {
  it('calculates age from merged_at', () => {
    const pr = makePR(1, 10);
    expect(getPRAgeInDays(pr, REF_DATE)).toBe(10);
  });

  it('falls back to created_at when merged_at is null', () => {
    const pr = makePR(1, 5, false);
    expect(getPRAgeInDays(pr, REF_DATE)).toBe(5);
  });
});

describe('meetsMaxAge', () => {
  it('returns true when age is within limit', () => {
    expect(meetsMaxAge(makePR(1, 10), 30, REF_DATE)).toBe(true);
  });

  it('returns false when age exceeds limit', () => {
    expect(meetsMaxAge(makePR(1, 40), 30, REF_DATE)).toBe(false);
  });
});

describe('meetsMinAge', () => {
  it('returns true when age meets minimum', () => {
    expect(meetsMinAge(makePR(1, 5), 3, REF_DATE)).toBe(true);
  });

  it('returns false when age is below minimum', () => {
    expect(meetsMinAge(makePR(1, 1), 3, REF_DATE)).toBe(false);
  });
});

describe('filterByAge', () => {
  it('returns all PRs when disabled', () => {
    const prs = [makePR(1, 5), makePR(2, 60)];
    const { filtered } = filterByAge(prs, makeConfig({ enabled: false }), REF_DATE);
    expect(filtered).toHaveLength(2);
  });

  it('filters by maxAgeDays', () => {
    const prs = [makePR(1, 10), makePR(2, 40)];
    const { filtered } = filterByAge(prs, makeConfig({ maxAgeDays: 30 }), REF_DATE);
    expect(filtered.map((p) => p.number)).toEqual([1]);
  });

  it('filters by minAgeDays', () => {
    const prs = [makePR(1, 1), makePR(2, 5)];
    const { filtered } = filterByAge(prs, makeConfig({ minAgeDays: 3 }), REF_DATE);
    expect(filtered.map((p) => p.number)).toEqual([2]);
  });

  it('applies both min and max age', () => {
    const prs = [makePR(1, 1), makePR(2, 10), makePR(3, 50)];
    const { filtered } = filterByAge(prs, makeConfig({ minAgeDays: 5, maxAgeDays: 30 }), REF_DATE);
    expect(filtered.map((p) => p.number)).toEqual([2]);
  });

  it('generates warnings for near-limit PRs when warnOldPRs is true', () => {
    const prs = [makePR(1, 25)];
    const { warnings } = filterByAge(prs, makeConfig({ maxAgeDays: 30, warnOldPRs: true }), REF_DATE);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('#1');
  });

  it('returns no warnings when warnOldPRs is false', () => {
    const prs = [makePR(1, 25)];
    const { warnings } = filterByAge(prs, makeConfig({ maxAgeDays: 30, warnOldPRs: false }), REF_DATE);
    expect(warnings).toHaveLength(0);
  });
});
