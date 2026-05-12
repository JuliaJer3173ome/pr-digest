import {
  getPRStatus,
  matchesIncludeStatuses,
  matchesExcludeStatuses,
  filterByStatus,
  StatusablePR,
} from '../filterByStatus';
import { StatusConfig } from '../../config/statusConfig';

function makePR(overrides: Partial<StatusablePR> = {}): StatusablePR {
  return {
    merged_at: null,
    closed_at: null,
    state: 'open',
    ...overrides,
  };
}

function makeConfig(overrides: Partial<StatusConfig> = {}): StatusConfig {
  return {
    includeStatuses: [],
    excludeStatuses: [],
    matchMode: 'any',
    enabled: true,
    ...overrides,
  };
}

describe('getPRStatus', () => {
  it('returns merged when merged_at is set', () => {
    expect(getPRStatus(makePR({ merged_at: '2024-01-01T00:00:00Z', state: 'closed' }))).toBe('merged');
  });

  it('returns closed when state is closed and not merged', () => {
    expect(getPRStatus(makePR({ state: 'closed' }))).toBe('closed');
  });

  it('returns open when state is open', () => {
    expect(getPRStatus(makePR({ state: 'open' }))).toBe('open');
  });
});

describe('matchesIncludeStatuses', () => {
  it('returns true when no include statuses configured', () => {
    expect(matchesIncludeStatuses(makePR(), makeConfig())).toBe(true);
  });

  it('returns true when pr status is in include list', () => {
    const pr = makePR({ merged_at: '2024-01-01T00:00:00Z', state: 'closed' });
    expect(matchesIncludeStatuses(pr, makeConfig({ includeStatuses: ['merged'] }))).toBe(true);
  });

  it('returns false when pr status not in include list', () => {
    const pr = makePR({ state: 'open' });
    expect(matchesIncludeStatuses(pr, makeConfig({ includeStatuses: ['merged'] }))).toBe(false);
  });

  it('returns true when include list contains "all"', () => {
    expect(matchesIncludeStatuses(makePR(), makeConfig({ includeStatuses: ['all'] }))).toBe(true);
  });
});

describe('matchesExcludeStatuses', () => {
  it('returns true when no exclude statuses configured', () => {
    expect(matchesExcludeStatuses(makePR(), makeConfig())).toBe(true);
  });

  it('returns false when pr status is in exclude list', () => {
    const pr = makePR({ state: 'open' });
    expect(matchesExcludeStatuses(pr, makeConfig({ excludeStatuses: ['open'] }))).toBe(false);
  });

  it('returns false when exclude list contains "all"', () => {
    expect(matchesExcludeStatuses(makePR(), makeConfig({ excludeStatuses: ['all'] }))).toBe(false);
  });
});

describe('filterByStatus', () => {
  const prs = [
    makePR({ state: 'open' }),
    makePR({ merged_at: '2024-01-01T00:00:00Z', state: 'closed' }),
    makePR({ state: 'closed' }),
  ];

  it('returns all PRs when disabled', () => {
    expect(filterByStatus(prs, makeConfig({ enabled: false }))).toHaveLength(3);
  });

  it('filters to only merged PRs', () => {
    const result = filterByStatus(prs, makeConfig({ includeStatuses: ['merged'] }));
    expect(result).toHaveLength(1);
    expect(result[0].merged_at).toBeTruthy();
  });

  it('excludes open PRs', () => {
    const result = filterByStatus(prs, makeConfig({ excludeStatuses: ['open'] }));
    expect(result).toHaveLength(2);
  });
});
