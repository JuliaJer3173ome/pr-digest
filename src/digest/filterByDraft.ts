import * as core from '@actions/core';
import { DraftConfig } from '../config/draftConfig';

export interface DraftablePR {
  number: number;
  title: string;
  draft: boolean;
  labels: { name: string }[];
}

export function isDraft<T extends DraftablePR>(pr: T): boolean {
  return pr.draft === true;
}

export function hasDraftLabel<T extends DraftablePR>(
  pr: T,
  labelName: string
): boolean {
  return pr.labels.some(
    (l) => l.name.toLowerCase() === labelName.toLowerCase()
  );
}

export function shouldIncludePR<T extends DraftablePR>(
  pr: T,
  config: DraftConfig
): boolean {
  const draft = isDraft(pr) || (config.draftLabel != null && hasDraftLabel(pr, config.draftLabel));

  if (!draft) return true;

  if (config.includeDrafts) {
    if (config.warnOnDraft) {
      core.warning(`PR #${pr.number} "${pr.title}" is a draft and will be included in the digest.`);
    }
    return true;
  }

  return false;
}

export function filterByDraft<T extends DraftablePR>(
  prs: T[],
  config: DraftConfig
): T[] {
  return prs.filter((pr) => shouldIncludePR(pr, config));
}
