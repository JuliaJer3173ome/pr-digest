import * as core from '@actions/core';
import * as path from 'path';

export type FileOutputFormat = 'markdown' | 'json' | 'html';

export interface FileOutputConfig {
  enabled: boolean;
  outputPath: string;
  format: FileOutputFormat;
  overwrite: boolean;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

export function parseFileOutputFormat(value: string): FileOutputFormat {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'json' || normalized === 'html' || normalized === 'markdown') {
    return normalized as FileOutputFormat;
  }
  core.warning(`Unknown file output format "${value}", defaulting to "markdown"`);
  return 'markdown';
}

export function parseOutputPath(value: string, format: FileOutputFormat): string {
  if (!value) {
    const ext = format === 'json' ? 'json' : format === 'html' ? 'html' : 'md';
    return `pr-digest.${ext}`;
  }
  return path.normalize(value.trim());
}

export function loadFileOutputConfig(): FileOutputConfig {
  const enabled = parseBooleanFlag(core.getInput('file_output_enabled'), false);
  const rawFormat = core.getInput('file_output_format') || 'markdown';
  const format = parseFileOutputFormat(rawFormat);
  const rawPath = core.getInput('file_output_path');
  const outputPath = parseOutputPath(rawPath, format);
  const overwrite = parseBooleanFlag(core.getInput('file_output_overwrite'), true);

  return { enabled, outputPath, format, overwrite };
}
