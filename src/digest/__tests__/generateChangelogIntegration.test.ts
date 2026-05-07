import * as core from '@actions/core';
import { loadChangelogConfig } from '../../config/changelogConfig';
import { generateChangelog, PREntry } from '../generateChangelog';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

const samplePRs: PREntry[] = [
  { number: 10, title: 'Improve performance', author: 'carol', labels: ['enhancement'], repo: 'org/core', url: 'https://github.com/org/core/pull/10' },
  { number: 11, title: 'Fix memory leak', author: 'dave', labels: ['bugfix'], repo: 'org/core', url: 'https://github.com/org/core/pull/11' },
  { number: 12, title: 'Drop v1 support', author: 'carol', labels: ['breaking-change'], repo: 'org/core', url: 'https://github.com/org/core/pull/12' },
];

describe('generateChangelog integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('produces no output when changelog is disabled via config', () => {
    setupInputs({ changelog_enabled: 'false' });
    const config = loadChangelogConfig();
    const result = generateChangelog(samplePRs, config);
    expect(result).toBe('');
  });

  it('produces grouped changelog when enabled', () => {
    setupInputs({
      changelog_enabled: 'true',
      changelog_group_by: 'label',
      changelog_style: 'bullet',
      changelog_include_breaking: 'true',
      changelog_header_prefix: '##',
    });
    const config = loadChangelogConfig();
    const result = generateChangelog(samplePRs, config);
    expect(result).toContain('## enhancement');
    expect(result).toContain('## bugfix');
    expect(result).toContain('## breaking-change');
    expect(result).toContain('Improve performance');
  });

  it('excludes breaking changes when configured', () => {
    setupInputs({
      changelog_enabled: 'true',
      changelog_include_breaking: 'false',
      changelog_breaking_label: 'breaking-change',
    });
    const config = loadChangelogConfig();
    const result = generateChangelog(samplePRs, config);
    expect(result).not.toContain('Drop v1 support');
    expect(result).toContain('Improve performance');
    expect(result).toContain('Fix memory leak');
  });

  it('groups by author when configured', () => {
    setupInputs({
      changelog_enabled: 'true',
      changelog_group_by: 'author',
      changelog_style: 'numbered',
    });
    const config = loadChangelogConfig();
    const result = generateChangelog(samplePRs, config);
    expect(result).toContain('## carol');
    expect(result).toContain('## dave');
    expect(result).toMatch(/1\. Improve performance/);
  });
});
