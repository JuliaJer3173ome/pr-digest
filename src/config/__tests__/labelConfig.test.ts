import * as core from '@actions/core';
import {
  parseLabels,
  parseLabelAliases,
  loadLabelConfig,
} from '../labelConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('parseLabels', () => {
  it('returns empty array for empty string', () => {
    expect(parseLabels('')).toEqual([]);
  });

  it('parses a single label', () => {
    expect(parseLabels('bug')).toEqual(['bug']);
  });

  it('parses multiple comma-separated labels', () => {
    expect(parseLabels('bug, feature, chore')).toEqual(['bug', 'feature', 'chore']);
  });

  it('trims whitespace around labels', () => {
    expect(parseLabels('  bug  ,  feature  ')).toEqual(['bug', 'feature']);
  });

  it('filters out empty entries', () => {
    expect(parseLabels('bug,,feature')).toEqual(['bug', 'feature']);
  });
});

describe('parseLabelAliases', () => {
  beforeEach(() => mockWarning.mockClear());

  it('returns empty object for empty string', () => {
    expect(parseLabelAliases('')).toEqual({});
  });

  it('parses a single alias', () => {
    expect(parseLabelAliases('bug=Bug Fixes')).toEqual({ bug: 'Bug Fixes' });
  });

  it('parses multiple aliases', () => {
    expect(parseLabelAliases('bug=Bug Fixes,feature=New Features')).toEqual({
      bug: 'Bug Fixes',
      feature: 'New Features',
    });
  });

  it('warns and skips entry missing equals sign', () => {
    const result = parseLabelAliases('bug,feature=New Features');
    expect(mockWarning).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ feature: 'New Features' });
  });

  it('warns and skips entry with empty key', () => {
    const result = parseLabelAliases('=Bug Fixes');
    expect(mockWarning).toHaveBeenCalledTimes(1);
    expect(result).toEqual({});
  });
});

describe('loadLabelConfig', () => {
  beforeEach(() => mockWarning.mockClear());

  it('returns defaults when inputs are empty', () => {
    setupInputs({});
    const config = loadLabelConfig();
    expect(config).toEqual({
      includeLabels: [],
      excludeLabels: [],
      labelAliases: {},
      unlabeledGroupName: 'Unlabeled',
    });
  });

  it('parses all fields from inputs', () => {
    setupInputs({
      include_labels: 'bug, feature',
      exclude_labels: 'wip',
      label_aliases: 'bug=Bug Fixes',
      unlabeled_group_name: 'Misc',
    });
    const config = loadLabelConfig();
    expect(config).toEqual({
      includeLabels: ['bug', 'feature'],
      excludeLabels: ['wip'],
      labelAliases: { bug: 'Bug Fixes' },
      unlabeledGroupName: 'Misc',
    });
  });

  it('uses default unlabeled group name when input is whitespace', () => {
    setupInputs({ unlabeled_group_name: '   ' });
    const config = loadLabelConfig();
    expect(config.unlabeledGroupName).toBe('Unlabeled');
  });
});
