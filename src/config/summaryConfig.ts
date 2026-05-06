import * as core from '@actions/core';

export type SummaryPosition = 'top' | 'bottom' | 'none';

export interface SummaryConfig {
  includeSummary: boolean;
  summaryPosition: SummaryPosition;
  showTotalCount: boolean;
  showAuthorCount: boolean;
  showLabelBreakdown: boolean;
}

export function parseSummaryPosition(value: string): SummaryPosition {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'top' || normalized === 'bottom' || normalized === 'none') {
    return normalized;
  }
  throw new Error(`Invalid summary position: "${value}". Expected 'top', 'bottom', or 'none'.`);
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (value === '') return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  throw new Error(`Invalid boolean value: "${value}".`);
}

export function loadSummaryConfig(): SummaryConfig {
  const includeSummaryRaw = core.getInput('include_summary');
  const summaryPositionRaw = core.getInput('summary_position');
  const showTotalCountRaw = core.getInput('summary_show_total_count');
  const showAuthorCountRaw = core.getInput('summary_show_author_count');
  const showLabelBreakdownRaw = core.getInput('summary_show_label_breakdown');

  const includeSummary = parseBooleanFlag(includeSummaryRaw, true);
  const summaryPosition = summaryPositionRaw
    ? parseSummaryPosition(summaryPositionRaw)
    : 'top';

  return {
    includeSummary,
    summaryPosition,
    showTotalCount: parseBooleanFlag(showTotalCountRaw, true),
    showAuthorCount: parseBooleanFlag(showAuthorCountRaw, true),
    showLabelBreakdown: parseBooleanFlag(showLabelBreakdownRaw, false),
  };
}
