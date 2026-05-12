import { BranchConfig } from '../config/branchConfig';

export interface BranchablePR {
  headRef?: string;
  baseRef?: string;
}

export function matchesIncludeBranches<T extends BranchablePR>(
  pr: T,
  include: string[]
): boolean {
  if (include.length === 0) return true;
  const head = pr.headRef ?? '';
  return include.some((pattern) => matchesGlob(head, pattern));
}

export function matchesExcludeBranches<T extends BranchablePR>(
  pr: T,
  exclude: string[]
): boolean {
  if (exclude.length === 0) return false;
  const head = pr.headRef ?? '';
  return exclude.some((pattern) => matchesGlob(head, pattern));
}

export function matchesBaseBranch<T extends BranchablePR>(
  pr: T,
  baseBranch: string
): boolean {
  if (!baseBranch) return true;
  return (pr.baseRef ?? '') === baseBranch;
}

export function matchesGlob(value: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`).test(value);
}

export function filterByBranch<T extends BranchablePR>(
  prs: T[],
  config: BranchConfig
): T[] {
  if (!config.enabled) return prs;

  return prs.filter((pr) => {
    if (!matchesBaseBranch(pr, config.baseBranch)) return false;
    if (matchesExcludeBranches(pr, config.excludeBranches)) return false;
    if (!matchesIncludeBranches(pr, config.includeBranches)) return false;
    return true;
  });
}
