import { PRDigestConfig } from './loadConfig';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConfig(config: PRDigestConfig): ValidationResult {
  const errors: string[] = [];

  if (!config.githubToken) {
    errors.push('githubToken is required.');
  }

  if (!config.owner) {
    errors.push('owner is required.');
  }

  if (!config.repo) {
    errors.push('repo is required.');
  }

  if (config.weekOffsetDays !== undefined && (isNaN(config.weekOffsetDays) || config.weekOffsetDays < 0)) {
    errors.push('weekOffsetDays must be a non-negative integer.');
  }

  if (config.smtpPort !== undefined && (isNaN(config.smtpPort) || config.smtpPort < 1 || config.smtpPort > 65535)) {
    errors.push('smtpPort must be a valid port number between 1 and 65535.');
  }

  if (config.emailRecipients && config.emailRecipients.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    config.emailRecipients.forEach((email) => {
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email address: "${email}".`);
      }
    });

    if (!config.smtpHost) {
      errors.push('smtpHost is required when email-recipients are provided.');
    }

    if (!config.emailFrom) {
      errors.push('emailFrom is required when email-recipients are provided.');
    }
  }

  if (!config.slackWebhookUrl && (!config.emailRecipients || config.emailRecipients.length === 0)) {
    errors.push('At least one notification channel (Slack or email) must be configured.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
