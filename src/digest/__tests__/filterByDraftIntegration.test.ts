import * as core from '@actions/core';
import { loadDraftConfig } from '../../config/draftConfig';
import { filterByDraft } from '../filterByDraft';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
  (core.warning as jest.Mock).mockImplementation(() => {});
}

const makePR = (number: number, draft: boolean, labels: string[] = []) => ({
  number,
  title: `PR #${number}`,
  draft,
  labels: labels.map((name) => ({ name })),
});

describe('filterByDraft integration', () => {
  it('excludes drafts by default', () => {
    setupInputs({});
    const config = loadDraftConfig();
    const prs = [makePR(1, false), makePR(2, true)];
    const result = filterByDraft(prs, config);
    expect(result.map((p) => p.number)).toEqual([1]);
  });

  it('includes drafts when include_drafts=true', () => {
    setupInputs({ include_drafts: 'true' });
    const config = loadDraftConfig();
    const prs = [makePR(1, false), makePR(2, true)];
    const result = filterByDraft(prs, config);
    expect(result).toHaveLength(2);
  });

  it('warns on draft PRs when warn_on_draft=true', () => {
    setupInputs({ include_drafts: 'true', warn_on_draft: 'true' });
    const config = loadDraftConfig();
    filterByDraft([makePR(3, true)], config);
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('#3'));
  });

  it('filters by custom draft_label', () => {
    setupInputs({ draft_label: 'do-not-merge' });
    const config = loadDraftConfig();
    const prs = [
      makePR(1, false, []),
      makePR(2, false, ['do-not-merge']),
      makePR(3, false, ['bug']),
    ];
    const result = filterByDraft(prs, config);
    expect(result.map((p) => p.number)).toEqual([1, 3]);
  });

  it('includes draft-label PRs when includeDrafts=true', () => {
    setupInputs({ draft_label: 'WIP', include_drafts: 'true' });
    const config = loadDraftConfig();
    const prs = [makePR(1, false, ['WIP']), makePR(2, false, [])];
    const result = filterByDraft(prs, config);
    expect(result).toHaveLength(2);
  });
});
