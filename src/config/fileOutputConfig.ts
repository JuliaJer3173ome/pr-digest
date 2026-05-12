import * as core from '@actions/core';

export type FileOutputFormat = 'markdown' | 'json' | 'html';

export interface FileOutputConfig {
  enabled: boolean;
  format: FileOutputFormat;
  outputPath: string;
}

export function parseBooleanFlag(value: string, defaultValue = false): boolean {
  if (!value) return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

export function parseFileOutputFormat(value: string): FileOutputFormat {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'json' || normalized === 'html' || normalized === 'markdown') {
    return normalized;
  }
  core.warning(`Invalid file output format "${value}", defaulting to "markdown"`);
  return 'markdown';
}

export function parseOutputPath(value: string, format: FileOutputFormat): string {
  if (value && value.trim()) {
    return value.trim();
  }
  const extensions: Record<FileOutputFormat, string> = {
    markdown: 'md',
    json: 'json',
    html: 'html',
  };
  return `pr-digest.${extensions[format]}`;
}

export function loadFileOutputConfig(): FileOutputConfig {
  const enabled = parseBooleanFlag(core.getInput('file_output_enabled'));
  const format = parseFileOutputFormat(core.getInput('file_output_format') || 'markdown');
  const outputPath = parseOutputPath(core.getInput('file_output_path'), format);

  return { enabled, format, outputPath };
}
