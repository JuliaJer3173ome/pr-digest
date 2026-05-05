import { parseTemplateFormat, parseBooleanOption, loadTemplateConfig } from '../templateConfig';

function setupInputs(inputs: Record<string, string>) {
  const getInput = jest.fn((name: string) => inputs[name] ?? '');
  jest.mock('@actions/core', () => ({ getInput }));
  return getInput;
}

beforeEach(() => {
  jest.resetModules();
});

describe('parseTemplateFormat', () => {
  it('accepts valid formats', () => {
    expect(parseTemplateFormat('default')).toBe('default');
    expect(parseTemplateFormat('compact')).toBe('compact');
    expect(parseTemplateFormat('detailed')).toBe('detailed');
  });

  it('is case-insensitive', () => {
    expect(parseTemplateFormat('COMPACT')).toBe('compact');
    expect(parseTemplateFormat('Detailed')).toBe('detailed');
  });

  it('trims whitespace', () => {
    expect(parseTemplateFormat('  default  ')).toBe('default');
  });

  it('throws on invalid format', () => {
    expect(() => parseTemplateFormat('fancy')).toThrow(/Invalid template format/);
  });
});

describe('parseBooleanOption', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanOption('true', false)).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanOption('false', true)).toBe(false);
  });

  it('returns default for empty string', () => {
    expect(parseBooleanOption('', true)).toBe(true);
    expect(parseBooleanOption('', false)).toBe(false);
  });

  it('throws on invalid value', () => {
    expect(() => parseBooleanOption('yes', true)).toThrow(/Invalid boolean value/);
  });
});

describe('loadTemplateConfig', () => {
  it('returns empty object when no inputs provided', () => {
    jest.mock('@actions/core', () => ({ getInput: () => '' }));
    const { loadTemplateConfig: load } = require('../templateConfig');
    expect(load()).toEqual({});
  });

  it('parses all provided inputs', () => {
    jest.mock('@actions/core', () => ({
      getInput: (name: string) =>
        ({ template_format: 'compact', template_show_stats: 'false', template_show_date: 'true' }[name] ?? ''),
    }));
    const { loadTemplateConfig: load } = require('../templateConfig');
    expect(load()).toEqual({ format: 'compact', showStats: false, showDate: true });
  });

  it('throws when format is invalid', () => {
    jest.mock('@actions/core', () => ({
      getInput: (name: string) => (name === 'template_format' ? 'invalid' : ''),
    }));
    const { loadTemplateConfig: load } = require('../templateConfig');
    expect(() => load()).toThrow(/Invalid template format/);
  });
});
