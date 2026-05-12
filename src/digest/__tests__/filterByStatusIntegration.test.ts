import * as core from '@actions/core';
import { loadStatusConfig } from '../../config/statusConfig';
import { filterByStatus, StatusablePR } from '../filterByStatus';

jest.mock('@actions/core');

function setupInputs(inputs: Record<string, string>) {
  (core.getInput as jest.Mock).mockImplementation((key: string) => inputs[key] ?? '');
}

function makePR(overrides: Partial<StatusablePR> = {}): StatusablePR {
  return {
    merged_at: null,
    closed_at: null,
    state: 'open',
    ...overrides,
  };
}

describe('filterByStatus integration', () => {
  const prs: StatusablePR[] = [
    makePR({ state: 'open' }),
    makePR({ merged_at: '2024-03-01T00:00:00Z', state: 'closed' }),
    makePR({ state: 'closed' }),
    makePR({ merged_at: '2024-03-05T00:00:00Z', state: 'closed' }),
  ];

  it('keeps only merged PRs when include is merged', () => {
    setupInputs({ status_include: 'merged', status_filter_enabled: 'true' });
    const config = loadStatusConfig();
    const result = filterByStatus(prs, config);
    expect(result).toHaveLength(2);
    result.forEach((pr) => expect(pr.merged_at).not.toBeNull());
  });

  it('excludes closed (non-merged) PRs', () => {
    setupInputs({ status_exclude: 'closed', status_filter_enabled: 'true' });
    const config = loadStatusConfig();
    // closed without merged_at should be excluded; merged ones have merged_at so status = merged
    const result = filterByStatus(prs, config);
    expect(result).toHaveLength(3); // open + 2 merged
  });

  it('returns all PRs when filter is disabled', () => {
    setupInputs({ status_filter_enabled: 'false' });
    const config = loadStatusConfig();
    const result = filterByStatus(prs, config);
    expect(result).toHaveLength(4);
  });

  it('returns all PRs when no filters specified', () => {
    setupInputs({});
    const config = loadStatusConfig();
    const result = filterByStatus(prs, config);
    expect(result).toHaveLength(4);
  });
});
