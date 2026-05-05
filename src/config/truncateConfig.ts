import * as core from "@actions/core";

export interface TruncateConfig {
  slackMaxLength: number;
  emailMaxLength: number;
  preserveSections: boolean;
}

const SLACK_DEFAULT_MAX = 3000;
const EMAIL_DEFAULT_MAX = 100000;

function parsePositiveInt(value: string, fallback: number, name: string): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    core.warning(`Invalid value for ${name}: "${value}". Using default: ${fallback}.`);
    return fallback;
  }
  return parsed;
}

/**
 * Loads truncation configuration from GitHub Actions inputs.
 */
export function loadTruncateConfig(): TruncateConfig {
  const slackMaxRaw = core.getInput("slack_max_length");
  const emailMaxRaw = core.getInput("email_max_length");
  const preserveRaw = core.getInput("truncate_preserve_sections");

  const slackMaxLength = parsePositiveInt(slackMaxRaw, SLACK_DEFAULT_MAX, "slack_max_length");
  const emailMaxLength = parsePositiveInt(emailMaxRaw, EMAIL_DEFAULT_MAX, "email_max_length");
  const preserveSections = preserveRaw.toLowerCase() !== "false";

  return { slackMaxLength, emailMaxLength, preserveSections };
}
