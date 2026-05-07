import * as core from '@actions/core';
import {
  parseReviewFilterMode,
  parseMinApprovals,
  parseBooleanFlag,
  loadReviewConfig,
} from '../reviewConfig';

jest.mock('@actions/core');

const mockCore = core as jest.Mocked<typeof core>;

function setupInputs(inputs: Record<string, string>) {
  mockCore.getInput.mockImplementation((name: string) => inputs[name] ?? '');
  mockCore.warning.mockImplementation(() => {});
}

describe('parseReviewFilterMode', () => {
  beforeEach(() => mockCore.warning.mockImplementation(() => {}));

  it('returns "any" for valid input', () => {
    expect(parseReviewFilterMode('any')).toBe('any');
  });

  it('returns "approved" for valid input', () => {
    expect(parseReviewFilterMode('approved')).toBe('approved');
  });

  it('returns "changes_requested" for valid input', () => {
    expect(parseReviewFilterMode('changes_requested')).toBe('changes_requested');
  });

  it('returns "none" for valid input', () => {
    expect(parseReviewFilterMode('none')).toBe('none');
  });

  it('defaults to "any" and warns on invalid input', () => {
    expect(parseReviewFilterMode('invalid')).toBe('any');
    expect(mockCore.warning).toHaveBeenCalled();
  });

  it('handles uppercase input by normalizing', () => {
    expect(parseReviewFilterMode('APPROVED')).toBe('approved');
  });
});

describe('parseMinApprovals', () => {
  beforeEach(() => mockCore.warning.mockImplementation(() => {}));

  it('returns 0 for empty string', () => {
    expect(parseMinApprovals('')).toBe(0);
  });

  it('parses valid positive integer', () => {
    expect(parseMinApprovals('2')).toBe(2);
  });

  it('returns 0 for zero', () => {
    expect(parseMinApprovals('0')).toBe(0);
  });

  it('defaults to 0 and warns on negative value', () => {
    expect(parseMinApprovals('-1')).toBe(0);
    expect(mockCore.warning).toHaveBeenCalled();
  });

  it('defaults to 0 and warns on non-numeric value', () => {
    expect(parseMinApprovals('abc')).toBe(0);
    expect(mockCore.warning).toHaveBeenCalled();
  });
});

describe('loadReviewConfig', () => {
  it('loads default config when no inputs provided', () => {
    setupInputs({});
    const config = loadReviewConfig();
    expect(config.filterMode).toBe('any');
    expect(config.minApprovals).toBe(0);
    expect(config.excludeBots).toBe(false);
  });

  it('loads custom config from inputs', () => {
    setupInputs({
      review_filter_mode: 'approved',
      min_approvals: '3',
      review_exclude_bots: 'true',
    });
    const config = loadReviewConfig();
    expect(config.filterMode).toBe('approved');
    expect(config.minApprovals).toBe(3);
    expect(config.excludeBots).toBe(true);
  });

  it('handles changes_requested mode', () => {
    setupInputs({ review_filter_mode: 'changes_requested' });
    const config = loadReviewConfig();
    expect(config.filterMode).toBe('changes_requested');
  });
});
