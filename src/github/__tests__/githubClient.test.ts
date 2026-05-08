import { createGithubClient, buildSearchUrl, buildPullsUrl } from '../githubClient';
import { BaseUrlConfig } from '../../config/baseUrlConfig';

const defaultBaseUrlConfig: BaseUrlConfig = {
  githubApiUrl: 'https://api.github.com',
  githubGraphqlUrl: 'https://api.github.com/graphql',
  useCustomBaseUrl: false,
};

const enterpriseBaseUrlConfig: BaseUrlConfig = {
  githubApiUrl: 'https://ghe.corp.com/api/v3',
  githubGraphqlUrl: 'https://ghe.corp.com/graphql',
  useCustomBaseUrl: true,
};

describe('createGithubClient', () => {
  it('creates a client with default GitHub URLs', () => {
    const client = createGithubClient({
      token: 'ghp_test123',
      baseUrlConfig: defaultBaseUrlConfig,
    });
    expect(client.apiUrl).toBe('https://api.github.com');
    expect(client.graphqlUrl).toBe('https://api.github.com/graphql');
    expect(client.isEnterprise).toBe(false);
    expect(client.octokit).toBeDefined();
  });

  it('creates a client with enterprise URLs', () => {
    const client = createGithubClient({
      token: 'ghp_enterprise',
      baseUrlConfig: enterpriseBaseUrlConfig,
    });
    expect(client.apiUrl).toBe('https://ghe.corp.com/api/v3');
    expect(client.graphqlUrl).toBe('https://ghe.corp.com/graphql');
    expect(client.isEnterprise).toBe(true);
  });

  it('uses custom userAgent when provided', () => {
    const client = createGithubClient({
      token: 'tok',
      baseUrlConfig: defaultBaseUrlConfig,
      userAgent: 'my-custom-agent/1.0',
    });
    expect(client.octokit).toBeDefined();
  });

  it('falls back to default userAgent when not provided', () => {
    const client = createGithubClient({
      token: 'tok',
      baseUrlConfig: defaultBaseUrlConfig,
    });
    expect(client.octokit).toBeDefined();
  });
});

describe('buildSearchUrl', () => {
  it('returns correct search URL for default GitHub', () => {
    expect(buildSearchUrl('https://api.github.com')).toBe(
      'https://api.github.com/search/issues'
    );
  });

  it('returns correct search URL for enterprise', () => {
    expect(buildSearchUrl('https://ghe.corp.com/api/v3')).toBe(
      'https://ghe.corp.com/api/v3/search/issues'
    );
  });
});

describe('buildPullsUrl', () => {
  it('builds pulls URL correctly for default GitHub', () => {
    expect(buildPullsUrl('https://api.github.com', 'myorg', 'myrepo')).toBe(
      'https://api.github.com/repos/myorg/myrepo/pulls'
    );
  });

  it('builds pulls URL correctly for enterprise', () => {
    expect(buildPullsUrl('https://ghe.corp.com/api/v3', 'corp', 'project')).toBe(
      'https://ghe.corp.com/api/v3/repos/corp/project/pulls'
    );
  });
});
