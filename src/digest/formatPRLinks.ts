import { LinkConfig, LinkStyle } from '../config/linkConfig';

export interface LinkablePR {
  number: number;
  title: string;
  html_url: string;
  repository?: { full_name?: string; html_url?: string };
}

export function buildPRUrl(pr: LinkablePR, customBaseUrl: string | null): string {
  if (customBaseUrl) {
    return `${customBaseUrl}/pull/${pr.number}`;
  }
  return pr.html_url;
}

export function formatPRLinkMarkdown(
  pr: LinkablePR,
  config: LinkConfig
): string {
  const url = buildPRUrl(pr, config.customBaseUrl);
  const label = config.includePRNumber ? `#${pr.number} ${pr.title}` : pr.title;
  return `[${label}](${url})`;
}

export function formatPRLinkSlack(
  pr: LinkablePR,
  config: LinkConfig
): string {
  const url = buildPRUrl(pr, config.customBaseUrl);
  const label = config.includePRNumber ? `#${pr.number} ${pr.title}` : pr.title;
  return `<${url}|${label}>`;
}

export function formatPRLinkPlain(
  pr: LinkablePR,
  config: LinkConfig
): string {
  const url = buildPRUrl(pr, config.customBaseUrl);
  const label = config.includePRNumber ? `#${pr.number} ${pr.title}` : pr.title;
  return `${label} (${url})`;
}

export function formatPRLink(pr: LinkablePR, config: LinkConfig): string {
  switch (config.style) {
    case 'slack':
      return formatPRLinkSlack(pr, config);
    case 'plain':
      return formatPRLinkPlain(pr, config);
    case 'markdown':
    default:
      return formatPRLinkMarkdown(pr, config);
  }
}

export function formatRepoLink(pr: LinkablePR, config: LinkConfig): string | null {
  if (!config.includeRepoLink) return null;
  const repoName = pr.repository?.full_name;
  const repoUrl = pr.repository?.html_url;
  if (!repoName || !repoUrl) return null;
  switch (config.style) {
    case 'slack':
      return `<${repoUrl}|${repoName}>`;
    case 'plain':
      return `${repoName} (${repoUrl})`;
    case 'markdown':
    default:
      return `[${repoName}](${repoUrl})`;
  }
}

export function formatPRLineWithLink(pr: LinkablePR, config: LinkConfig): string {
  const prLink = formatPRLink(pr, config);
  const repoLink = formatRepoLink(pr, config);
  return repoLink ? `- ${prLink} — ${repoLink}` : `- ${prLink}`;
}
