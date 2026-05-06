import {
  computeDigestSummary,
  renderSummaryBlock,
  injectSummaryIntoDigest,
  PRSummaryInput,
} from '../summaryBlock';
import { SummaryConfig } from '../../config/summaryConfig';

const defaultConfig: SummaryConfig = {
  includeSummary: true,
  summaryPosition: 'top',
  showTotalCount: true,
  showAuthorCount: true,
  showLabelBreakdown: false,
};

const samplePRs: PRSummaryInput[] = [
  { title: 'Fix bug', author: 'alice', labels: ['bug', 'urgent'] },
  { title: 'Add feature', author: 'bob', labels: ['feature'] },
  { title: 'Refactor', author: 'alice', labels: ['bug'] },
];

describe('computeDigestSummary', () => {
  it('counts total PRs', () => {
    const summary = computeDigestSummary(samplePRs);
    expect(summary.totalCount).toBe(3);
  });

  it('counts unique authors', () => {
    const summary = computeDigestSummary(samplePRs);
    expect(summary.uniqueAuthors).toBe(2);
  });

  it('aggregates label counts', () => {
    const summary = computeDigestSummary(samplePRs);
    expect(summary.labelCounts['bug']).toBe(2);
    expect(summary.labelCounts['feature']).toBe(1);
    expect(summary.labelCounts['urgent']).toBe(1);
  });

  it('handles empty PR list', () => {
    const summary = computeDigestSummary([]);
    expect(summary.totalCount).toBe(0);
    expect(summary.uniqueAuthors).toBe(0);
    expect(summary.labelCounts).toEqual({});
  });
});

describe('renderSummaryBlock', () => {
  it('renders total and author count by default', () => {
    const summary = computeDigestSummary(samplePRs);
    const block = renderSummaryBlock(summary, defaultConfig);
    expect(block).toContain('Total PRs merged: 3');
    expect(block).toContain('Unique authors: 2');
  });

  it('returns empty string when includeSummary is false', () => {
    const summary = computeDigestSummary(samplePRs);
    const block = renderSummaryBlock(summary, { ...defaultConfig, includeSummary: false });
    expect(block).toBe('');
  });

  it('returns empty string when position is none', () => {
    const summary = computeDigestSummary(samplePRs);
    const block = renderSummaryBlock(summary, { ...defaultConfig, summaryPosition: 'none' });
    expect(block).toBe('');
  });

  it('renders label breakdown when enabled', () => {
    const summary = computeDigestSummary(samplePRs);
    const block = renderSummaryBlock(summary, { ...defaultConfig, showLabelBreakdown: true });
    expect(block).toContain('`bug`: 2');
    expect(block).toContain('`feature`: 1');
  });

  it('omits label section when no labels present', () => {
    const summary = computeDigestSummary([{ title: 'PR', author: 'dev', labels: [] }]);
    const block = renderSummaryBlock(summary, { ...defaultConfig, showLabelBreakdown: true });
    expect(block).not.toContain('Labels');
  });
});

describe('injectSummaryIntoDigest', () => {
  it('prepends summary at top', () => {
    const result = injectSummaryIntoDigest('## PRs', '## Summary\n- Total: 1', 'top');
    expect(result.startsWith('## Summary')).toBe(true);
  });

  it('appends summary at bottom', () => {
    const result = injectSummaryIntoDigest('## PRs', '## Summary\n- Total: 1', 'bottom');
    expect(result.endsWith('## Summary\n- Total: 1')).toBe(true);
  });

  it('returns original digest when summary block is empty', () => {
    const result = injectSummaryIntoDigest('## PRs', '', 'top');
    expect(result).toBe('## PRs');
  });
});
