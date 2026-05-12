import { SizeConfig } from '../config/sizeConfig';

export interface SizablePR {
  additions: number;
  deletions: number;
}

export type SizeCategory = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export function getTotalChanges(pr: SizablePR): number {
  return pr.additions + pr.deletions;
}

export function classifySize(
  pr: SizablePR,
  thresholds: SizeConfig['thresholds']
): SizeCategory {
  const total = getTotalChanges(pr);
  if (total <= thresholds.xs) return 'xs';
  if (total <= thresholds.s) return 's';
  if (total <= thresholds.m) return 'm';
  if (total <= thresholds.l) return 'l';
  if (total <= thresholds.xl) return 'xl';
  return 'xxl';
}

export function matchesSizeFilter<T extends SizablePR>(
  pr: T,
  config: SizeConfig
): boolean {
  if (!config.enabled) return true;

  const category = classifySize(pr, config.thresholds);

  if (config.includeSizes.length > 0 && !config.includeSizes.includes(category)) {
    return false;
  }

  if (config.excludeSizes.length > 0 && config.excludeSizes.includes(category)) {
    return false;
  }

  return true;
}

export function filterBySize<T extends SizablePR>(
  prs: T[],
  config: SizeConfig
): T[] {
  if (!config.enabled) return prs;
  return prs.filter((pr) => matchesSizeFilter(pr, config));
}

export function annotatePRsWithSize<T extends SizablePR>(
  prs: T[],
  thresholds: SizeConfig['thresholds']
): (T & { sizeCategory: SizeCategory })[] {
  return prs.map((pr) => ({
    ...pr,
    sizeCategory: classifySize(pr, thresholds),
  }));
}
