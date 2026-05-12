import * as core from '@actions/core';

export type FileOutputFormat = 'markdown' | 'json' | 'html';

export interface FileOutputConfig {
  enabled: boolean;
  format: FileOutputFormat;
  outputPath: string;
}

export function parseBooleanFlag(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}

export function parseFileOutputFormat(value: string): FileOutputFormat {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'json' || normalized === 'html' || normalized === 'markdown') {
    return normalized;
  }
  core.warning(`Unknown file output format "${value}", defaulting to "markdown"`);
  return 'markdown';
}

export function parseOutputPath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'pr-digest-output';
  }
  return trimmed;
}

export function loadFileOutputConfig(): FileOutputConfig {
  const enabled = parseBooleanFlag(core.getInput('file_output_enabled') || 'false');
  const format = parseFileOutputFormat(core.getInput('file_output_format') || 'markdown');
  const outputPath = parseOutputPath(core.getInput('file_output_path') || '');

  return { enabled, format, outputPath };
}
