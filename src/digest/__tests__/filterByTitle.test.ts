import { filterByTitle, matchesTitleFilter, matchesIncludePatterns, matchesExcludePatterns } from '../filterByTitle';
import { TitleFilterConfig } from '../../config/titleFilterConfig';

function makeConfig(overrides: Partial<TitleFilterConfig> = {}): TitleFilterConfig {
  return {
    includeTitlePatterns: [],
    excludeTitlePatterns: [],
    caseSensitive: false,
    enabled: true,
    ...overrides,
  };
}

const prs = [
  { title: 'feat: add dark mode', number: 1 },
  { title: 'fix: resolve null pointer', number: 2 },
  { title: 'WIP: refactor auth', number: 3 },
  { title: 'chore: update deps', number: 4 },
];

describe('matchesIncludePatterns', () => {
  it('returns true when no patterns are provided', () => {
    expect(matchesIncludePatterns(prs[0], [])).toBe(true);
  });

  it('returns true when title matches at least one pattern', () => {
    expect(matchesIncludePatterns(prs[0], [/feat:/])).toBe(true);
  });

  it('returns false when title matches none of the patterns', () => {
    expect(matchesIncludePatterns(prs[0], [/fix:/, /chore:/])).toBe(false);
  });
});

describe('matchesExcludePatterns', () => {
  it('returns false when no patterns are provided', () => {
    expect(matchesExcludePatterns(prs[2], [])).toBe(false);
  });

  it('returns true when title matches an exclude pattern', () => {
    expect(matchesExcludePatterns(prs[2], [/WIP/i])).toBe(true);
  });

  it('returns false when title does not match any exclude pattern', () => {
    expect(matchesExcludePatterns(prs[0], [/WIP/i])).toBe(false);
  });
});

describe('matchesTitleFilter', () => {
  it('returns true when filter is disabled', () => {
    const config = makeConfig({ enabled: false, excludeTitlePatterns: [/feat:/] });
    expect(matchesTitleFilter(prs[0], config)).toBe(true);
  });

  it('returns false when title does not match include patterns', () => {
    const config = makeConfig({ includeTitlePatterns: [/fix:/] });
    expect(matchesTitleFilter(prs[0], config)).toBe(false);
  });

  it('returns false when title matches exclude patterns', () => {
    const config = makeConfig({ excludeTitlePatterns: [/WIP/i] });
    expect(matchesTitleFilter(prs[2], config)).toBe(false);
  });

  it('returns true when title passes both include and exclude checks', () => {
    const config = makeConfig({
      includeTitlePatterns: [/feat:/, /fix:/],
      excludeTitlePatterns: [/WIP/i],
    });
    expect(matchesTitleFilter(prs[0], config)).toBe(true);
    expect(matchesTitleFilter(prs[1], config)).toBe(true);
  });
});

describe('filterByTitle', () => {
  it('returns all PRs when filter is disabled', () => {
    const config = makeConfig({ enabled: false });
    expect(filterByTitle(prs, config)).toHaveLength(prs.length);
  });

  it('filters PRs by include pattern', () => {
    const config = makeConfig({ includeTitlePatterns: [/feat:/] });
    const result = filterByTitle(prs, config);
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(1);
  });

  it('excludes PRs matching exclude pattern', () => {
    const config = makeConfig({ excludeTitlePatterns: [/WIP/i] });
    const result = filterByTitle(prs, config);
    expect(result).toHaveLength(3);
    expect(result.find((p) => p.number === 3)).toBeUndefined();
  });

  it('combines include and exclude patterns correctly', () => {
    const config = makeConfig({
      includeTitlePatterns: [/feat:/, /fix:/, /WIP/i],
      excludeTitlePatterns: [/WIP/i],
    });
    const result = filterByTitle(prs, config);
    expect(result.map((p) => p.number)).toEqual([1, 2]);
  });
});
