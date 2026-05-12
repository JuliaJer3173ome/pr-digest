import {
  classifySize,
  filterBySize,
  getTotalChanges,
  annotatePRsWithSize,
  matchesSizeFilter,
  SizablePR,
} from '../filterBySize';
import { SizeConfig } from '../../config/sizeConfig';

const defaultThresholds = { xs: 10, s: 30, m: 100, l: 500, xl: 1000 };

function makeConfig(overrides: Partial<SizeConfig> = {}): SizeConfig {
  return {
    enabled: true,
    thresholds: defaultThresholds,
    includeSizes: [],
    excludeSizes: [],
    ...overrides,
  };
}

function makePR(additions: number, deletions: number): SizablePR {
  return { additions, deletions };
}

describe('getTotalChanges', () => {
  it('sums additions and deletions', () => {
    expect(getTotalChanges(makePR(40, 20))).toBe(60);
  });
});

describe('classifySize', () => {
  it('classifies xs when total <= xs threshold', () => {
    expect(classifySize(makePR(5, 3), defaultThresholds)).toBe('xs');
  });

  it('classifies s when total <= s threshold', () => {
    expect(classifySize(makePR(15, 10), defaultThresholds)).toBe('s');
  });

  it('classifies m', () => {
    expect(classifySize(makePR(60, 20), defaultThresholds)).toBe('m');
  });

  it('classifies l', () => {
    expect(classifySize(makePR(300, 100), defaultThresholds)).toBe('l');
  });

  it('classifies xl', () => {
    expect(classifySize(makePR(600, 200), defaultThresholds)).toBe('xl');
  });

  it('classifies xxl when total exceeds xl threshold', () => {
    expect(classifySize(makePR(800, 400), defaultThresholds)).toBe('xxl');
  });
});

describe('matchesSizeFilter', () => {
  it('returns true when not enabled', () => {
    const config = makeConfig({ enabled: false });
    expect(matchesSizeFilter(makePR(9999, 9999), config)).toBe(true);
  });

  it('includes only specified sizes', () => {
    const config = makeConfig({ includeSizes: ['xs', 's'] });
    expect(matchesSizeFilter(makePR(5, 3), config)).toBe(true);
    expect(matchesSizeFilter(makePR(60, 20), config)).toBe(false);
  });

  it('excludes specified sizes', () => {
    const config = makeConfig({ excludeSizes: ['xxl'] });
    expect(matchesSizeFilter(makePR(800, 400), config)).toBe(false);
    expect(matchesSizeFilter(makePR(5, 3), config)).toBe(true);
  });
});

describe('filterBySize', () => {
  it('returns all PRs when disabled', () => {
    const prs = [makePR(5, 3), makePR(800, 400)];
    expect(filterBySize(prs, makeConfig({ enabled: false }))).toHaveLength(2);
  });

  it('filters out excluded size categories', () => {
    const prs = [makePR(5, 3), makePR(60, 20), makePR(800, 400)];
    const result = filterBySize(prs, makeConfig({ excludeSizes: ['xxl'] }));
    expect(result).toHaveLength(2);
  });
});

describe('annotatePRsWithSize', () => {
  it('adds sizeCategory to each PR', () => {
    const prs = [makePR(5, 3), makePR(800, 400)];
    const annotated = annotatePRsWithSize(prs, defaultThresholds);
    expect(annotated[0].sizeCategory).toBe('xs');
    expect(annotated[1].sizeCategory).toBe('xxl');
  });
});
