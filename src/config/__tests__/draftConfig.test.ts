import * as core from '@actions/core';
import {
  parseBooleanFlag,
  parseDraftLabel,
  loadDraftConfig,
} from '../draftConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

describe('parseBooleanFlag', () => {
  it('returns true when value is "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false when value is "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default when value is empty', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(parseBooleanFlag('TRUE', false)).toBe(true);
    expect(parseBooleanFlag('False', true)).toBe(false);
  });
});

describe('parseDraftLabel', () => {
  it('returns the trimmed label string', () => {
    expect(parseDraftLabel('  draft  ')).toBe('draft');
  });

  it('returns null for empty string', () => {
    expect(parseDraftLabel('')).toBeNull();
    expect(parseDraftLabel('   ')).toBeNull();
  });
});

describe('loadDraftConfig', () => {
  it('returns defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadDraftConfig();
    expect(config.includeDrafts).toBe(false);
    expect(config.draftLabel).toBeNull();
    expect(config.warnOnDraft).toBe(false);
  });

  it('parses all inputs correctly', () => {
    setupInputs({
      include_drafts: 'true',
      draft_label: 'WIP',
      warn_on_draft: 'true',
    });
    const config = loadDraftConfig();
    expect(config.includeDrafts).toBe(true);
    expect(config.draftLabel).toBe('WIP');
    expect(config.warnOnDraft).toBe(true);
  });

  it('handles false values explicitly', () => {
    setupInputs({
      include_drafts: 'false',
      draft_label: '',
      warn_on_draft: 'false',
    });
    const config = loadDraftConfig();
    expect(config.includeDrafts).toBe(false);
    expect(config.draftLabel).toBeNull();
    expect(config.warnOnDraft).toBe(false);
  });
});
