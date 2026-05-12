import { isPinned, partitionPRs, applyPins, renderPinnedSection } from '../pinPRs';
import { PinConfig } from '../../config/pinConfig';

const baseConfig: PinConfig = {
  enabled: true,
  pinnedLabels: [],
  pinnedAuthors: [],
  pinnedPRNumbers: [],
  pinToTop: true,
};

const makePR = (overrides: Partial<{ number: number; author: string; labels: string[]; title: string }>) => ({
  number: 1,
  author: 'alice',
  labels: [],
  title: 'Test PR',
  ...overrides,
});

describe('isPinned', () => {
  it('pins by PR number', () => {
    const config = { ...baseConfig, pinnedPRNumbers: [42] };
    expect(isPinned(makePR({ number: 42 }), config)).toBe(true);
    expect(isPinned(makePR({ number: 1 }), config)).toBe(false);
  });

  it('pins by author', () => {
    const config = { ...baseConfig, pinnedAuthors: ['alice'] };
    expect(isPinned(makePR({ author: 'alice' }), config)).toBe(true);
    expect(isPinned(makePR({ author: 'bob' }), config)).toBe(false);
  });

  it('pins by label', () => {
    const config = { ...baseConfig, pinnedLabels: ['critical'] };
    expect(isPinned(makePR({ labels: ['critical', 'bug'] }), config)).toBe(true);
    expect(isPinned(makePR({ labels: ['feature'] }), config)).toBe(false);
  });

  it('returns false when no pin criteria match', () => {
    expect(isPinned(makePR({}), baseConfig)).toBe(false);
  });
});

describe('partitionPRs', () => {
  it('separates pinned and non-pinned PRs', () => {
    const config = { ...baseConfig, pinnedPRNumbers: [2] };
    const prs = [makePR({ number: 1 }), makePR({ number: 2 }), makePR({ number: 3 })];
    const { pinned, rest } = partitionPRs(prs, config);
    expect(pinned).toHaveLength(1);
    expect(pinned[0].number).toBe(2);
    expect(rest).toHaveLength(2);
  });
});

describe('applyPins', () => {
  it('returns original list when disabled', () => {
    const config = { ...baseConfig, enabled: false, pinnedPRNumbers: [1] };
    const prs = [makePR({ number: 1 }), makePR({ number: 2 })];
    expect(applyPins(prs, config)).toEqual(prs);
  });

  it('moves pinned PRs to top when pinToTop is true', () => {
    const config = { ...baseConfig, pinnedPRNumbers: [3], pinToTop: true };
    const prs = [makePR({ number: 1 }), makePR({ number: 2 }), makePR({ number: 3 })];
    const result = applyPins(prs, config);
    expect(result[0].number).toBe(3);
  });

  it('moves pinned PRs to bottom when pinToTop is false', () => {
    const config = { ...baseConfig, pinnedPRNumbers: [1], pinToTop: false };
    const prs = [makePR({ number: 1 }), makePR({ number: 2 })];
    const result = applyPins(prs, config);
    expect(result[result.length - 1].number).toBe(1);
  });

  it('returns original order when no PRs are pinned', () => {
    const config = { ...baseConfig, pinnedPRNumbers: [99] };
    const prs = [makePR({ number: 1 }), makePR({ number: 2 })];
    expect(applyPins(prs, config)).toEqual(prs);
  });
});

describe('renderPinnedSection', () => {
  it('returns empty string for no pinned PRs', () => {
    expect(renderPinnedSection([])).toBe('');
  });

  it('renders pinned PRs with pin emoji', () => {
    const prs = [makePR({ number: 5, title: 'Critical fix' })];
    const result = renderPinnedSection(prs);
    expect(result).toContain('📌');
    expect(result).toContain('#5');
    expect(result).toContain('Critical fix');
  });

  it('handles missing title gracefully', () => {
    const pr = { number: 7, author: 'bob', labels: [] };
    const result = renderPinnedSection([pr]);
    expect(result).toContain('(no title)');
  });
});
