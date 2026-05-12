import * as core from '@actions/core';

export type LinkStyle = 'markdown' | 'plain' | 'slack';

export interface LinkConfig {
  style: LinkStyle;
  includeRepoLink: boolean;
  includePRNumber: boolean;
  customBaseUrl: string | null;
}

export function parseLinkStyle(value: string): LinkStyle {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'markdown' || normalized === 'plain' || normalized === 'slack') {
    return normalized;
  }
  core.warning(`Invalid link_style "${value}", defaulting to "markdown"`);
  return 'markdown';
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

export function parseCustomBaseUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    new URL(trimmed);
    return trimmed.replace(/\/$/, '');
  } catch {
    core.warning(`Invalid custom_link_base_url "${trimmed}", ignoring`);
    return null;
  }
}

export function loadLinkConfig(): LinkConfig {
  return {
    style: parseLinkStyle(core.getInput('link_style')),
    includeRepoLink: parseBooleanFlag(core.getInput('link_include_repo'), true),
    includePRNumber: parseBooleanFlag(core.getInput('link_include_pr_number'), true),
    customBaseUrl: parseCustomBaseUrl(core.getInput('custom_link_base_url')),
  };
}
