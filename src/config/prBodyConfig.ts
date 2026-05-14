import * as core from '@actions/core';

export type BodyTruncateMode = 'none' | 'summary' | 'first-paragraph' | 'custom';

export interface PRBodyConfig {
  enabled: boolean;
  truncateMode: BodyTruncateMode;
  maxLength: number;
  stripHtml: boolean;
  stripMarkdown: boolean;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

export function parseTruncateMode(value: string): BodyTruncateMode {
  const valid: BodyTruncateMode[] = ['none', 'summary', 'first-paragraph', 'custom'];
  const normalized = value.trim().toLowerCase() as BodyTruncateMode;
  if (valid.includes(normalized)) return normalized;
  core.warning(`Invalid pr-body-truncate-mode "${value}", defaulting to "summary"`);
  return 'summary';
}

export function parseMaxLength(value: string, defaultValue: number): number {
  if (!value) return defaultValue;
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 0) {
    core.warning(`Invalid pr-body-max-length "${value}", using default ${defaultValue}`);
    return defaultValue;
  }
  return n;
}

export function loadPRBodyConfig(): PRBodyConfig {
  return {
    enabled: parseBooleanFlag(core.getInput('pr-body-enabled'), false),
    truncateMode: parseTruncateMode(core.getInput('pr-body-truncate-mode') || 'summary'),
    maxLength: parseMaxLength(core.getInput('pr-body-max-length'), 300),
    stripHtml: parseBooleanFlag(core.getInput('pr-body-strip-html'), true),
    stripMarkdown: parseBooleanFlag(core.getInput('pr-body-strip-markdown'), false),
  };
}
