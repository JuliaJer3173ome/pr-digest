import { Octokit } from '@octokit/rest';
import { BaseUrlConfig } from '../config/baseUrlConfig';

export interface GithubClientOptions {
  token: string;
  baseUrlConfig: BaseUrlConfig;
  userAgent?: string;
}

export interface GithubClient {
  octokit: Octokit;
  apiUrl: string;
  graphqlUrl: string;
  isEnterprise: boolean;
}

/**
 * Creates an Octokit instance configured with the appropriate base URLs.
 * Supports GitHub Enterprise Server by allowing custom API/GraphQL endpoints.
 */
export function createGithubClient(options: GithubClientOptions): GithubClient {
  const { token, baseUrlConfig, userAgent = 'pr-digest-action' } = options;
  const { githubApiUrl, githubGraphqlUrl, useCustomBaseUrl } = baseUrlConfig;

  const octokit = new Octokit({
    auth: token,
    baseUrl: githubApiUrl,
    userAgent,
    request: {
      timeout: 10_000,
    },
  });

  return {
    octokit,
    apiUrl: githubApiUrl,
    graphqlUrl: githubGraphqlUrl,
    isEnterprise: useCustomBaseUrl,
  };
}

/**
 * Builds the search query base URL for REST API calls.
 */
export function buildSearchUrl(apiUrl: string): string {
  return `${apiUrl}/search/issues`;
}

/**
 * Returns the pulls endpoint for a given repo.
 */
export function buildPullsUrl(apiUrl: string, owner: string, repo: string): string {
  return `${apiUrl}/repos/${owner}/${repo}/pulls`;
}
