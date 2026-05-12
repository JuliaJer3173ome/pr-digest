import * as core from '@actions/core';
import { filterByDraft, isDraft, hasDraftLabel, shouldIncludePR } from '../filterByDraft';
import { DraftConfig } from '../../config/draftConfig';

jest.mock('@actions/core');

const makePR = (overrides: Partial<{
  number: number;
  title: string;
  draft: boolean;
  labels: { name: string }[];
}> = {}) => ({
  number: 1,
  title: 'Test PR',
  draft: false,
  labels: [],
  ...overrides,
});

const makeConfig = (overrides: Partial<DraftConfig> = {}): DraftConfig => ({
  includeDrafts: false,
  draftLabel: null,
  warnOnDraft: false,
  ...overrides,
});

describe('isDraft', () => {
  it('returns true for draft PRs', () => {
    expect(isDraft(makePR({ draft: true }))).toBe(true);
  });

  it('returns false for non-draft PRs', () => {
    expect(isDraft(makePR({ draft: false }))).toBe(false);
  });
});

describe('hasDraftLabel', () => {
  it('returns true when PR has the draft label', () => {
    const pr = makePR({ labels: [{ name: 'WIP' }] });
    expect(hasDraftLabel(pr, 'WIP')).toBe(true);
  });

  it('is case-insensitive', () => {
    const pr = makePR({ labels: [{ name: 'wip' }] });
    expect(hasDraftLabel(pr, 'WIP')).toBe(true);
  });

  it('returns false when label is absent', () => {
    const pr = makePR({ labels: [{ name: 'bug' }] });
    expect(hasDraftLabel(pr, 'WIP')).toBe(false);
  });
});

describe('shouldIncludePR', () => {
  it('includes non-draft PRs regardless of config', () => {
    expect(shouldIncludePR(makePR(), makeConfig())).toBe(true);
  });

  it('excludes draft PRs when includeDrafts is false', () => {
    expect(shouldIncludePR(makePR({ draft: true }), makeConfig())).toBe(false);
  });

  it('includes draft PRs when includeDrafts is true', () => {
    expect(shouldIncludePR(makePR({ draft: true }), makeConfig({ includeDrafts: true }))).toBe(true);
  });

  it('emits a warning when warnOnDraft is true and draft is included', () => {
    shouldIncludePR(makePR({ draft: true }), makeConfig({ includeDrafts: true, warnOnDraft: true }));
    expect(core.warning).toHaveBeenCalled();
  });

  it('excludes PR with draft label when includeDrafts is false', () => {
    const pr = makePR({ labels: [{ name: 'WIP' }] });
    expect(shouldIncludePR(pr, makeConfig({ draftLabel: 'WIP' }))).toBe(false);
  });
});

describe('filterByDraft', () => {
  it('removes draft PRs by default', () => {
    const prs = [makePR({ number: 1, draft: false }), makePR({ number: 2, draft: true })];
    expect(filterByDraft(prs, makeConfig())).toHaveLength(1);
    expect(filterByDraft(prs, makeConfig())[0].number).toBe(1);
  });

  it('keeps all PRs when includeDrafts is true', () => {
    const prs = [makePR({ draft: false }), makePR({ draft: true })];
    expect(filterByDraft(prs, makeConfig({ includeDrafts: true }))).toHaveLength(2);
  });

  it('filters by draftLabel when set', () => {
    const prs = [
      makePR({ number: 1, labels: [] }),
      makePR({ number: 2, labels: [{ name: 'WIP' }] }),
    ];
    expect(filterByDraft(prs, makeConfig({ draftLabel: 'WIP' }))).toHaveLength(1);
  });
});
