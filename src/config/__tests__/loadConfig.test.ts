import * as core from '@actions/core';
import { loadConfig } from '../loadConfig';
import { validateConfig } from '../validateConfig';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    'github-token': 'ghp_testtoken',
    'repo': 'myorg/myrepo',
    'slack-webhook-url': 'https://hooks.slack.com/services/test',
    'email-recipients': '',
    'email-from': '',
    'smtp-host': '',
    'smtp-port': '',
    'week-offset-days': '',
    'include-labels': '',
    'exclude-labels': '',
  };
  const inputs = { ...defaults, ...overrides };
  mockGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('loadConfig', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads a valid Slack-only config', () => {
    setupInputs();
    const config = loadConfig();
    expect(config.owner).toBe('myorg');
    expect(config.repo).toBe('myrepo');
    expect(config.slackWebhookUrl).toBe('https://hooks.slack.com/services/test');
    expect(config.weekOffsetDays).toBe(0);
  });

  it('parses email recipients and labels', () => {
    setupInputs({
      'slack-webhook-url': '',
      'email-recipients': 'a@example.com, b@example.com',
      'email-from': 'digest@example.com',
      'smtp-host': 'smtp.example.com',
      'include-labels': 'feature, bugfix',
      'exclude-labels': 'wip',
    });
    const config = loadConfig();
    expect(config.emailRecipients).toEqual(['a@example.com', 'b@example.com']);
    expect(config.includeLabels).toEqual(['feature', 'bugfix']);
    expect(config.excludeLabels).toEqual(['wip']);
  });

  it('throws when repo format is invalid', () => {
    setupInputs({ 'repo': 'invalidrepo' });
    expect(() => loadConfig()).toThrow('Invalid repo format');
  });

  it('throws when no notification channel is configured', () => {
    setupInputs({ 'slack-webhook-url': '', 'email-recipients': '' });
    expect(() => loadConfig()).toThrow('At least one notification channel');
  });
});

describe('validateConfig', () => {
  const baseConfig = {
    githubToken: 'token',
    owner: 'myorg',
    repo: 'myrepo',
    slackWebhookUrl: 'https://hooks.slack.com/services/test',
  };

  it('returns valid for a correct config', () => {
    const result = validateConfig(baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports invalid email addresses', () => {
    const result = validateConfig({
      ...baseConfig,
      emailRecipients: ['not-an-email'],
      emailFrom: 'from@example.com',
      smtpHost: 'smtp.example.com',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid email address'))).toBe(true);
  });

  it('reports missing smtpHost when email recipients are set', () => {
    const result = validateConfig({
      ...baseConfig,
      emailRecipients: ['user@example.com'],
      emailFrom: 'from@example.com',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('smtpHost is required'))).toBe(true);
  });

  it('reports invalid smtpPort', () => {
    const result = validateConfig({ ...baseConfig, smtpPort: 99999 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('smtpPort'))).toBe(true);
  });
});
