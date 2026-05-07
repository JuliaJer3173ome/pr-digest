import * as crypto from 'crypto';
import { WebhookConfig } from '../config/webhookConfig';

export interface WebhookPayload {
  digest: string;
  stats: Record<string, unknown>;
  generatedAt: string;
  rawDigest?: string;
}

export function buildSignatureHeader(
  body: string,
  secret: string
): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
}

export async function sendWebhook(
  config: WebhookConfig,
  payload: WebhookPayload
): Promise<void> {
  if (!config.enabled || !config.url) {
    return;
  }

  const body = JSON.stringify(payload);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  if (config.secret) {
    headers['X-Hub-Signature-256'] = buildSignatureHeader(body, config.secret);
  }

  const response = await fetch(config.url, {
    method: config.method,
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Webhook request failed: ${response.status} ${response.statusText} — ${config.url}`
    );
  }
}

export function buildWebhookPayload(
  digest: string,
  stats: Record<string, unknown>,
  config: WebhookConfig
): WebhookPayload {
  const payload: WebhookPayload = {
    digest,
    stats,
    generatedAt: new Date().toISOString(),
  };
  if (config.includeRawDigest) {
    payload.rawDigest = digest;
  }
  return payload;
}
