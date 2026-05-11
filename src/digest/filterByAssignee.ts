import { AssigneeConfig } from '../config/assigneeConfig';

export interface AssignablePR {
  number: number;
  title: string;
  assignees?: string[];
}

export function normalizeAssignees(pr: AssignablePR): string[] {
  return (pr.assignees ?? []).map((a) => a.toLowerCase());
}

export function meetsAssigneeRequirement(
  pr: AssignablePR,
  config: AssigneeConfig
): boolean {
  if (config.requireAssigned) {
    const assignees = normalizeAssignees(pr);
    if (assignees.length === 0) return false;
  }
  return true;
}

export function matchesIncludeAssignees(
  pr: AssignablePR,
  includeAssignees: string[]
): boolean {
  if (includeAssignees.length === 0) return true;
  const assignees = normalizeAssignees(pr);
  return includeAssignees.some((a) => assignees.includes(a));
}

export function matchesExcludeAssignees(
  pr: AssignablePR,
  excludeAssignees: string[]
): boolean {
  if (excludeAssignees.length === 0) return false;
  const assignees = normalizeAssignees(pr);
  return excludeAssignees.some((a) => assignees.includes(a));
}

export function filterByAssignee<T extends AssignablePR>(
  prs: T[],
  config: AssigneeConfig
): T[] {
  return prs.filter((pr) => {
    if (!meetsAssigneeRequirement(pr, config)) return false;
    if (!matchesIncludeAssignees(pr, config.includeAssignees)) return false;
    if (matchesExcludeAssignees(pr, config.excludeAssignees)) return false;
    return true;
  });
}
