import { renderDigest } from '../renderDigest';
import { PullRequest } from '../../github/fetchMergedPRs';

const makePR = (overrides: Partial<PullRequest> = {}): PullRequest => ({
  number: 10,
  title: 'Sample PR',
  html_url: 'https://github.com/org/repo/pull/10',
  merged_at: '2024-01-16T12:00:00Z',
  user: { login: 'contributor' },
  labels: [],
  ...overrides,
});

const options = {
  weekStart: '2024-01-15',
  weekEnd: '2024-01-21',
  repoName: 'org/repo',
};

describe('renderDigest', () => {
  it('returns markdown, slackText and stats', () => {
    const result = renderDigest([makePR()], options);
    expect(result).toHaveProperty('markdown');
    expect(result).toHaveProperty('slackText');
    expect(result).toHaveProperty('stats');
  });

  it('stats.total reflects number of PRs', () => {
    const prs = [makePR(), makePR({ number: 11 })];
    const result = renderDigest(prs, options);
    expect(result.stats.total).toBe(2);
  });

  it('counts unlabeled PRs in stats', () => {
    const result = renderDigest([makePR()], options);
    expect(result.stats.byLabel['unlabeled']).toBe(1);
  });

  it('counts labeled PRs in stats', () => {
    const pr = makePR({ labels: [{ name: 'bug' }] });
    const result = renderDigest([pr], options);
    expect(result.stats.byLabel['bug']).toBe(1);
    expect(result.stats.byLabel['unlabeled']).toBeUndefined();
  });

  it('converts markdown headers to Slack bold', () => {
    const result = renderDigest([makePR({ labels: [{ name: 'feature' }] })], options);
    expect(result.slackText).toContain('*🚀 Features*');
  });

  it('converts markdown links to Slack format', () => {
    const result = renderDigest([makePR()], options);
    expect(result.slackText).toMatch(/<https:\/\/github\.com\/org\/repo\/pull\/10\|#10 Sample PR>/);
  });

  it('replaces markdown list dashes with bullet points', () => {
    const result = renderDigest([makePR()], options);
    expect(result.slackText).toContain('• ');
    expect(result.slackText).not.toMatch(/^- /m);
  });

  it('returns empty stats for no PRs', () => {
    const result = renderDigest([], options);
    expect(result.stats.total).toBe(0);
    expect(result.stats.byLabel).toEqual({});
  });
});
