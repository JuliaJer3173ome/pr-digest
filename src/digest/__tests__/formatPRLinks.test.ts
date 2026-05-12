import {
  formatPRLink,
  formatPRLinkMarkdown,
  formatPRLinkSlack,
  formatPRLinkPlain,
  formatRepoLink,
  formatPRLineWithLink,
  buildPRUrl,
} from '../formatPRLinks';
import { LinkConfig } from '../../config/linkConfig';

const basePR = {
  number: 42,
  title: 'Fix login bug',
  html_url: 'https://github.com/org/repo/pull/42',
  repository: {
    full_name: 'org/repo',
    html_url: 'https://github.com/org/repo',
  },
};

const baseConfig: LinkConfig = {
  style: 'markdown',
  includeRepoLink: true,
  includePRNumber: true,
  customBaseUrl: null,
};

describe('buildPRUrl', () => {
  it('returns html_url when no customBaseUrl', () => {
    expect(buildPRUrl(basePR, null)).toBe('https://github.com/org/repo/pull/42');
  });

  it('builds URL from customBaseUrl', () => {
    expect(buildPRUrl(basePR, 'https://custom.host')).toBe('https://custom.host/pull/42');
  });

  it('strips trailing slash from customBaseUrl', () => {
    expect(buildPRUrl(basePR, 'https://custom.host/')).toBe('https://custom.host/pull/42');
  });
});

describe('formatPRLinkMarkdown', () => {
  it('includes PR number when includePRNumber is true', () => {
    const result = formatPRLinkMarkdown(basePR, baseConfig);
    expect(result).toBe('[#42 Fix login bug](https://github.com/org/repo/pull/42)');
  });

  it('omits PR number when includePRNumber is false', () => {
    const result = formatPRLinkMarkdown(basePR, { ...baseConfig, includePRNumber: false });
    expect(result).toBe('[Fix login bug](https://github.com/org/repo/pull/42)');
  });
});

describe('formatPRLinkSlack', () => {
  it('formats as Slack mrkdwn link', () => {
    const result = formatPRLinkSlack(basePR, { ...baseConfig, style: 'slack' });
    expect(result).toBe('<https://github.com/org/repo/pull/42|#42 Fix login bug>');
  });
});

describe('formatPRLinkPlain', () => {
  it('formats as plain text with URL in parentheses', () => {
    const result = formatPRLinkPlain(basePR, { ...baseConfig, style: 'plain' });
    expect(result).toBe('#42 Fix login bug (https://github.com/org/repo/pull/42)');
  });
});

describe('formatPRLink', () => {
  it('dispatches to markdown by default', () => {
    expect(formatPRLink(basePR, baseConfig)).toContain('[#42');
  });

  it('dispatches to slack style', () => {
    expect(formatPRLink(basePR, { ...baseConfig, style: 'slack' })).toContain('<https://');
  });

  it('dispatches to plain style', () => {
    expect(formatPRLink(basePR, { ...baseConfig, style: 'plain' })).toContain('(https://');
  });
});

describe('formatRepoLink', () => {
  it('returns null when includeRepoLink is false', () => {
    expect(formatRepoLink(basePR, { ...baseConfig, includeRepoLink: false })).toBeNull();
  });

  it('returns null when repository info is missing', () => {
    const pr = { ...basePR, repository: undefined };
    expect(formatRepoLink(pr, baseConfig)).toBeNull();
  });

  it('returns markdown repo link', () => {
    expect(formatRepoLink(basePR, baseConfig)).toBe('[org/repo](https://github.com/org/repo)');
  });
});

describe('formatPRLineWithLink', () => {
  it('includes repo link when available', () => {
    const result = formatPRLineWithLink(basePR, baseConfig);
    expect(result).toContain('— [org/repo]');
  });

  it('omits repo link when includeRepoLink is false', () => {
    const result = formatPRLineWithLink(basePR, { ...baseConfig, includeRepoLink: false });
    expect(result).not.toContain('—');
    expect(result).toMatch(/^- \[/);
  });
});
