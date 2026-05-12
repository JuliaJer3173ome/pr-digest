import * as core from '@actions/core';

export type FileOutputFormat = 'markdown' | 'json' | 'html';

export interface FileOutputConfig {
  enabled: boolean;
  format: FileOutputFormat;
  outputPath: string;
}

export function parseBooleanFlag(value: string, defaultValue = false): boolean {
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

export function parseFileOutputFormat(value: string): FileOutputFormat {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'json' || normalized === 'html') return normalized;
  if (normalized === 'markdown' || normalized === 'md' || normalized === '') return 'markdown';
  core.warning(`Unknown file output format "${value}", falling back to "markdown"`);
  return 'markdown';
}

export function parseOutputPath(value: string, format: FileOutputFormat): string {
  if (value.trim() !== '') return value.trim();
  const ext = format === 'json' ? 'json' : format === 'html' ? 'html' : 'md';
  return `pr-digest.${ext}`;
}

export function loadFileOutputConfig(): FileOutputConfig {
  const enabled = parseBooleanFlag(core.getInput('file_output_enabled'));
  const format = parseFileOutputFormat(core.getInput('file_output_format'));
  const outputPath = parseOutputPath(core.getInput('file_output_path'), format);

  return { enabled, format, outputPath };
}
