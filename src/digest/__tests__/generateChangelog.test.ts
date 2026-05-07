import { generateChangelog, PREntry } from '../generateChangelog';
import type { ChangelogConfig } from '../../config/changelogConfig';

const baseConfig: ChangelogConfig = {
  enabled: true,
  groupBy: 'label',
  style: 'bullet',
  includeBreaking: true,
  breakingLabel: 'breaking-change',
  headerPrefix: '##',
};

const prs: PREntry[] = [
  { number: 1, title: 'Fix login bug', author: 'alice', labels: ['bugfix'], repo: 'org/app', url: 'https://github.com/org/app/pull/1' },
  { number: 2, title: 'Add dark mode', author: 'bob', labels: ['feature'], repo: 'org/app', url: 'https://github.com/org/app/pull/2' },
  { number: 3, title: 'Remove legacy API', author: 'alice', labels: ['breaking-change'], repo: 'org/app', url: 'https://github.com/org/app/pull/3' },
];

describe('generateChangelog', () => {
  it('returns empty string when disabled', () => {
    const result = generateChangelog(prs, { ...baseConfig, enabled: false });
    expect(result).toBe('');
  });

  it('returns empty string when no PRs', () => {
    const result = generateChangelog([], baseConfig);
    expect(result).toBe('');
  });

  it('groups PRs by label', () => {
    const result = generateChangelog(prs, baseConfig);
    expect(result).toContain('## bugfix');
    expect(result).toContain('## feature');
    expect(result).toContain('## breaking-change');
  });

  it('excludes breaking PRs when includeBreaking is false', () => {
    const result = generateChangelog(prs, { ...baseConfig, includeBreaking: false });
    expect(result).not.toContain('Remove legacy API');
    expect(result).toContain('Fix login bug');
  });

  it('formats with bullet style by default', () => {
    const result = generateChangelog([prs[0]], baseConfig);
    expect(result).toMatch(/^- Fix login bug/m);
  });

  it('formats with numbered style', () => {
    const result = generateChangelog([prs[0]], { ...baseConfig, style: 'numbered' });
    expect(result).toMatch(/^1\. Fix login bug/m);
  });

  it('formats with checkbox style', () => {
    const result = generateChangelog([prs[0]], { ...baseConfig, style: 'checkbox' });
    expect(result).toMatch(/^- \[ \] Fix login bug/m);
  });

  it('groups by author', () => {
    const result = generateChangelog(prs, { ...baseConfig, groupBy: 'author' });
    expect(result).toContain('## alice');
    expect(result).toContain('## bob');
  });

  it('groups by repo', () => {
    const result = generateChangelog(prs, { ...baseConfig, groupBy: 'repo' });
    expect(result).toContain('## org/app');
  });

  it('uses custom header prefix', () => {
    const result = generateChangelog([prs[0]], { ...baseConfig, headerPrefix: '###' });
    expect(result).toContain('### bugfix');
  });

  it('includes PR link and author in each item', () => {
    const result = generateChangelog([prs[0]], baseConfig);
    expect(result).toContain('[#1](https://github.com/org/app/pull/1)');
    expect(result).toContain('@alice');
  });
});
