import * as core from '@actions/core';
import {
  parseMilestoneFilterMode,
  parseMilestoneList,
  parseBooleanFlag,
  loadMilestoneConfig,
} from '../milestoneConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseMilestoneFilterMode', () => {
  it('returns "any" for valid input', () => {
    expect(parseMilestoneFilterMode('any')).toBe('any');
  });

  it('returns "none" for valid input', () => {
    expect(parseMilestoneFilterMode('none')).toBe('none');
  });

  it('returns "specific" for valid input', () => {
    expect(parseMilestoneFilterMode('specific')).toBe('specific');
  });

  it('is case-insensitive', () => {
    expect(parseMilestoneFilterMode('ANY')).toBe('any');
  });

  it('defaults to "any" and warns on invalid input', () => {
    expect(parseMilestoneFilterMode('invalid')).toBe('any');
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('invalid'));
  });
});

describe('parseMilestoneList', () => {
  it('parses comma-separated milestone names', () => {
    expect(parseMilestoneList('v1.0, v2.0, v3.0')).toEqual(['v1.0', 'v2.0', 'v3.0']);
  });

  it('returns empty array for empty string', () => {
    expect(parseMilestoneList('')).toEqual([]);
  });

  it('filters out empty entries', () => {
    expect(parseMilestoneList('v1.0,,v2.0')).toEqual(['v1.0', 'v2.0']);
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default for empty string', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
  });

  it('warns and returns default for invalid value', () => {
    expect(parseBooleanFlag('maybe', false)).toBe(false);
    expect(mockWarning).toHaveBeenCalled();
  });
});

describe('loadMilestoneConfig', () => {
  it('loads defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadMilestoneConfig();
    expect(config.filterMode).toBe('any');
    expect(config.milestones).toEqual([]);
    expect(config.includeNoMilestone).toBe(true);
  });

  it('loads specific milestone config', () => {
    setupInputs({
      milestone_filter_mode: 'specific',
      milestones: 'v1.0,v2.0',
      include_no_milestone: 'false',
    });
    const config = loadMilestoneConfig();
    expect(config.filterMode).toBe('specific');
    expect(config.milestones).toEqual(['v1.0', 'v2.0']);
    expect(config.includeNoMilestone).toBe(false);
  });

  it('warns when specific mode has no milestones', () => {
    setupInputs({ milestone_filter_mode: 'specific' });
    loadMilestoneConfig();
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('no milestones provided'));
  });
});
