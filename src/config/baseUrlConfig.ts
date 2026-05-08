import * as core from '@actions/core';

export interface BaseUrlConfig {
  githubApiUrl: string;
  githubGraphqlUrl: string;
  useCustomBaseUrl: boolean;
}

export function parseGithubApiUrl(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) {
      core.warning(`Invalid protocol in github-api-url: "${trimmed}". Using default.`);
      return fallback;
    }
    return trimmed.replace(/\/$/, '');
  } catch {
    core.warning(`Invalid URL in github-api-url: "${trimmed}". Using default.`);
    return fallback;
  }
}

export function parseGithubGraphqlUrl(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) {
      core.warning(`Invalid protocol in github-graphql-url: "${trimmed}". Using default.`);
      return fallback;
    }
    return trimmed.replace(/\/$/, '');
  } catch {
    core.warning(`Invalid URL in github-graphql-url: "${trimmed}". Using default.`);
    return fallback;
  }
}

const DEFAULT_API_URL = 'https://api.github.com';
const DEFAULT_GRAPHQL_URL = 'https://api.github.com/graphql';

export function loadBaseUrlConfig(): BaseUrlConfig {
  const rawApi = core.getInput('github-api-url');
  const rawGraphql = core.getInput('github-graphql-url');

  const githubApiUrl = parseGithubApiUrl(rawApi, DEFAULT_API_URL);
  const githubGraphqlUrl = parseGithubGraphqlUrl(rawGraphql, DEFAULT_GRAPHQL_URL);

  const useCustomBaseUrl =
    githubApiUrl !== DEFAULT_API_URL || githubGraphqlUrl !== DEFAULT_GRAPHQL_URL;

  return { githubApiUrl, githubGraphqlUrl, useCustomBaseUrl };
}
