import { parseWebhookMethod, parseWebhookHeaders, parseBooleanFlag, loadWebhookConfig } from '../webhookConfig';
import * as core from '@actions/core';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(overrides: Record<string, string> = {}): void {
  const defaults: Record<string, string> = {
    webhook_url: '',
    webhook_enabled: '',
    webhook_method: '',
    webhook_secret: '',
    webhook_headers: '',
    webhook_include_raw: '',
  };
  const merged = { ...defaults, ...overrides };
  mockGetInput.mockImplementation((key: string) => merged[key] ?? '');
}

describe('parseWebhookMethod', () => {
  it('defaults to POST for empty string', () => {
    expect(parseWebhookMethod('')).toBe('POST');
  });

  it('parses POST case-insensitively', () => {
    expect(parseWebhookMethod('post')).toBe('POST');
  });

  it('parses PUT', () => {
    expect(parseWebhookMethod('PUT')).toBe('PUT');
  });

  it('throws on invalid method', () => {
    expect(() => parseWebhookMethod('PATCH')).toThrow('Invalid webhook method');
  });
});

describe('parseWebhookHeaders', () => {
  it('returns empty object for empty string', () => {
    expect(parseWebhookHeaders('')).toEqual({});
  });

  it('parses single header', () => {
    expect(parseWebhookHeaders('X-Token: abc123')).toEqual({ 'X-Token': 'abc123' });
  });

  it('parses multiple headers', () => {
    expect(parseWebhookHeaders('X-A: 1, X-B: 2')).toEqual({ 'X-A': '1', 'X-B': '2' });
  });

  it('throws on missing colon', () => {
    expect(() => parseWebhookHeaders('BadHeader')).toThrow('Invalid header entry');
  });

  it('throws on empty key', () => {
    expect(() => parseWebhookHeaders(': value')).toThrow('Header key cannot be empty');
  });
});

describe('loadWebhookConfig', () => {
  it('returns disabled config when url is empty', () => {
    setupInputs();
    const config = loadWebhookConfig();
    expect(config.enabled).toBe(false);
    expect(config.url).toBeNull();
  });

  it('returns enabled config with url', () => {
    setupInputs({ webhook_url: 'https://example.com/hook' });
    const config = loadWebhookConfig();
    expect(config.enabled).toBe(true);
    expect(config.url).toBe('https://example.com/hook');
    expect(config.method).toBe('POST');
  });

  it('respects webhook_enabled false', () => {
    setupInputs({ webhook_url: 'https://example.com/hook', webhook_enabled: 'false' });
    const config = loadWebhookConfig();
    expect(config.enabled).toBe(false);
  });

  it('loads secret and headers', () => {
    setupInputs({ webhook_url: 'https://example.com/hook', webhook_secret: 'mysecret', webhook_headers: 'X-Custom: val' });
    const config = loadWebhookConfig();
    expect(config.secret).toBe('mysecret');
    expect(config.headers).toEqual({ 'X-Custom': 'val' });
  });
});
