import * as core from '@actions/core';
import {
  parseBooleanFlag,
  parseRelatedPRLinkStyle,
  parseMaxRelated,
  loadRelatedPRConfig,
} from '../relatedPRConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false', true)).toBe(false);
  });

  it('returns default for unknown value', () => {
    expect(parseBooleanFlag('yes', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });
});

describe('parseRelatedPRLinkStyle', () => {
  it('parses valid styles', () => {
    expect(parseRelatedPRLinkStyle('inline')).toBe('inline');
    expect(parseRelatedPRLinkStyle('footnote')).toBe('footnote');
    expect(parseRelatedPRLinkStyle('none')).toBe('none');
  });

  it('defaults to inline for invalid value and warns', () => {
    expect(parseRelatedPRLinkStyle('bad')).toBe('inline');
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('bad'));
  });

  it('trims whitespace', () => {
    expect(parseRelatedPRLinkStyle('  footnote  ')).toBe('footnote');
  });
});

describe('parseMaxRelated', () => {
  it('parses valid positive integer', () => {
    expect(parseMaxRelated('3')).toBe(3);
    expect(parseMaxRelated('10')).toBe(10);
  });

  it('defaults to 5 for invalid values and warns', () => {
    expect(parseMaxRelated('0')).toBe(5);
    expect(parseMaxRelated('-1')).toBe(5);
    expect(parseMaxRelated('abc')).toBe(5);
    expect(mockWarning).toHaveBeenCalledTimes(3);
  });
});

describe('loadRelatedPRConfig', () => {
  it('loads defaults when inputs are empty', () => {
    setupInputs({});
    const config = loadRelatedPRConfig();
    expect(config.enabled).toBe(false);
    expect(config.linkStyle).toBe('inline');
    expect(config.showCrossRepo).toBe(false);
    expect(config.maxRelated).toBe(5);
  });

  it('loads custom values from inputs', () => {
    setupInputs({
      related_prs_enabled: 'true',
      related_pr_link_style: 'footnote',
      related_prs_cross_repo: 'true',
      max_related_prs: '3',
    });
    const config = loadRelatedPRConfig();
    expect(config.enabled).toBe(true);
    expect(config.linkStyle).toBe('footnote');
    expect(config.showCrossRepo).toBe(true);
    expect(config.maxRelated).toBe(3);
  });
});
