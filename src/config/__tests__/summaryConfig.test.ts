import { parseSummaryPosition, parseBooleanFlag, loadSummaryConfig } from '../summaryConfig';
import * as core from '@actions/core';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    include_summary: '',
    summary_position: '',
    summary_show_total_count: '',
    summary_show_author_count: '',
    summary_show_label_breakdown: '',
  };
  const inputs = { ...defaults, ...overrides };
  mockGetInput.mockImplementation((key: string) => inputs[key] ?? '');
}

describe('parseSummaryPosition', () => {
  it('accepts top', () => expect(parseSummaryPosition('top')).toBe('top'));
  it('accepts bottom', () => expect(parseSummaryPosition('bottom')).toBe('bottom'));
  it('accepts none', () => expect(parseSummaryPosition('none')).toBe('none'));
  it('is case-insensitive', () => expect(parseSummaryPosition('TOP')).toBe('top'));
  it('throws on invalid value', () => {
    expect(() => parseSummaryPosition('middle')).toThrow('Invalid summary position');
  });
});

describe('parseBooleanFlag', () => {
  it('returns default when empty string', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });
  it('parses true values', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
    expect(parseBooleanFlag('1', false)).toBe(true);
    expect(parseBooleanFlag('yes', false)).toBe(true);
  });
  it('parses false values', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
    expect(parseBooleanFlag('0', true)).toBe(false);
    expect(parseBooleanFlag('no', true)).toBe(false);
  });
  it('throws on invalid value', () => {
    expect(() => parseBooleanFlag('maybe', true)).toThrow('Invalid boolean value');
  });
});

describe('loadSummaryConfig', () => {
  it('returns defaults when inputs are empty', () => {
    setupInputs();
    const config = loadSummaryConfig();
    expect(config.includeSummary).toBe(true);
    expect(config.summaryPosition).toBe('top');
    expect(config.showTotalCount).toBe(true);
    expect(config.showAuthorCount).toBe(true);
    expect(config.showLabelBreakdown).toBe(false);
  });

  it('respects overridden inputs', () => {
    setupInputs({
      include_summary: 'false',
      summary_position: 'bottom',
      summary_show_label_breakdown: 'true',
    });
    const config = loadSummaryConfig();
    expect(config.includeSummary).toBe(false);
    expect(config.summaryPosition).toBe('bottom');
    expect(config.showLabelBreakdown).toBe(true);
  });

  it('throws on invalid position', () => {
    setupInputs({ summary_position: 'side' });
    expect(() => loadSummaryConfig()).toThrow('Invalid summary position');
  });
});
