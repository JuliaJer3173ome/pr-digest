/**
 * filterByReview.ts
 *
 * Filters PRs based on review criteria such as minimum approvals
 * and review filter mode (any, all, none).
 */

import { ReviewConfig } from '../config/reviewConfig';

export interface ReviewablePR {
  number: number;
  title: string;
  approvals: number;
  reviewers: string[];
  requestedReviewers?: string[];
}

export type ReviewFilterMode = 'any' | 'approved' | 'unapproved';

/**
 * Checks whether a PR meets the minimum approval count threshold.
 */
export function meetsMinApprovals(pr: ReviewablePR, minApprovals: number): boolean {
  return pr.approvals >= minApprovals;
}

/**
 * Checks whether a PR has at least one approval (any reviewer approved).
 */
export function hasAnyApproval(pr: ReviewablePR): boolean {
  return pr.approvals > 0;
}

/**
 * Checks whether a PR has no approvals.
 */
export function hasNoApproval(pr: ReviewablePR): boolean {
  return pr.approvals === 0;
}

/**
 * Applies review-based filter mode to a single PR.
 *
 * - 'any': no filtering, all PRs pass
 * - 'approved': only PRs with at least minApprovals pass
 * - 'unapproved': only PRs with zero approvals pass
 */
export function matchesReviewFilter(
  pr: ReviewablePR,
  mode: ReviewFilterMode,
  minApprovals: number
): boolean {
  switch (mode) {
    case 'approved':
      return meetsMinApprovals(pr, minApprovals);
    case 'unapproved':
      return hasNoApproval(pr);
    case 'any':
    default:
      return true;
  }
}

/**
 * Filters a list of PRs based on the provided review configuration.
 *
 * @param prs - Array of PRs to filter
 * @param config - Review configuration with mode and minApprovals
 * @returns Filtered array of PRs
 */
export function filterByReview<T extends ReviewablePR>(
  prs: T[],
  config: ReviewConfig
): T[] {
  if (!config.enabled) {
    return prs;
  }

  const mode = config.filterMode as ReviewFilterMode;
  const minApprovals = config.minApprovals ?? 1;

  return prs.filter((pr) => matchesReviewFilter(pr, mode, minApprovals));
}
