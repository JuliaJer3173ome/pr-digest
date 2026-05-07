import * as core from '@actions/core';

export type WebhookMethod = 'POST' | 'PUT';

export interface WebhookConfig {
  enabled: boolean;
  url: string | null;
  method: WebhookMethod;
  secret: string | null;
  headers: Record<string, string>;
  includeRawDigest: boolean;
}

export function parseWebhookMethod(value: string): WebhookMethod {
  const upper = value.trim().toUpperCase();
  if (upper === 'PUT') return 'PUT';
  if (upper === 'POST' || upper === '') return 'POST';
  throw new Error(`Invalid webhook method: "${value}". Expected POST or PUT.`);
}

export function parseWebhookHeaders(value: string): Record<string, string> {
  if (!value.trim()) return {};
  const headers: Record<string, string> = {};
  for (const entry of value.split(',')) {
    const colonIdx = entry.indexOf(':');
    if (colonIdx === -1) {
      throw new Error(`Invalid header entry: "${entry.trim()}". Expected "Key: Value" format.`);
    }
    const key = entry.slice(0, colonIdx).trim();
    const val = entry.slice(colonIdx + 1).trim();
    if (!key) throw new Error(`Header key cannot be empty in entry: "${entry.trim()}"`);
    headers[key] = val;
  }
  return headers;
}

export function parseBooleanFlag(value: string, defaultValue: boolean): boolean {
  if (!value.trim()) return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

export function loadWebhookConfig(): WebhookConfig {
  const url = core.getInput('webhook_url').trim() || null;
  const enabled = url !== null && parseBooleanFlag(core.getInput('webhook_enabled'), true);
  const method = parseWebhookMethod(core.getInput('webhook_method'));
  const secret = core.getInput('webhook_secret').trim() || null;
  const headers = parseWebhookHeaders(core.getInput('webhook_headers'));
  const includeRawDigest = parseBooleanFlag(core.getInput('webhook_include_raw'), false);

  return { enabled, url, method, secret, headers, includeRawDigest };
}
