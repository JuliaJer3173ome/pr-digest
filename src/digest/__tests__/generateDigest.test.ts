import { generateDigest, DigestOptions } from '../generateDigest';
import { PullRequest } from '../../github/fetchMergedPRs';

const makePR = (overrides: Partial<PullRequest> = {}): PullRequest => ({
  number: 1,
  title: 'Test PR',
  html_url: 'https://github.com/org/repo/pull/1',
  merged_at: '2024-01-15T10:00:00Z',
  user: { login: 'developer' },
  labels: [],
  ...overrides,
});

const options: DigestOptions = {
  weekStart: '2024-01-15',
  weekEnd: '2024-01-21',
  repoName: 'org/repo',
};

describe('generateDigest', () => {
  it('returns empty state message when no PRs', () => {
    const result = generateDigest([], options);
    expect(result).toContain('No pull requests were merged this week.');
    expect(result).toContain('org/repo');
  });

  it('includes header with repo name and period', () => {
    const result = generateDigest([makePR()], options);
    expect(result).toContain('# Weekly PR Digest — org/repo');
    expect(result).toContain('2024-01-15 → 2024-01-21');
    expect(result).toContain('Total merged PRs: 1');
  });

  it('groups feature PRs under Features section', () => {
    const pr = makePR({ labels: [{ name: 'feature' }], title: 'Add new feature' });
    const result = generateDigest([pr], options);
    expect(result).toContain('## 🚀 Features');
    expect(result).toContain('Add new feature');
  });

  it('groups bug PRs under Bug Fixes section', () => {
    const pr = makePR({ labels: [{ name: 'bug' }], title: 'Fix crash' });
    const result = generateDigest([pr], options);
    expect(result).toContain('## 🐛 Bug Fixes');
    expect(result).toContain('Fix crash');
  });

  it('places unlabeled PRs under Other section', () => {
    const pr = makePR({ title: 'Update readme' });
    const result = generateDigest([pr], options);
    expect(result).toContain('## 📦 Other');
    expect(result).toContain('Update readme');
  });

  it('formats PR line with number, title, url and author', () => {
    const pr = makePR({ number: 42, title: 'My PR', user: { login: 'alice' } });
    const result = generateDigest([pr], options);
    expect(result).toContain('[#42 My PR](https://github.com/org/repo/pull/1) by @alice');
  });

  it('omits empty sections', () => {
    const pr = makePR({ labels: [{ name: 'feature' }] });
    const result = generateDigest([pr], options);
    expect(result).not.toContain('## 🐛 Bug Fixes');
    expect(result).not.toContain('## 🔧 Chores');
  });
});
