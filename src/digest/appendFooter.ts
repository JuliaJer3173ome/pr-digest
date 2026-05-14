import { CustomFooterConfig } from '../config/customFooterConfig';

export interface FooterContext {
  repoUrl?: string;
  generatedAt?: Date;
}

export function formatTimestamp(
  date: Date,
  format: 'iso' | 'locale' | 'relative'
): string {
  switch (format) {
    case 'iso':
      return date.toISOString();
    case 'relative': {
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
      const diffHours = Math.round(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      const diffDays = Math.round(diffHours / 24);
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
    case 'locale':
    default:
      return date.toLocaleString();
  }
}

export function buildFooterLines(
  config: CustomFooterConfig,
  context: FooterContext
): string[] {
  const lines: string[] = [];

  if (config.footerText) {
    lines.push(config.footerText);
  }

  if (config.includeTimestamp) {
    const date = context.generatedAt ?? new Date();
    const formatted = formatTimestamp(date, config.timestampFormat);
    lines.push(`_Generated: ${formatted}_`);
  }

  if (config.includeRepoLink && context.repoUrl) {
    lines.push(`[View Repository](${context.repoUrl})`);
  }

  return lines;
}

export function appendFooter(
  digest: string,
  config: CustomFooterConfig,
  context: FooterContext = {}
): string {
  if (!config.enabled) return digest;

  const footerLines = buildFooterLines(config, context);
  if (footerLines.length === 0) return digest;

  const separator = '\n\n---\n';
  const footer = footerLines.join('  \n');
  return `${digest}${separator}${footer}`;
}
