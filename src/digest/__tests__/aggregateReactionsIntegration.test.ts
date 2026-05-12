import * as core from '@actions/core';
import { loadReactionConfig } from '../../config/reactionConfig';
import { aggregateReactions, renderReactionLine, PRWithReactions } from '../aggregateReactions';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

const samplePRs: PRWithReactions[] = [
  { number: 1, title: 'Add feature X', reactions: { '+1': 10, heart: 3, rocket: 7 } },
  { number: 2, title: 'Fix bug Y', reactions: { '+1': 1, confused: 2 } },
  { number: 3, title: 'Refactor Z', reactions: {} },
];

describe('aggregateReactions integration', () => {
  it('produces correct summaries with custom config', () => {
    setupInputs({
      reactions_enabled: 'true',
      reactions_include: '+1,rocket,heart',
      reactions_min_count: '3',
      reactions_show_top: '2',
    });
    const config = loadReactionConfig();
    const result = aggregateReactions(samplePRs, config);

    expect(result[0].reactionSummary).toHaveLength(2);
    expect(result[0].reactionSummary[0].emoji).toBe('+1');
    expect(result[0].reactionSummary[1].emoji).toBe('rocket');

    // PR 2: only +1=1 and confused=2, both below minCount=3, and confused not included
    expect(result[1].reactionSummary).toHaveLength(0);

    // PR 3: no reactions
    expect(result[2].reactionSummary).toHaveLength(0);
  });

  it('renders reaction lines for each PR', () => {
    setupInputs({
      reactions_enabled: 'true',
      reactions_include: '+1,rocket',
      reactions_min_count: '1',
      reactions_show_top: '3',
    });
    const config = loadReactionConfig();
    const result = aggregateReactions(samplePRs, config);
    const lines = result.map((pr) => renderReactionLine(pr.reactionSummary));
    expect(lines[0]).toContain('👍');
    expect(lines[0]).toContain('🚀');
    expect(lines[2]).toBe('');
  });

  it('skips all annotation when disabled', () => {
    setupInputs({ reactions_enabled: 'false' });
    const config = loadReactionConfig();
    const result = aggregateReactions(samplePRs, config);
    result.forEach((pr) => expect(pr.reactionSummary).toEqual([]));
  });
});
