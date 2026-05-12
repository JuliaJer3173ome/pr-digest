import * as core from '@actions/core';
import { loadPinConfig } from '../../config/pinConfig';
import { applyPins, renderPinnedSection, partitionPRs } from '../pinPRs';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

const makePR = (number: number, labels: string[] = [], author = 'dev') => ({
  number,
  author,
  labels,
  title: `PR #${number}`,
});

describe('pinPRs integration', () => {
  it('pins by label from config and renders pinned section at top', () => {
    setupInputs({
      pin_enabled: 'true',
      pin_labels: 'hotfix',
      pin_to_top: 'true',
    });
    const config = loadPinConfig();
    const prs = [
      makePR(1, ['feature']),
      makePR(2, ['hotfix']),
      makePR(3, ['bug']),
    ];
    const ordered = applyPins(prs, config);
    expect(ordered[0].number).toBe(2);
    const { pinned } = partitionPRs(prs, config);
    const section = renderPinnedSection(pinned);
    expect(section).toContain('📌 Pinned');
    expect(section).toContain('#2');
  });

  it('pins by author and PR number together', () => {
    setupInputs({
      pin_enabled: 'true',
      pin_authors: 'alice',
      pin_pr_numbers: '5',
      pin_to_top: 'true',
    });
    const config = loadPinConfig();
    const prs = [
      makePR(1, [], 'bob'),
      makePR(3, [], 'alice'),
      makePR(5, [], 'charlie'),
    ];
    const ordered = applyPins(prs, config);
    expect(ordered[0].number).toBe(3);
    expect(ordered[1].number).toBe(5);
    expect(ordered[2].number).toBe(1);
  });

  it('does nothing when pin_enabled is false', () => {
    setupInputs({ pin_enabled: 'false', pin_pr_numbers: '1' });
    const config = loadPinConfig();
    const prs = [makePR(1), makePR(2)];
    expect(applyPins(prs, config)).toEqual(prs);
  });
});
