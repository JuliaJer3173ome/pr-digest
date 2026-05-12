import * as core from '@actions/core';
import {
  parseFileOutputFormat,
  parseOutputPath,
  parseBooleanFlag,
  loadFileOutputConfig,
} from '../fileOutputConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('parseFileOutputFormat', () => {
  it('returns markdown for "markdown"', () => {
    expect(parseFileOutputFormat('markdown')).toBe('markdown');
  });

  it('returns json for "json"', () => {
    expect(parseFileOutputFormat('json')).toBe('json');
  });

  it('returns html for "html"', () => {
    expect(parseFileOutputFormat('html')).toBe('html');
  });

  it('defaults to markdown and warns on unknown format', () => {
    expect(parseFileOutputFormat('xml')).toBe('markdown');
    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('xml'));
  });

  it('is case-insensitive', () => {
    expect(parseFileOutputFormat('JSON')).toBe('json');
    expect(parseFileOutputFormat('Markdown')).toBe('markdown');
  });
});

describe('parseOutputPath', () => {
  it('defaults to pr-digest.md for markdown', () => {
    expect(parseOutputPath('', 'markdown')).toBe('pr-digest.md');
  });

  it('defaults to pr-digest.json for json', () => {
    expect(parseOutputPath('', 'json')).toBe('pr-digest.json');
  });

  it('defaults to pr-digest.html for html', () => {
    expect(parseOutputPath('', 'html')).toBe('pr-digest.html');
  });

  it('uses provided path when given', () => {
    expect(parseOutputPath('output/report.md', 'markdown')).toBe('output/report.md');
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
});

describe('loadFileOutputConfig', () => {
  it('loads defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadFileOutputConfig();
    expect(config.enabled).toBe(false);
    expect(config.format).toBe('markdown');
    expect(config.outputPath).toBe('pr-digest.md');
    expect(config.overwrite).toBe(true);
  });

  it('loads all values from inputs', () => {
    setupInputs({
      file_output_enabled: 'true',
      file_output_format: 'json',
      file_output_path: 'dist/digest.json',
      file_output_overwrite: 'false',
    });
    const config = loadFileOutputConfig();
    expect(config.enabled).toBe(true);
    expect(config.format).toBe('json');
    expect(config.outputPath).toBe('dist/digest.json');
    expect(config.overwrite).toBe(false);
  });
});
