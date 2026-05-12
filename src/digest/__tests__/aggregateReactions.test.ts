import {
  filterReactions,
  renderReactionLine,
  aggregateReactions,
  PRWithReactions,
} from '../aggregateReactions';
import { ReactionConfig } from '../../config/reactionConfig';

const baseConfig: ReactionConfig = {
  enabled: true,
  includeReactions: ['+1', 'heart', 'rocket'],
  minCount: 1,
  showTopN: 3,
};

function makePR(overrides: Partial<PRWithReactions> = {}): PRWithReactions {
  return { number: 1, title: 'Test PR', reactions: {}, ...overrides };
}

describe('filterReactions', () => {
  it('returns sorted reactions above minCount', () => {
    const result = filterReactions({ '+1': 5, heart: 2, rocket: 8 }, baseConfig);
    expect(result[0].emoji).toBe('rocket');
    expect(result[1].emoji).toBe('+1');
    expect(result[2].emoji).toBe('heart');
  });

  it('excludes reactions below minCount', () => {
    const config = { ...baseConfig, minCount: 3 };
    const result = filterReactions({ '+1': 1, heart: 5 }, config);
    expect(result).toHaveLength(1);
    expect(result[0].emoji).toBe('heart');
  });

  it('respects showTopN', () => {
    const config = { ...baseConfig, showTopN: 1 };
    const result = filterReactions({ '+1': 5, heart: 3, rocket: 7 }, config);
    expect(result).toHaveLength(1);
    expect(result[0].emoji).toBe('rocket');
  });

  it('returns empty array when no reactions match', () => {
    const result = filterReactions({}, baseConfig);
    expect(result).toEqual([]);
  });
});

describe('renderReactionLine', () => {
  it('renders emoji with counts', () => {
    const line = renderReactionLine([{ emoji: '+1', count: 3 }, { emoji: 'rocket', count: 1 }]);
    expect(line).toBe('👍 3  🚀 1');
  });

  it('returns empty string for empty summary', () => {
    expect(renderReactionLine([])).toBe('');
  });
});

describe('aggregateReactions', () => {
  it('annotates PRs with reaction summaries', () => {
    const prs = [makePR({ reactions: { '+1': 4, rocket: 2 } })];
    const result = aggregateReactions(prs, baseConfig);
    expect(result[0].reactionSummary).toHaveLength(2);
    expect(result[0].reactionSummary[0].emoji).toBe('+1');
  });

  it('returns empty summaries when disabled', () => {
    const config = { ...baseConfig, enabled: false };
    const prs = [makePR({ reactions: { '+1': 10 } })];
    const result = aggregateReactions(prs, config);
    expect(result[0].reactionSummary).toEqual([]);
  });

  it('handles missing reactions field', () => {
    const prs = [makePR({ reactions: undefined })];
    const result = aggregateReactions(prs, baseConfig);
    expect(result[0].reactionSummary).toEqual([]);
  });
});
