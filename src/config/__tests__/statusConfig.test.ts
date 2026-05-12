import * as core from '@actions/core';
import {
  parseStatusList,
  parseMatchMode,
  parseBooleanFlag,
  loadStatusConfig,
} from '../statusConfig';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

describe('parseStatusList', () => {
  it('parses comma-separated valid statuses', () => {
    expect(parseStatusList('merged, closed')).toEqual(['merged', 'closed']);
  });

  it('ignores invalid statuses', () => {
    expect(parseStatusList('merged, unknown, open')).toEqual(['merged', 'open']);
  });

  it('returns empty array for empty input', () => {
    expect(parseStatusList('')).toEqual([]);
  });
});

describe('parseMatchMode', () => {
  it('returns all for "all"', () => {
    expect(parseMatchMode('all')).toBe('all');
  });

  it('defaults to any for unknown values', () => {
    expect(parseMatchMode('unknown')).toBe('any');
    expect(parseMatchMode('')).toBe('any');
  });
});

describe('parseBooleanFlag', () => {
  it('returns true for "true"', () => {
    expect(parseBooleanFlag('true')).toBe(true);
  });

  it('returns false for other values', () => {
    expect(parseBooleanFlag('false')).toBe(false);
    expect(parseBooleanFlag('')).toBe(false);
  });
});

describe('loadStatusConfig', () => {
  it('loads full config from inputs', () => {
    setupInputs({
      status_include: 'merged,closed',
      status_exclude: 'open',
      status_match_mode: 'any',
      status_filter_enabled: 'true',
    });
    const config = loadStatusConfig();
    expect(config.includeStatuses).toEqual(['merged', 'closed']);
    expect(config.excludeStatuses).toEqual(['open']);
    expect(config.matchMode).toBe('any');
    expect(config.enabled).toBe(true);
  });

  it('defaults enabled to true when not provided', () => {
    setupInputs({});
    const config = loadStatusConfig();
    expect(config.enabled).toBe(true);
  });

  it('returns empty lists when inputs are blank', () => {
    setupInputs({ status_filter_enabled: 'false' });
    const config = loadStatusConfig();
    expect(config.includeStatuses).toEqual([]);
    expect(config.excludeStatuses).toEqual([]);
    expect(config.enabled).toBe(false);
  });
});
