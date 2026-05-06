import * as core from '@actions/core';

export interface TimeRangeConfig {
  since: Date;
  until: Date;
  customRange: boolean;
}

export function parseISODate(value: string, inputName: string): Date {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date for input "${inputName}": "${value}". Expected ISO 8601 format.`);
  }
  return date;
}

export function getDefaultWeekRange(): { since: Date; until: Date } {
  const until = new Date();
  const since = new Date(until);
  since.setDate(since.getDate() - 7);
  return { since, until };
}

export function loadTimeRangeConfig(): TimeRangeConfig {
  const sinceInput = core.getInput('since').trim();
  const untilInput = core.getInput('until').trim();

  if (!sinceInput && !untilInput) {
    const { since, until } = getDefaultWeekRange();
    return { since, until, customRange: false };
  }

  if (sinceInput && !untilInput) {
    const since = parseISODate(sinceInput, 'since');
    const until = new Date();
    return { since, until, customRange: true };
  }

  if (!sinceInput && untilInput) {
    const until = parseISODate(untilInput, 'until');
    const since = new Date(until);
    since.setDate(since.getDate() - 7);
    return { since, until, customRange: true };
  }

  const since = parseISODate(sinceInput, 'since');
  const until = parseISODate(untilInput, 'until');

  if (since >= until) {
    throw new Error(`"since" (${sinceInput}) must be before "until" (${untilInput}).`);
  }

  return { since, until, customRange: true };
}
