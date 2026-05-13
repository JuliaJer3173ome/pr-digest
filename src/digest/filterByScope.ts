import { ScopeConfig } from "../config/scopeConfig";

export interface ScopedPR {
  title: string;
  number: number;
}

const CONVENTIONAL_SCOPE_REGEX = /^[a-zA-Z0-9_-]+\(([^)]+)\):/;

export function extractScope(title: string): string | null {
  const match = title.match(CONVENTIONAL_SCOPE_REGEX);
  return match ? match[1] : null;
}

export function normalizeScope(scope: string, caseSensitive: boolean): string {
  return caseSensitive ? scope : scope.toLowerCase();
}

export function matchesIncludeScopes<T extends ScopedPR>(
  pr: T,
  config: ScopeConfig
): boolean {
  const scope = extractScope(pr.title);
  if (!scope) return false;
  const normalizedScope = normalizeScope(scope, config.caseSensitive);
  return config.scopes.some(
    (s) => normalizeScope(s, config.caseSensitive) === normalizedScope
  );
}

export function matchesExcludeScopes<T extends ScopedPR>(
  pr: T,
  config: ScopeConfig
): boolean {
  const scope = extractScope(pr.title);
  if (!scope) return true;
  const normalizedScope = normalizeScope(scope, config.caseSensitive);
  return !config.scopes.some(
    (s) => normalizeScope(s, config.caseSensitive) === normalizedScope
  );
}

export function filterByScope<T extends ScopedPR>(
  prs: T[],
  config: ScopeConfig
): T[] {
  if (!config.enabled || config.mode === "none" || config.scopes.length === 0) {
    return prs;
  }
  if (config.mode === "include") {
    return prs.filter((pr) => matchesIncludeScopes(pr, config));
  }
  if (config.mode === "exclude") {
    return prs.filter((pr) => matchesExcludeScopes(pr, config));
  }
  return prs;
}
