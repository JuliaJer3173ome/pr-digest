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
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true')).toBe(true);
  });

  it('returns false for "false"', () => {
    expect(parseBooleanFlag('false')).toBe(false);
  });

  it('returns default value for empty string', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(parseBooleanFlag('TRUE')).toBe(true);
    expect(parseBooleanFlag('True')).toBe(true);
  });
});

describe('parseFileOutputFormat', () => {
  it('returns "markdown" for empty string', () => {
    expect(parseFileOutputFormat('')).toBe('markdown');
  });

  it('returns "markdown" for "md"', () => {
    expect(parseFileOutputFormat('md')).toBe('markdown');
  });

  it('returns "json" for "json"', () => {
    expect(parseFileOutputFormat('json')).toBe('json');
  });

  it('returns "html" for "html"', () => {
    expect(parseFileOutputFormat('html')).toBe('html');
  });

  it('warns and falls back to "markdown" for unknown format', () => {
    expect(parseFileOutputFormat('csv')).toBe('markdown');
    expect(core.warning).toHaveBeenCalled();
  });
});

describe('parseOutputPath', () => {
  it('returns provided path when non-empty', () => {
    expect(parseOutputPath('output/report.md', 'markdown')).toBe('output/report.md');
  });

  it('defaults to pr-digest.md for markdown', () => {
    expect(parseOutputPath('', 'markdown')).toBe('pr-digest.md');
  });

  it('defaults to pr-digest.json for json', () => {
    expect(parseOutputPath('', 'json')).toBe('pr-digest.json');
  });

  it('defaults to pr-digest.html for html', () => {
    expect(parseOutputPath('', 'html')).toBe('pr-digest.html');
  });
});

describe('loadFileOutputConfig', () => {
  it('returns defaults when no inputs provided', () => {
    setupInputs({});
    const config = loadFileOutputConfig();
    expect(config.enabled).toBe(false);
    expect(config.format).toBe('markdown');
    expect(config.outputPath).toBe('pr-digest.md');
  });

  it('loads all fields correctly', () => {
    setupInputs({
      file_output_enabled: 'true',
      file_output_format: 'json',
      file_output_path: 'reports/weekly.json',
    });
    const config = loadFileOutputConfig();
    expect(config.enabled).toBe(true);
    expect(config.format).toBe('json');
    expect(config.outputPath).toBe('reports/weekly.json');
  });

  it('uses default path when path is empty and format is html', () => {
    setupInputs({
      file_output_enabled: 'true',
      file_output_format: 'html',
      file_output_path: '',
    });
    const config = loadFileOutputConfig();
    expect(config.outputPath).toBe('pr-digest.html');
  });
});
