import * as core from '@actions/core';

export interface PRDigestConfig {
  githubToken: string;
  repo: string;
  owner: string;
  slackWebhookUrl?: string;
  emailRecipients?: string[];
  emailFrom?: string;
  smtpHost?: string;
  smtpPort?: number;
  weekOffsetDays?: number;
  includeLabels?: string[];
  excludeLabels?: string[];
}

export function loadConfig(): PRDigestConfig {
  const githubToken = core.getInput('github-token', { required: true });
  const repoFullName = core.getInput('repo', { required: true });

  const [owner, repo] = repoFullName.split('/');
  if (!owner || !repo) {
    throw new Error(`Invalid repo format "${repoFullName}". Expected "owner/repo".`);
  }

  const slackWebhookUrl = core.getInput('slack-webhook-url') || undefined;

  const emailRecipientsRaw = core.getInput('email-recipients');
  const emailRecipients = emailRecipientsRaw
    ? emailRecipientsRaw.split(',').map((e) => e.trim()).filter(Boolean)
    : undefined;

  const emailFrom = core.getInput('email-from') || undefined;
  const smtpHost = core.getInput('smtp-host') || undefined;
  const smtpPortRaw = core.getInput('smtp-port');
  const smtpPort = smtpPortRaw ? parseInt(smtpPortRaw, 10) : undefined;

  const weekOffsetRaw = core.getInput('week-offset-days');
  const weekOffsetDays = weekOffsetRaw ? parseInt(weekOffsetRaw, 10) : 0;

  const includeLabelsRaw = core.getInput('include-labels');
  const includeLabels = includeLabelsRaw
    ? includeLabelsRaw.split(',').map((l) => l.trim()).filter(Boolean)
    : undefined;

  const excludeLabelsRaw = core.getInput('exclude-labels');
  const excludeLabels = excludeLabelsRaw
    ? excludeLabelsRaw.split(',').map((l) => l.trim()).filter(Boolean)
    : undefined;

  if (!slackWebhookUrl && (!emailRecipients || emailRecipients.length === 0)) {
    throw new Error('At least one notification channel must be configured: slack-webhook-url or email-recipients.');
  }

  return {
    githubToken,
    repo,
    owner,
    slackWebhookUrl,
    emailRecipients,
    emailFrom,
    smtpHost,
    smtpPort,
    weekOffsetDays,
    includeLabels,
    excludeLabels,
  };
}
