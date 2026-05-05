/**
 * Utilities for truncating digest content to fit within platform limits.
 */

export interface TruncateOptions {
  maxLength: number;
  ellipsis?: string;
  preserveSections?: boolean;
}

export interface TruncateResult {
  content: string;
  truncated: boolean;
  originalLength: number;
}

const DEFAULT_ELLIPSIS = "\n\n_...content truncated due to length limits._";

/**
 * Splits markdown content into top-level sections (by `##` headings).
 */
export function splitIntoSections(content: string): string[] {
  const lines = content.split("\n");
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ") && current.length > 0) {
      sections.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    sections.push(current.join("\n"));
  }

  return sections;
}

/**
 * Truncates digest content to a maximum character length.
 * When `preserveSections` is true, only whole sections are dropped.
 */
export function truncateDigest(
  content: string,
  options: TruncateOptions
): TruncateResult {
  const { maxLength, ellipsis = DEFAULT_ELLIPSIS, preserveSections = true } = options;
  const originalLength = content.length;

  if (originalLength <= maxLength) {
    return { content, truncated: false, originalLength };
  }

  if (!preserveSections) {
    const truncated = content.slice(0, maxLength - ellipsis.length) + ellipsis;
    return { content: truncated, truncated: true, originalLength };
  }

  const sections = splitIntoSections(content);
  const kept: string[] = [];
  let length = ellipsis.length;

  for (const section of sections) {
    const candidate = section.length + (kept.length > 0 ? 1 : 0); // +1 for newline separator
    if (length + candidate <= maxLength) {
      kept.push(section);
      length += candidate;
    } else {
      break;
    }
  }

  const truncatedContent = kept.join("\n") + ellipsis;
  return { content: truncatedContent, truncated: true, originalLength };
}
