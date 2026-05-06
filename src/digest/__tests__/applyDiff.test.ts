import {
  truncateDiff,
  renderDiffSummary,
  renderDiffBlock,
  applyDiffsToPRs,
  PRWithDiff,
} from '../applyDiff';
import { DiffConfig } from '../../config/diffConfig';

const basePR: PRWithDiff = {
  number: 42,
  title: 'Fix bug',
  author: 'alice',
  url: 'https://github.com/org/repo/pull/42',
  labels: ['bug'],
  mergedAt: '2024-01-15T10:00:00Z',
  diff: 'line1\nline2\nline3\nline4\nline5',
  changedFiles: ['src/foo.ts', 'src/bar.ts'],
};

const noneConfig: DiffConfig = { mode: 'none', maxLines: 50, showFilenames: true };
const summaryConfig: DiffConfig = { mode: 'summary', maxLines: 50, showFilenames: true };
const fullConfig: DiffConfig = { mode: 'full', maxLines: 50, showFilenames: true };

describe('truncateDiff', () => {
  it('returns full diff when under maxLines', () => {
    expect(truncateDiff('a\nb\nc', 10)).toBe('a\nb\nc');
  });

  it('truncates diff when over maxLines', () => {
    const result = truncateDiff('a\nb\nc\nd\ne', 3);
    expect(result).toContain('... (2 more lines)');
    expect(result.split('\n')[0]).toBe('a');
  });

  it('returns full diff when maxLines is 0', () => {
    expect(truncateDiff('a\nb\nc', 0)).toBe('a\nb\nc');
  });
});

describe('renderDiffSummary', () => {
  it('returns empty string for no files', () => {
    expect(renderDiffSummary([])).toBe('');
  });

  it('renders up to 5 files', () => {
    const files = ['a.ts', 'b.ts', 'c.ts'];
    const result = renderDiffSummary(files);
    expect(result).toContain('a.ts');
    expect(result).toContain('b.ts');
  });

  it('shows overflow count when more than 5 files', () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const result = renderDiffSummary(files);
    expect(result).toContain('and 2 more');
  });
});

describe('renderDiffBlock', () => {
  it('returns empty string when mode is none', () => {
    expect(renderDiffBlock(basePR, noneConfig)).toBe('');
  });

  it('returns empty string when PR has no diff', () => {
    const pr = { ...basePR, diff: undefined };
    expect(renderDiffBlock(pr, fullConfig)).toBe('');
  });

  it('renders summary block with filenames', () => {
    const result = renderDiffBlock(basePR, summaryConfig);
    expect(result).toContain('Changed files');
    expect(result).toContain('src/foo.ts');
  });

  it('renders full diff block', () => {
    const result = renderDiffBlock(basePR, fullConfig);
    expect(result).toContain('```diff');
    expect(result).toContain('line1');
  });

  it('omits filenames when showFilenames is false', () => {
    const config: DiffConfig = { mode: 'full', maxLines: 50, showFilenames: false };
    const result = renderDiffBlock(basePR, config);
    expect(result).not.toContain('Changed files');
  });
});

describe('applyDiffsToPRs', () => {
  it('returns empty array when mode is none', () => {
    expect(applyDiffsToPRs([basePR], noneConfig)).toEqual([]);
  });

  it('returns rendered blocks for each PR', () => {
    const results = applyDiffsToPRs([basePR], fullConfig);
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('```diff');
  });

  it('filters out PRs with no diff content', () => {
    const pr = { ...basePR, diff: undefined };
    const results = applyDiffsToPRs([pr], fullConfig);
    expect(results).toHaveLength(0);
  });
});
