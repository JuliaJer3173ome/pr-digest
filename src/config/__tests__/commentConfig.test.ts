import {
  parseCommentFilterMode,
  parseMinComments,
  parseBooleanFlag,
  loadCommentConfig,
} from '../commentConfig';

const mockGetInput = jest.fn();
jest.mock('@actions/core', () => ({ getInput: (k: string) => mockGetInput(k) }));

function setupInputs(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    'comment-filter-mode': 'any',
    'min-comments': '0',
    'include-review-comments': 'true',
  };
  mockGetInput.mockImplementation((key: string) => overrides[key] ?? defaults[key] ?? '');
}

describe('parseCommentFilterMode', () => {
  it('accepts valid modes', () => {
    expect(parseCommentFilterMode('any')).toBe('any');
    expect(parseCommentFilterMode('none')).toBe('none');
    expect(parseCommentFilterMode('min')).toBe('min');
  });

  it('is case-insensitive', () => {
    expect(parseCommentFilterMode('ANY')).toBe('any');
    expect(parseCommentFilterMode('Min')).toBe('min');
  });

  it('throws on invalid mode', () => {
    expect(() => parseCommentFilterMode('invalid')).toThrow();
  });
});

describe('parseMinComments', () => {
  it('parses valid non-negative integers', () => {
    expect(parseMinComments('0')).toBe(0);
    expect(parseMinComments('5')).toBe(5);
  });

  it('throws on negative values', () => {
    expect(() => parseMinComments('-1')).toThrow();
  });

  it('throws on non-numeric values', () => {
    expect(() => parseMinComments('abc')).toThrow();
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for truthy strings', () => {
    expect(parseBooleanFlag('true')).toBe(true);
    expect(parseBooleanFlag('1')).toBe(true);
    expect(parseBooleanFlag('yes')).toBe(true);
  });

  it('returns false for falsy strings', () => {
    expect(parseBooleanFlag('false')).toBe(false);
    expect(parseBooleanFlag('0')).toBe(false);
    expect(parseBooleanFlag('')).toBe(false);
  });

  it('throws on invalid values', () => {
    expect(() => parseBooleanFlag('maybe')).toThrow();
  });
});

describe('loadCommentConfig', () => {
  beforeEach(() => setupInputs());

  it('loads defaults correctly', () => {
    const config = loadCommentConfig();
    expect(config.filterMode).toBe('any');
    expect(config.minComments).toBe(0);
    expect(config.includeReviewComments).toBe(true);
  });

  it('loads custom values', () => {
    setupInputs({
      'comment-filter-mode': 'min',
      'min-comments': '3',
      'include-review-comments': 'false',
    });
    const config = loadCommentConfig();
    expect(config.filterMode).toBe('min');
    expect(config.minComments).toBe(3);
    expect(config.includeReviewComments).toBe(false);
  });
});
