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

  it('returns default value when empty', () => {
    expect(parseBooleanFlag('', true)).toBe(true);
    expect(parseBooleanFlag('', false)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(parseBooleanFlag('TRUE')).toBe(true);
    expect(parseBooleanFlag('True')).toBe(true);
  });
});

describe('parseFileOutputFormat', () => {
  it('parses markdown', () => {
    expect(parseFileOutputFormat('markdown')).toBe('markdown');
  });

  it('parses json', () => {
    expect(parseFileOutputFormat('json')).toBe('json');
  });

  it('parses html', () => {
    expect(parseFileOutputFormat('html')).toBe('html');
  });

  it('defaults to markdown for unknown format', () => {
    expect(parseFileOutputFormat('xml')).toBe('markdown');
    expect(core.warning).toHaveBeenCalled();
  });

  it('is case-insensitive', () => {
    expect(parseFileOutputFormat('JSON')).toBe('json');
  });
});

describe('parseOutputPath', () => {
  it('returns provided path', () => {
    expect(parseOutputPath('output/report.md', 'markdown')).toBe('output/report.md');
  });

  it('generates default path for markdown', () => {
    expect(parseOutputPath('', 'markdown')).toBe('pr-digest.md');
  });

  it('generates default path for json', () => {
    expect(parseOutputPath('', 'json')).toBe('pr-digest.json');
  });

  it('generates default path for html', () => {
    expect(parseOutputPath('', 'html')).toBe('pr-digest.html');
  });
});

describe('loadFileOutputConfig', () => {
  it('loads default config', () => {
    setupInputs({});
    const config = loadFileOutputConfig();
    expect(config.enabled).toBe(false);
    expect(config.format).toBe('markdown');
    expect(config.outputPath).toBe('pr-digest.md');
  });

  it('loads custom config', () => {
    setupInputs({
      file_output_enabled: 'true',
      file_output_format: 'json',
      file_output_path: 'dist/digest.json',
    });
    const config = loadFileOutputConfig();
    expect(config.enabled).toBe(true);
    expect(config.format).toBe('json');
    expect(config.outputPath).toBe('dist/digest.json');
  });
});
