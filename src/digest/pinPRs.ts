import { PinConfig } from '../config/pinConfig';

export interface PinnablePR {
  number: number;
  author?: string;
  labels?: string[];
}

export function isPinned<T extends PinnablePR>(pr: T, config: PinConfig): boolean {
  if (config.pinnedPRNumbers.includes(pr.number)) return true;
  if (config.pinnedAuthors.length > 0 && pr.author && config.pinnedAuthors.includes(pr.author)) {
    return true;
  }
  if (config.pinnedLabels.length > 0 && pr.labels) {
    return pr.labels.some((label) => config.pinnedLabels.includes(label));
  }
  return false;
}

export function partitionPRs<T extends PinnablePR>(
  prs: T[],
  config: PinConfig
): { pinned: T[]; rest: T[] } {
  const pinned: T[] = [];
  const rest: T[] = [];
  for (const pr of prs) {
    if (isPinned(pr, config)) {
      pinned.push(pr);
    } else {
      rest.push(pr);
    }
  }
  return { pinned, rest };
}

export function applyPins<T extends PinnablePR>(prs: T[], config: PinConfig): T[] {
  if (!config.enabled) return prs;
  const { pinned, rest } = partitionPRs(prs, config);
  if (pinned.length === 0) return prs;
  return config.pinToTop ? [...pinned, ...rest] : [...rest, ...pinned];
}

export function renderPinnedSection<T extends PinnablePR & { title?: string }>(
  pinned: T[]
): string {
  if (pinned.length === 0) return '';
  const lines = pinned.map(
    (pr) => `- 📌 [#${pr.number}] ${pr.title ?? '(no title)'}`
  );
  return `### 📌 Pinned\n\n${lines.join('\n')}\n`;
}
