import * as core from '@actions/core';

export interface DraftConfig {
  includeDrafts: boolean;
  draftLabel: string | null;
  warnOnDraft: boolean;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (!value || value.trim() === '') return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

export function parseDraftLabel(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function loadDraftConfig(): DraftConfig {
  const includeDrafts = parseBooleanFlag(
    core.getInput('include_drafts'),
    false
  );

  const draftLabel = parseDraftLabel(
    core.getInput('draft_label')
  );

  const warnOnDraft = parseBooleanFlag(
    core.getInput('warn_on_draft'),
    false
  );

  return { includeDrafts, draftLabel, warnOnDraft };
}
