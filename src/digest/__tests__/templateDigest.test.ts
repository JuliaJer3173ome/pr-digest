import {
  renderHeader,
  renderSectionCompact,
  renderSectionDefault,
  renderSectionDetailed,
  applyTemplate,
} from '../templateDigest';
import { DigestSection } from '../generateDigest';

const mockSection: DigestSection = {
  label: 'feature',
  prs: [
    { number: 1, title: 'Add login', url: 'https://github.com/org/repo/pull/1', author: 'alice', mergedAt: '2024-05-01T10:00:00Z', labels: ['feature'] },
    { number: 2, title: 'Add signup', url: 'https://github.com/org/repo/pull/2', author: 'bob', mergedAt: '2024-05-02T11:00:00Z', labels: ['feature'] },
  ],
};

describe('renderHeader', () => {
  it('renders default header without date', () => {
    expect(renderHeader()).toBe('# Weekly PR Digest\n');
  });

  it('renders header with date range', () => {
    expect(renderHeader({ from: '2024-05-01', to: '2024-05-07' })).toBe(
      '# Weekly PR Digest (2024-05-01 – 2024-05-07)\n'
    );
  });
});

describe('renderSectionCompact', () => {
  it('renders compact section', () => {
    const result = renderSectionCompact(mockSection);
    expect(result).toContain('**feature** (2)');
    expect(result).toContain('[#1]');
    expect(result).toContain('[#2]');
  });
});

describe('renderSectionDefault', () => {
  it('renders default section with heading', () => {
    const result = renderSectionDefault(mockSection);
    expect(result).toContain('### feature');
    expect(result).toContain('[#1]');
  });
});

describe('renderSectionDetailed', () => {
  it('includes author and date', () => {
    const result = renderSectionDetailed(mockSection);
    expect(result).toContain('@alice');
    expect(result).toContain('2024-05-01');
  });

  it('handles missing author gracefully', () => {
    const section: DigestSection = {
      label: 'fix',
      prs: [{ number: 3, title: 'Fix bug', url: 'https://github.com/org/repo/pull/3', labels: [] }],
    };
    const result = renderSectionDetailed(section);
    expect(result).not.toContain('@');
  });
});

describe('applyTemplate', () => {
  it('renders with default options', () => {
    const result = applyTemplate([mockSection]);
    expect(result).toContain('# Weekly PR Digest');
    expect(result).toContain('2 PRs merged');
    expect(result).toContain('### feature');
  });

  it('renders compact format', () => {
    const result = applyTemplate([mockSection], { format: 'compact', showStats: false, showDate: false });
    expect(result).toContain('**feature** (2)');
    expect(result).not.toContain('# Weekly PR Digest');
  });

  it('hides stats when showStats is false', () => {
    const result = applyTemplate([mockSection], { showStats: false });
    expect(result).not.toContain('PRs merged');
  });
});
