import * as core from "@actions/core";

export type ScopeFilterMode = "include" | "exclude" | "none";

export interface ScopeConfig {
  enabled: boolean;
  mode: ScopeFilterMode;
  scopes: string[];
  caseSensitive: boolean;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

export function parseScopeFilterMode(value: string): ScopeFilterMode {
  const normalized = value.trim().toLowerCase();
  if (normalized === "include" || normalized === "exclude") return normalized;
  return "none";
}

export function parseScopeList(value: string): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function loadScopeConfig(): ScopeConfig {
  const enabled = parseBooleanFlag(core.getInput("scope_filter_enabled"), false);
  const mode = parseScopeFilterMode(core.getInput("scope_filter_mode"));
  const scopes = parseScopeList(core.getInput("scope_filter_list"));
  const caseSensitive = parseBooleanFlag(
    core.getInput("scope_filter_case_sensitive"),
    false
  );

  return { enabled, mode, scopes, caseSensitive };
}
