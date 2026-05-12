import * as core from '@actions/core';
import {
  parseBooleanFlag,
  parseFileOutputFormat,
  parseOutputPath,
  loadFileOutputConfig,
} from '../fileOutputConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
  (core.warning as jest.Mock).mockImplementation(() => {});
}

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => expect(parseBooleanFlag('true')).toBe(true));
  it('returns false for "false"', () => expect(parseBooleanFlag('false')).toBe(false));
  it('is case-insensitive', () => expect(parseBooleanFlag('TRUE')).toBe(true));
  it('trims whitespace', () => expect(parseBooleanFlag('  true  ')).toBe(true));
});

describe('parseFileOutputFormat', () => {
  it('parses markdown', () => expect(parseFileOutputFormat('markdown')).toBe('markdown'));
  it('parses json', () => expect(parseFileOutputFormat('json')).toBe('json'));
  it('parses html', () => expect(parseFileOutputFormat('html')).toBe('html'));
  it('is case-insensitive', () => expect(parseFileOutputFormat('JSON')).toBe('json'));
  it('defaults to markdown on unknown', () => {
    setupInputs({});
    expect(parseFileOutputFormat('xml')).toBe('markdown');
    expect(core.warning).toHaveBeenCalled();
  });
});

describe('parseOutputPath', () => {
  it('returns trimmed path', () => expect(parseOutputPath('  output/report  ')).toBe('output/report'));
  it('returns default when empty', () => expect(parseOutputPath('')).toBe('pr-digest-output'));
  it('returns default when whitespace only', () => expect(parseOutputPath('   ')).toBe('pr-digest-output'));
});

describe('loadFileOutputConfig', () => {
  it('loads defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadFileOutputConfig();
    expect(config.enabled).toBe(false);
    expect(config.format).toBe('markdown');
    expect(config.outputPath).toBe('pr-digest-output');
  });

  it('loads provided inputs', () => {
    setupInputs({
      file_output_enabled: 'true',
      file_output_format: 'json',
      file_output_path: 'dist/digest',
    });
    const config = loadFileOutputConfig();
    expect(config.enabled).toBe(true);
    expect(config.format).toBe('json');
    expect(config.outputPath).toBe('dist/digest');
  });

  it('handles html format', () => {
    setupInputs({ file_output_enabled: 'true', file_output_format: 'html', file_output_path: '' });
    const config = loadFileOutputConfig();
    expect(config.format).toBe('html');
    expect(config.outputPath).toBe('pr-digest-output');
  });
});
