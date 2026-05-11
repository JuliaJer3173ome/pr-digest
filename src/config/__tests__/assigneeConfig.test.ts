import * as core from '@actions/core';
import {
  parseAssigneeList,
  parseBooleanFlag,
  loadAssigneeConfig,
} from '../assigneeConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation(
    (key: string) => inputs[key] ?? ''
  );
}

describe('parseAssigneeList', () => {
  it('returns empty array for empty string', () => {
    expect(parseAssigneeList('')).toEqual([]);
  });

  it('parses comma-separated assignees', () => {
    expect(parseAssigneeList('alice, Bob, CAROL')).toEqual([
      'alice',
      'bob',
      'carol',
    ]);
  });

  it('filters out empty segments', () => {
    expect(parseAssigneeList('alice,,bob')).toEqual(['alice', 'bob']);
  });

  it('handles whitespace-only input', () => {
    expect(parseAssigneeList('   ')).toEqual([]);
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default for unrecognized value', () => {
    expect(parseBooleanFlag('yes', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });
});

describe('loadAssigneeConfig', () => {
  it('loads defaults when inputs are empty', () => {
    setupInputs({});
    const config = loadAssigneeConfig();
    expect(config.includeAssignees).toEqual([]);
    expect(config.excludeAssignees).toEqual([]);
    expect(config.requireAssigned).toBe(false);
    expect(config.showAssignees).toBe(true);
  });

  it('loads include and exclude assignees', () => {
    setupInputs({
      include_assignees: 'alice, bob',
      exclude_assignees: 'carol',
    });
    const config = loadAssigneeConfig();
    expect(config.includeAssignees).toEqual(['alice', 'bob']);
    expect(config.excludeAssignees).toEqual(['carol']);
  });

  it('loads requireAssigned and showAssignees flags', () => {
    setupInputs({
      require_assigned: 'true',
      show_assignees: 'false',
    });
    const config = loadAssigneeConfig();
    expect(config.requireAssigned).toBe(true);
    expect(config.showAssignees).toBe(false);
  });
});
