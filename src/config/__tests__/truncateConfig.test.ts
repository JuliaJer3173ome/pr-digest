import { parsePositiveInt, loadTruncateConfig } from '../truncateConfig';

const mockGetInput = jest.fn();
jest.mock('@actions/core', () => ({
  getInput: (name: string) => mockGetInput(name),
}));

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('parsePositiveInt', () => {
  it('returns undefined for empty string', () => {
    expect(parsePositiveInt('', 'field')).toBeUndefined();
  });

  it('returns undefined for whitespace-only string', () => {
    expect(parsePositiveInt('   ', 'field')).toBeUndefined();
  });

  it('parses a valid positive integer', () => {
    expect(parsePositiveInt('5', 'field')).toBe(5);
  });

  it('throws for zero', () => {
    expect(() => parsePositiveInt('0', 'field')).toThrow(
      "Invalid value for 'field'"
    );
  });

  it('throws for negative numbers', () => {
    expect(() => parsePositiveInt('-3', 'field')).toThrow(
      "Invalid value for 'field'"
    );
  });

  it('throws for non-numeric strings', () => {
    expect(() => parsePositiveInt('abc', 'field')).toThrow(
      "Invalid value for 'field'"
    );
  });
});

describe('loadTruncateConfig', () => {
  beforeEach(() => {
    mockGetInput.mockReset();
  });

  it('returns all undefined when no inputs provided', () => {
    setupInputs({});
    const config = loadTruncateConfig();
    expect(config).toEqual({
      maxSections: undefined,
      maxPRsPerSection: undefined,
      maxTotalPRs: undefined,
    });
  });

  it('parses all fields when provided', () => {
    setupInputs({
      max_sections: '3',
      max_prs_per_section: '10',
      max_total_prs: '50',
    });
    const config = loadTruncateConfig();
    expect(config).toEqual({
      maxSections: 3,
      maxPRsPerSection: 10,
      maxTotalPRs: 50,
    });
  });

  it('parses partial fields', () => {
    setupInputs({ max_total_prs: '20' });
    const config = loadTruncateConfig();
    expect(config.maxSections).toBeUndefined();
    expect(config.maxPRsPerSection).toBeUndefined();
    expect(config.maxTotalPRs).toBe(20);
  });

  it('throws when an invalid value is provided', () => {
    setupInputs({ max_sections: 'bad' });
    expect(() => loadTruncateConfig()).toThrow("Invalid value for 'max_sections'");
  });
});
