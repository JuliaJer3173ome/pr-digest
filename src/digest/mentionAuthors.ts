import { MentionConfig } from '../config/mentionConfig';

export interface AuthoredPR {
  number: number;
  title: string;
  author: string;
  [key: string]: unknown;
}

export function resolveAuthorMention(
  author: string,
  config: MentionConfig
): string | null {
  if (!config.enabled) return null;

  const mapped = config.slackUserMap[author];
  if (mapped) return mapped;

  if (config.fallbackMention) return config.fallbackMention;

  return null;
}

export function formatPRLineWithMention(
  pr: AuthoredPR,
  config: MentionConfig
): string {
  const mention = resolveAuthorMention(pr.author, config);
  const base = `- [#${pr.number}] ${pr.title} (@${pr.author})`;
  if (mention) {
    return `${base} → ${mention}`;
  }
  return base;
}

export function annotatePRsWithMentions(
  prs: AuthoredPR[],
  config: MentionConfig
): string[] {
  return prs.map((pr) => formatPRLineWithMention(pr, config));
}
