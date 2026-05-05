import { PullRequest } from '../github/fetchMergedPRs';

export interface FilterOptions {
  labels?: string[];
  excludeLabels?: string[];
  authors?: string[];
  excludeAuthors?: string[];
  minComments?: number;
}

/**
 * Returns true if the PR matches at least one of the given labels.
 */
export function matchesLabels(pr: PullRequest, labels: string[]): boolean {
  if (labels.length === 0) return true;
  return pr.labels.some((l) => labels.includes(l));
}

/**
 * Returns true if the PR does NOT have any of the excluded labels.
 */
export function excludesByLabels(pr: PullRequest, excludeLabels: string[]): boolean {
  if (excludeLabels.length === 0) return false;
  return pr.labels.some((l) => excludeLabels.includes(l));
}

/**
 * Filters a list of pull requests based on the provided options.
 */
export function filterPRs(
  prs: PullRequest[],
  options: FilterOptions = {}
): PullRequest[] {
  const {
    labels = [],
    excludeLabels = [],
    authors = [],
    excludeAuthors = [],
    minComments = 0,
  } = options;

  return prs.filter((pr) => {
    if (!matchesLabels(pr, labels)) return false;
    if (excludesByLabels(pr, excludeLabels)) return false;
    if (authors.length > 0 && !authors.includes(pr.author)) return false;
    if (excludeAuthors.length > 0 && excludeAuthors.includes(pr.author)) return false;
    if (pr.commentCount < minComments) return false;
    return true;
  });
}
