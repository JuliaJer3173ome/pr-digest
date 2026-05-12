import * as core from '@actions/core';

export type ReactionEmoji =
  | '+1'
  | '-1'
  | 'laugh'
  | 'confused'
  | 'heart'
  | 'hooray'
  | 'rocket'
  | 'eyes';

export interface ReactionConfig {
  enabled: boolean;
  includeReactions: ReactionEmoji[];
  minCount: number;
  showTopN: number;
}

const VALID_REACTIONS: ReactionEmoji[] = [
  '+1', '-1', 'laugh', 'confused', 'heart', 'hooray', 'rocket', 'eyes',
];

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export function parseReactionList(value: string): ReactionEmoji[] {
  if (!value.trim()) return [...VALID_REACTIONS];
  return value
    .split(',')
    .map((r) => r.trim() as ReactionEmoji)
    .filter((r) => VALID_REACTIONS.includes(r));
}

export function parseMinCount(value: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 0) return 1;
  return n;
}

export function parseShowTopN(value: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1) return 3;
  return n;
}

export function loadReactionConfig(): ReactionConfig {
  const enabled = parseBooleanFlag(core.getInput('reactions_enabled'), false);
  const includeReactions = parseReactionList(core.getInput('reactions_include'));
  const minCount = parseMinCount(core.getInput('reactions_min_count'));
  const showTopN = parseShowTopN(core.getInput('reactions_show_top'));
  return { enabled, includeReactions, minCount, showTopN };
}
