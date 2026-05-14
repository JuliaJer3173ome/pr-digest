import * as core from '@actions/core';

export type RelatedPRLinkStyle = 'inline' | 'footnote' | 'none';

export interface RelatedPRConfig {
  enabled: boolean;
  linkStyle: RelatedPRLinkStyle;
  showCrossRepo: boolean;
  maxRelated: number;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export function parseRelatedPRLinkStyle(value: string): RelatedPRLinkStyle {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'inline' || normalized === 'footnote' || normalized === 'none') {
    return normalized;
  }
  core.warning(`Invalid related_pr_link_style "${value}", defaulting to "inline"`);
  return 'inline';
}

export function parseMaxRelated(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) {
    core.warning(`Invalid max_related_prs "${value}", defaulting to 5`);
    return 5;
  }
  return parsed;
}

export function loadRelatedPRConfig(): RelatedPRConfig {
  const enabled = parseBooleanFlag(core.getInput('related_prs_enabled'), false);
  const linkStyle = parseRelatedPRLinkStyle(core.getInput('related_pr_link_style') || 'inline');
  const showCrossRepo = parseBooleanFlag(core.getInput('related_prs_cross_repo'), false);
  const maxRelated = parseMaxRelated(core.getInput('max_related_prs') || '5');

  return { enabled, linkStyle, showCrossRepo, maxRelated };
}
