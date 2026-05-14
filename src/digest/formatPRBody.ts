import type { PRBodyConfig, BodyTruncateMode } from '../config/prBodyConfig';

export interface PRWithBody {
  body?: string | null;
}

export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]+>/g, '').trim();
}

export function stripMarkdownSyntax(text: string): string {
  return text
    .replace(/!?\[([^\]]*?)\]\([^)]*?\)/g, '$1') // links/images
    .replace(/#{1,6}\s+/g, '')                     // headings
    .replace(/[*_~`]{1,3}([^*_~`]+)[*_~`]{1,3}/g, '$1') // bold/italic/code
    .replace(/^[-*+]\s+/gm, '')                    // list items
    .trim();
}

export function extractFirstParagraph(text: string): string {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return paragraphs[0] ?? '';
}

export function truncateByMode(text: string, mode: BodyTruncateMode, maxLength: number): string {
  switch (mode) {
    case 'none':
      return text;
    case 'first-paragraph':
      return extractFirstParagraph(text);
    case 'custom':
    case 'summary':
    default: {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength).trimEnd() + '…';
    }
  }
}

export function formatBody(raw: string, config: PRBodyConfig): string {
  let text = raw;
  if (config.stripHtml) text = stripHtmlTags(text);
  if (config.stripMarkdown) text = stripMarkdownSyntax(text);
  text = truncateByMode(text, config.truncateMode, config.maxLength);
  return text.trim();
}

export function annotatePRsWithBody<T extends PRWithBody>(
  prs: T[],
  config: PRBodyConfig
): (T & { formattedBody?: string })[] {
  if (!config.enabled) return prs;
  return prs.map(pr => ({
    ...pr,
    formattedBody: pr.body ? formatBody(pr.body, config) : undefined,
  }));
}
