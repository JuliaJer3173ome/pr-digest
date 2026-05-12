import {
  matchesGlob,
  matchesIncludeBranches,
  matchesExcludeBranches,
  matchesBaseBranch,
  filterByBranch,
} from '../filterByBranch';
import { BranchConfig } from '../../config/branchConfig';

const makeConfig = (overrides: Partial<BranchConfig> = {}): BranchConfig => ({
  includeBranches: [],
  excludeBranches: [],
  baseBranch: 'main',
  enabled: true,
  ...overrides,
});

const makePR = (headRef: string, baseRef = 'main') => ({ headRef, baseRef });

describe('matchesGlob', () => {
  it('matches exact strings', () => {
    expect(matchesGlob('feature/foo', 'feature/foo')).toBe(true);
  });

  it('matches wildcard patterns', () => {
    expect(matchesGlob('feature/foo', 'feature/*')).toBe(true);
    expect(matchesGlob('fix/bar', 'feature/*')).toBe(false);
  });

  it('does not match partial prefix without wildcard', () => {
    expect(matchesGlob('feature/foo/bar', 'feature/foo')).toBe(false);
  });
});

describe('matchesIncludeBranches', () => {
  it('returns true when include list is empty', () => {
    expect(matchesIncludeBranches(makePR('feature/x'), [])).toBe(true);
  });

  it('returns true when headRef matches a pattern', () => {
    expect(matchesIncludeBranches(makePR('feature/x'), ['feature/*'])).toBe(true);
  });

  it('returns false when headRef does not match', () => {
    expect(matchesIncludeBranches(makePR('chore/y'), ['feature/*'])).toBe(false);
  });
});

describe('matchesExcludeBranches', () => {
  it('returns false when exclude list is empty', () => {
    expect(matchesExcludeBranches(makePR('dependabot/x'), [])).toBe(false);
  });

  it('returns true when headRef matches an exclude pattern', () => {
    expect(matchesExcludeBranches(makePR('dependabot/x'), ['dependabot/*'])).toBe(true);
  });
});

describe('matchesBaseBranch', () => {
  it('returns true when baseRef matches', () => {
    expect(matchesBaseBranch(makePR('feature/x', 'main'), 'main')).toBe(true);
  });

  it('returns false when baseRef does not match', () => {
    expect(matchesBaseBranch(makePR('feature/x', 'develop'), 'main')).toBe(false);
  });
});

describe('filterByBranch', () => {
  it('returns all PRs when disabled', () => {
    const prs = [makePR('dependabot/x'), makePR('feature/y')];
    const result = filterByBranch(prs, makeConfig({ enabled: false }));
    expect(result).toHaveLength(2);
  });

  it('filters by base branch', () => {
    const prs = [makePR('feat/a', 'main'), makePR('feat/b', 'develop')];
    const result = filterByBranch(prs, makeConfig({ baseBranch: 'main' }));
    expect(result).toEqual([makePR('feat/a', 'main')]);
  });

  it('excludes matching branches', () => {
    const prs = [makePR('dependabot/upgrade'), makePR('feature/cool')];
    const result = filterByBranch(prs, makeConfig({ excludeBranches: ['dependabot/*'] }));
    expect(result).toEqual([makePR('feature/cool')]);
  });

  it('includes only matching branches', () => {
    const prs = [makePR('feature/x'), makePR('fix/y'), makePR('chore/z')];
    const result = filterByBranch(prs, makeConfig({ includeBranches: ['feature/*', 'fix/*'] }));
    expect(result).toHaveLength(2);
  });
});
