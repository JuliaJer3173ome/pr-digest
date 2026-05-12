import { ReactionConfig, ReactionEmoji } from '../config/reactionConfig';

export interface ReactionCount {
  emoji: ReactionEmoji;
  count: number;
}

export interface PRWithReactions {
  number: number;
  title: string;
  reactions?: Partial<Record<ReactionEmoji, number>>;
  [key: string]: unknown;
}

export interface PRWithReactionSummary extends PRWithReactions {
  reactionSummary: ReactionCount[];
}

export function filterReactions(
  reactions: Partial<Record<ReactionEmoji, number>>,
  config: ReactionConfig
): ReactionCount[] {
  return config.includeReactions
    .map((emoji) => ({ emoji, count: reactions[emoji] ?? 0 }))
    .filter((r) => r.count >= config.minCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, config.showTopN);
}

export function renderReactionLine(summary: ReactionCount[]): string {
  if (summary.length === 0) return '';
  const EMOJI_MAP: Record<ReactionEmoji, string> = {
    '+1': '👍',
    '-1': '👎',
    laugh: '😄',
    confused: '😕',
    heart: '❤️',
    hooray: '🎉',
    rocket: '🚀',
    eyes: '👀',
  };
  return summary.map((r) => `${EMOJI_MAP[r.emoji]} ${r.count}`).join('  ');
}

export function aggregateReactions<T extends PRWithReactions>(
  prs: T[],
  config: ReactionConfig
): PRWithReactionSummary[] {
  if (!config.enabled) {
    return prs.map((pr) => ({ ...pr, reactionSummary: [] }));
  }
  return prs.map((pr) => ({
    ...pr,
    reactionSummary: filterReactions(pr.reactions ?? {}, config),
  }));
}
