import * as core from '@actions/core';

export interface CustomFooterConfig {
  enabled: boolean;
  footerText: string;
  includeTimestamp: boolean;
  timestampFormat: 'iso' | 'locale' | 'relative';
  includeRepoLink: boolean;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

export function parseTimestampFormat(
  value: string
): 'iso' | 'locale' | 'relative' {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'iso' || normalized === 'locale' || normalized === 'relative') {
    return normalized;
  }
  core.warning(`Invalid timestamp-format "${value}", defaulting to "locale"`);
  return 'locale';
}

export function loadCustomFooterConfig(): CustomFooterConfig {
  const enabled = parseBooleanFlag(
    core.getInput('footer-enabled'),
    false
  );
  const footerText = core.getInput('footer-text').trim();
  const includeTimestamp = parseBooleanFlag(
    core.getInput('footer-include-timestamp'),
    true
  );
  const timestampFormat = parseTimestampFormat(
    core.getInput('footer-timestamp-format') || 'locale'
  );
  const includeRepoLink = parseBooleanFlag(
    core.getInput('footer-include-repo-link'),
    true
  );

  return {
    enabled,
    footerText,
    includeTimestamp,
    timestampFormat,
    includeRepoLink,
  };
}
