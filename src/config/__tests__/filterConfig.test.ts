import * as core from '@actions/core';
import { loadFilterConfig } from '../filterConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('loadFilterConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty config when no inputs are provided', () => {
    setupInputs({});
    const config = loadFilterConfig();
    expect(config).toEqual({});
  });

  it('parses filter_labels into labels array', () => {
    setupInputs({ filter_labels: 'feature, bug, enhancement' });
    const config = loadFilterConfig();
    expect(config.labels).toEqual(['feature', 'bug', 'enhancement']);
  });

  it('parses exclude_labels into excludeLabels array', () => {
    setupInputs({ exclude_labels: 'wip,draft' });
    const config = loadFilterConfig();
    expect(config.excludeLabels).toEqual(['wip', 'draft']);
  });

  it('parses filter_authors into authors array', () => {
    setupInputs({ filter_authors: 'alice, bob' });
    const config = loadFilterConfig();
    expect(config.authors).toEqual(['alice', 'bob']);
  });

  it('parses exclude_authors into excludeAuthors array', () => {
    setupInputs({ exclude_authors: 'bot-user' });
    const config = loadFilterConfig();
    expect(config.excludeAuthors).toEqual(['bot-user']);
  });

  it('parses min_comments as a number', () => {
    setupInputs({ min_comments: '3' });
    const config = loadFilterConfig();
    expect(config.minComments).toBe(3);
  });

  it('does not set minComments when value is 0', () => {
    setupInputs({ min_comments: '0' });
    const config = loadFilterConfig();
    expect(config.minComments).toBeUndefined();
  });

  it('throws when min_comments is not a valid number', () => {
    setupInputs({ min_comments: 'abc' });
    expect(() => loadFilterConfig()).toThrow(
      'Invalid value for min_comments: "abc" is not a number'
    );
  });

  it('ignores empty entries in comma-separated lists', () => {
    setupInputs({ filter_labels: 'feature,,bug, ' });
    const config = loadFilterConfig();
    expect(config.labels).toEqual(['feature', 'bug']);
  });

  it('combines multiple filter options correctly', () => {
    setupInputs({
      filter_labels: 'feature',
      exclude_labels: 'wip',
      exclude_authors: 'dependabot',
      min_comments: '1',
    });
    const config = loadFilterConfig();
    expect(config).toEqual({
      labels: ['feature'],
      excludeLabels: ['wip'],
      excludeAuthors: ['dependabot'],
      minComments: 1,
    });
  });
});
