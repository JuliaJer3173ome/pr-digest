import { CommentConfig, CommentFilterMode } from '../config/commentConfig';

export interface CommentablePR {
  number: number;
  comments: number;
  reviewComments?: number;
}

export function getTotalComments(pr: CommentablePR, includeReview: boolean): number {
  const base = pr.comments ?? 0;
  const review = includeReview ? (pr.reviewComments ?? 0) : 0;
  return base + review;
}

export function meetsMinComments(pr: CommentablePR, min: number, includeReview: boolean): boolean {
  return getTotalComments(pr, includeReview) >= min;
}

export function hasAnyComment(pr: CommentablePR, includeReview: boolean): boolean {
  return getTotalComments(pr, includeReview) > 0;
}

export function hasNoComment(pr: CommentablePR, includeReview: boolean): boolean {
  return getTotalComments(pr, includeReview) === 0;
}

export function matchesCommentFilter<T extends CommentablePR>(
  pr: T,
  config: CommentConfig
): boolean {
  const { filterMode, minComments, includeReviewComments } = config;

  switch (filterMode) {
    case 'any':
      return hasAnyComment(pr, includeReviewComments);
    case 'none':
      return hasNoComment(pr, includeReviewComments);
    case 'min':
      return meetsMinComments(pr, minComments, includeReviewComments);
    default:
      return true;
  }
}

export function filterByComments<T extends CommentablePR>(
  prs: T[],
  config: CommentConfig
): T[] {
  if (config.filterMode === 'any' && config.minComments === 0) {
    return prs;
  }
  return prs.filter((pr) => matchesCommentFilter(pr, config));
}
