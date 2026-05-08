import * as core from '@actions/core';
import {
  parseGithubApiUrl,
  parseGithubGraphqlUrl,
  loadBaseUrlConfig,
} from '../baseUrlConfig';

const DEFAULT_API = 'https://api.github.com';
const DEFAULT_GRAPHQL = 'https://api.github.com/graphql';

function setupInputs(inputs: Record<string, string>) {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => inputs[name] ?? '');
  jest.spyOn(core, 'warning').mockImplementation(() => {});
}

describe('parseGithubApiUrl', () => {
  it('returns fallback for empty string', () => {
    expect(parseGithubApiUrl('', DEFAULT_API)).toBe(DEFAULT_API);
  });

  it('returns trimmed valid URL', () => {
    expect(parseGithubApiUrl('https://github.example.com/api/v3/', DEFAULT_API)).toBe(
      'https://github.example.com/api/v3'
    );
  });

  it('returns fallback and warns for invalid URL', () => {
    jest.spyOn(core, 'warning').mockImplementation(() => {});
    const result = parseGithubApiUrl('not-a-url', DEFAULT_API);
    expect(result).toBe(DEFAULT_API);
    expect(core.warning).toHaveBeenCalled();
  });

  it('returns fallback and warns for non-http protocol', () => {
    jest.spyOn(core, 'warning').mockImplementation(() => {});
    const result = parseGithubApiUrl('ftp://example.com', DEFAULT_API);
    expect(result).toBe(DEFAULT_API);
    expect(core.warning).toHaveBeenCalled();
  });
});

describe('parseGithubGraphqlUrl', () => {
  it('returns fallback for empty string', () => {
    expect(parseGithubGraphqlUrl('', DEFAULT_GRAPHQL)).toBe(DEFAULT_GRAPHQL);
  });

  it('strips trailing slash', () => {
    expect(parseGithubGraphqlUrl('https://github.example.com/graphql/', DEFAULT_GRAPHQL)).toBe(
      'https://github.example.com/graphql'
    );
  });
});

describe('loadBaseUrlConfig', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('returns defaults when inputs are empty', () => {
    setupInputs({});
    const config = loadBaseUrlConfig();
    expect(config.githubApiUrl).toBe(DEFAULT_API);
    expect(config.githubGraphqlUrl).toBe(DEFAULT_GRAPHQL);
    expect(config.useCustomBaseUrl).toBe(false);
  });

  it('sets useCustomBaseUrl true when api url is customized', () => {
    setupInputs({ 'github-api-url': 'https://ghe.corp.com/api/v3' });
    const config = loadBaseUrlConfig();
    expect(config.githubApiUrl).toBe('https://ghe.corp.com/api/v3');
    expect(config.useCustomBaseUrl).toBe(true);
  });

  it('sets useCustomBaseUrl true when graphql url is customized', () => {
    setupInputs({ 'github-graphql-url': 'https://ghe.corp.com/graphql' });
    const config = loadBaseUrlConfig();
    expect(config.githubGraphqlUrl).toBe('https://ghe.corp.com/graphql');
    expect(config.useCustomBaseUrl).toBe(true);
  });

  it('sets useCustomBaseUrl false when both are defaults', () => {
    setupInputs({
      'github-api-url': DEFAULT_API,
      'github-graphql-url': DEFAULT_GRAPHQL,
    });
    const config = loadBaseUrlConfig();
    expect(config.useCustomBaseUrl).toBe(false);
  });
});
