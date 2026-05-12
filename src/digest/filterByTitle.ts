import { TitleFilterConfig } from '../config/titleFilterConfig';

export interface TitledPR {
  title: string;
  [key: string]: unknown;
}

export function matchesIncludePatterns(
  pr: TitledPR,
  patterns: RegExp[]
): boolean {
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => pattern.test(pr.title));
}

export function matchesExcludePatterns(
  pr: TitledPR,
  patterns: RegExp[]
): boolean {
  if (patterns.length === 0) return false;
  return patterns.some((pattern) => pattern.test(pr.title));
}

export function matchesTitleFilter<T extends TitledPR>(
  pr: T,
  config: TitleFilterConfig
): boolean {
  if (!config.enabled) return true;
  if (!matchesIncludePatterns(pr, config.includeTitlePatterns)) return false;
  if (matchesExcludePatterns(pr, config.excludeTitlePatterns)) return false;
  return true;
}

export function filterByTitle<T extends TitledPR>(
  prs: T[],
  config: TitleFilterConfig
): T[] {
  if (!config.enabled) return prs;
  return prs.filter((pr) => matchesTitleFilter(pr, config));
}
