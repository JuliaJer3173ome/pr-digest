import * as core from '@actions/core';
import { parseGroupByField, parseBooleanFlag, loadGroupConfig, GroupByField } from '../groupConfig';

function setupInputs(inputs: Record<string, string>): void {
  jest.spyOn(core, 'getInput').mockImplementation((name: string) => inputs[name] ?? '');
  jest.spyOn(core, 'warning').mockImplementation(() => {});
}

describe('parseGroupByField', () => {
  beforeEach(() => jest.spyOn(core, 'warning').mockImplementation(() => {}));

  it.each([['label'], ['author'], ['repository'], ['none']] as [GroupByField][])(  
    'accepts valid field "%s"',
    (field) => {
      expect(parseGroupByField(field)).toBe(field);
    }
  );

  it('normalizes uppercase input', () => {
    expect(parseGroupByField('AUTHOR')).toBe('author');
  });

  it('trims whitespace', () => {
    expect(parseGroupByField('  label  ')).toBe('label');
  });

  it('defaults to "label" for unknown values and warns', () => {
    const result = parseGroupByField('invalid');
    expect(result).toBe('label');
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('invalid'));
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default when empty', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(parseBooleanFlag('TRUE', false)).toBe(true);
  });
});

describe('loadGroupConfig', () => {
  afterEach(() => jest.restoreAllMocks());

  it('loads defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadGroupConfig();
    expect(config.groupBy).toBe('label');
    expect(config.showUngrouped).toBe(true);
    expect(config.ungroupedLabel).toBe('Other');
  });

  it('loads custom values', () => {
    setupInputs({
      group_by: 'author',
      show_ungrouped: 'false',
      ungrouped_label: 'Miscellaneous',
    });
    const config = loadGroupConfig();
    expect(config.groupBy).toBe('author');
    expect(config.showUngrouped).toBe(false);
    expect(config.ungroupedLabel).toBe('Miscellaneous');
  });

  it('loads repository grouping', () => {
    setupInputs({ group_by: 'repository' });
    const config = loadGroupConfig();
    expect(config.groupBy).toBe('repository');
  });

  it('loads none grouping', () => {
    setupInputs({ group_by: 'none' });
    const config = loadGroupConfig();
    expect(config.groupBy).toBe('none');
  });
});
