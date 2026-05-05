import * as core from '@actions/core';
import { TemplateFormat, TemplateOptions } from '../digest/templateDigest';

const VALID_FORMATS: TemplateFormat[] = ['default', 'compact', 'detailed'];

export function parseTemplateFormat(value: string): TemplateFormat {
  const trimmed = value.trim().toLowerCase() as TemplateFormat;
  if (!VALID_FORMATS.includes(trimmed)) {
    throw new Error(
      `Invalid template format "${value}". Must be one of: ${VALID_FORMATS.join(', ')}`
    );
  }
  return trimmed;
}

export function parseBooleanOption(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Invalid boolean value "${value}". Must be "true" or "false".`);
}

export function loadTemplateConfig(): Partial<TemplateOptions> {
  const formatRaw = core.getInput('template_format');
  const showStatsRaw = core.getInput('template_show_stats');
  const showDateRaw = core.getInput('template_show_date');

  const config: Partial<TemplateOptions> = {};

  if (formatRaw) {
    config.format = parseTemplateFormat(formatRaw);
  }

  if (showStatsRaw !== '') {
    config.showStats = parseBooleanOption(showStatsRaw, true);
  }

  if (showDateRaw !== '') {
    config.showDate = parseBooleanOption(showDateRaw, true);
  }

  return config;
}
