import { StatusConfig, PRStatusFilter } from '../config/statusConfig';

export interface StatusablePR {
  merged_at: string | null;
  closed_at: string | null;
  state: string;
  draft?: boolean;
}

export function getPRStatus(pr: StatusablePR): PRStatusFilter {
  if (pr.merged_at) return 'merged';
  if (pr.state === 'closed') return 'closed';
  if (pr.state === 'open') return 'open';
  return 'closed';
}

export function matchesIncludeStatuses<T extends StatusablePR>(
  pr: T,
  config: StatusConfig
): boolean {
  if (!config.includeStatuses.length) return true;
  if (config.includeStatuses.includes('all')) return true;
  const status = getPRStatus(pr);
  return config.includeStatuses.includes(status);
}

export function matchesExcludeStatuses<T extends StatusablePR>(
  pr: T,
  config: StatusConfig
): boolean {
  if (!config.excludeStatuses.length) return true;
  if (config.excludeStatuses.includes('all')) return false;
  const status = getPRStatus(pr);
  return !config.excludeStatuses.includes(status);
}

export function filterByStatus<T extends StatusablePR>(
  prs: T[],
  config: StatusConfig
): T[] {
  if (!config.enabled) return prs;
  return prs.filter(
    (pr) => matchesIncludeStatuses(pr, config) && matchesExcludeStatuses(pr, config)
  );
}
