import { DigestSection } from './generateDigest';

export type TemplateFormat = 'default' | 'compact' | 'detailed';

export interface TemplateOptions {
  format: TemplateFormat;
  showStats: boolean;
  showDate: boolean;
  dateRange?: { from: string; to: string };
}

const DEFAULT_OPTIONS: TemplateOptions = {
  format: 'default',
  showStats: true,
  showDate: true,
};

export function renderHeader(dateRange?: { from: string; to: string }): string {
  if (!dateRange) return '# Weekly PR Digest\n';
  return `# Weekly PR Digest (${dateRange.from} – ${dateRange.to})\n`;
}

export function renderSectionCompact(section: DigestSection): string {
  const lines = section.prs.map((pr) => `- [#${pr.number}](${pr.url}) ${pr.title}`).join('\n');
  return `**${section.label}** (${section.prs.length})\n${lines}`;
}

export function renderSectionDetailed(section: DigestSection): string {
  const lines = section.prs
    .map((pr) => {
      const author = pr.author ? ` — @${pr.author}` : '';
      const mergedAt = pr.mergedAt ? ` _(${pr.mergedAt.slice(0, 10)})_` : '';
      return `- [#${pr.number}](${pr.url}) **${pr.title}**${author}${mergedAt}`;
    })
    .join('\n');
  return `### ${section.label}\n\n${lines}`;
}

export function renderSectionDefault(section: DigestSection): string {
  const lines = section.prs.map((pr) => `- [#${pr.number}](${pr.url}) ${pr.title}`).join('\n');
  return `### ${section.label}\n\n${lines}`;
}

export function applyTemplate(
  sections: DigestSection[],
  options: Partial<TemplateOptions> = {}
): string {
  const opts: TemplateOptions = { ...DEFAULT_OPTIONS, ...options };
  const parts: string[] = [];

  if (opts.showDate) {
    parts.push(renderHeader(opts.dateRange));
  }

  if (opts.showStats) {
    const total = sections.reduce((sum, s) => sum + s.prs.length, 0);
    parts.push(`> ${total} PR${total !== 1 ? 's' : ''} merged across ${sections.length} categor${sections.length !== 1 ? 'ies' : 'y'}.\n`);
  }

  for (const section of sections) {
    if (opts.format === 'compact') {
      parts.push(renderSectionCompact(section));
    } else if (opts.format === 'detailed') {
      parts.push(renderSectionDetailed(section));
    } else {
      parts.push(renderSectionDefault(section));
    }
  }

  return parts.join('\n\n');
}
