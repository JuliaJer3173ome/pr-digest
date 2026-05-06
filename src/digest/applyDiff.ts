import { DiffConfig, DiffMode } from '../config/diffConfig';

export interface PRWithDiff {
  number: number;
  title: string;
  author: string;
  url: string;
  labels: string[];
  mergedAt: string;
  diff?: string;
  changedFiles?: string[];
}

export function truncateDiff(diff: string, maxLines: number): string {
  if (maxLines === 0) return diff;
  const lines = diff.split('\n');
  if (lines.length <= maxLines) return diff;
  const truncated = lines.slice(0, maxLines).join('\n');
  return `${truncated}\n... (${lines.length - maxLines} more lines)`;
}

export function renderDiffSummary(changedFiles: string[]): string {
  if (changedFiles.length === 0) return '';
  const preview = changedFiles.slice(0, 5);
  const extra = changedFiles.length - preview.length;
  const fileList = preview.map(f => `  - ${f}`).join('\n');
  return extra > 0
    ? `${fileList}\n  - ... and ${extra} more`
    : fileList;
}

export function renderDiffBlock(
  pr: PRWithDiff,
  config: DiffConfig
): string {
  if (config.mode === 'none' || !pr.diff) return '';

  const parts: string[] = [];

  if (config.mode === 'summary' && pr.changedFiles && config.showFilenames) {
    parts.push('**Changed files:**');
    parts.push(renderDiffSummary(pr.changedFiles));
  }

  if (config.mode === 'full' && pr.diff) {
    const diffContent = truncateDiff(pr.diff, config.maxLines);
    if (config.showFilenames && pr.changedFiles && pr.changedFiles.length > 0) {
      parts.push('**Changed files:**');
      parts.push(renderDiffSummary(pr.changedFiles));
    }
    parts.push('```diff');
    parts.push(diffContent);
    parts.push('```');
  }

  return parts.join('\n');
}

export function applyDiffsToPRs(
  prs: PRWithDiff[],
  config: DiffConfig
): string[] {
  if (config.mode === 'none') return [];
  return prs.map(pr => renderDiffBlock(pr, config)).filter(Boolean);
}
