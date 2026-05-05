import * as core from '@actions/core';

export interface MentionConfig {
  enabled: boolean;
  slackUserMap: Record<string, string>;
  fallbackMention: string | null;
}

export function parseSlackUserMap(raw: string): Record<string, string> {
  if (!raw.trim()) return {};

  const map: Record<string, string> = {};
  const pairs = raw.split(',').map((s) => s.trim()).filter(Boolean);

  for (const pair of pairs) {
    const [github, slack] = pair.split(':').map((s) => s.trim());
    if (github && slack) {
      map[github] = slack.startsWith('@') ? slack : `@${slack}`;
    }
  }

  return map;
}

export function loadMentionConfig(): MentionConfig {
  const enabled = core.getInput('mention_authors') === 'true';
  const rawMap = core.getInput('slack_user_map');
  const fallback = core.getInput('mention_fallback').trim() || null;

  return {
    enabled,
    slackUserMap: parseSlackUserMap(rawMap),
    fallbackMention: fallback ? (fallback.startsWith('@') ? fallback : `@${fallback}`) : null,
  };
}
