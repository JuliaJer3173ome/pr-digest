import * as core from '@actions/core';

export type OutputFormat = 'markdown' | 'json' | 'text';
export type OutputDestination = 'slack' | 'email' | 'file' | 'stdout';

export interface OutputConfig {
  format: OutputFormat;
  destination: OutputDestination;
  filePath?: string;
  includeHeader: boolean;
  includeFooter: boolean;
  footerText?: string;
}

export function parseOutputFormat(value: string): OutputFormat {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'markdown' || normalized === 'json' || normalized === 'text') {
    return normalized as OutputFormat;
  }
  core.warning(`Unknown output format "${value}", defaulting to "markdown"`);
  return 'markdown';
}

export function parseOutputDestination(value: string): OutputDestination {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'slack' ||
    normalized === 'email' ||
    normalized === 'file' ||
    normalized === 'stdout'
  ) {
    return normalized as OutputDestination;
  }
  core.warning(`Unknown output destination "${value}", defaulting to "stdout"`);
  return 'stdout';
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

export function loadOutputConfig(): OutputConfig {
  const format = parseOutputFormat(core.getInput('output_format') || 'markdown');
  const destination = parseOutputDestination(core.getInput('output_destination') || 'stdout');
  const filePath = core.getInput('output_file_path') || undefined;
  const includeHeader = parseBooleanFlag(core.getInput('output_include_header'), true);
  const includeFooter = parseBooleanFlag(core.getInput('output_include_footer'), false);
  const footerText = core.getInput('output_footer_text') || undefined;

  if (destination === 'file' && !filePath) {
    core.warning('output_destination is "file" but output_file_path is not set; will use "digest.md"');
  }

  return {
    format,
    destination,
    filePath: destination === 'file' ? (filePath ?? 'digest.md') : filePath,
    includeHeader,
    includeFooter,
    footerText,
  };
}
