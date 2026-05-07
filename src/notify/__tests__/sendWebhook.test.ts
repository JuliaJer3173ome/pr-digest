import { buildSignatureHeader, buildWebhookPayload, sendWebhook } from '../sendWebhook';
import { WebhookConfig } from '../../config/webhookConfig';

const baseConfig: WebhookConfig = {
  enabled: true,
  url: 'https://example.com/webhook',
  method: 'POST',
  secret: null,
  headers: {},
  includeRawDigest: false,
};

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('buildSignatureHeader', () => {
  it('produces a sha256 hmac prefixed with sha256=', () => {
    const sig = buildSignatureHeader('hello', 'secret');
    expect(sig).toMatch(/^sha256=[a-f0-9]{64}$/);
  });

  it('produces consistent output for same inputs', () => {
    const a = buildSignatureHeader('body', 'key');
    const b = buildSignatureHeader('body', 'key');
    expect(a).toBe(b);
  });

  it('produces different output for different secrets', () => {
    const a = buildSignatureHeader('body', 'key1');
    const b = buildSignatureHeader('body', 'key2');
    expect(a).not.toBe(b);
  });
});

describe('buildWebhookPayload', () => {
  it('includes digest and stats', () => {
    const payload = buildWebhookPayload('## Digest', { total: 5 }, baseConfig);
    expect(payload.digest).toBe('## Digest');
    expect(payload.stats).toEqual({ total: 5 });
    expect(payload.generatedAt).toBeTruthy();
  });

  it('omits rawDigest when includeRawDigest is false', () => {
    const payload = buildWebhookPayload('## Digest', {}, baseConfig);
    expect(payload.rawDigest).toBeUndefined();
  });

  it('includes rawDigest when includeRawDigest is true', () => {
    const config = { ...baseConfig, includeRawDigest: true };
    const payload = buildWebhookPayload('## Digest', {}, config);
    expect(payload.rawDigest).toBe('## Digest');
  });
});

describe('sendWebhook', () => {
  it('does nothing when disabled', async () => {
    await sendWebhook({ ...baseConfig, enabled: false }, { digest: '', stats: {}, generatedAt: '' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does nothing when url is null', async () => {
    await sendWebhook({ ...baseConfig, url: null }, { digest: '', stats: {}, generatedAt: '' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends POST request with JSON body', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });
    await sendWebhook(baseConfig, { digest: 'hello', stats: {}, generatedAt: '2024-01-01T00:00:00Z' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('adds signature header when secret is set', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });
    const config = { ...baseConfig, secret: 'mysecret' };
    await sendWebhook(config, { digest: 'body', stats: {}, generatedAt: '2024-01-01T00:00:00Z' });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers['X-Hub-Signature-256']).toMatch(/^sha256=/);
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' });
    await expect(
      sendWebhook(baseConfig, { digest: '', stats: {}, generatedAt: '' })
    ).rejects.toThrow('Webhook request failed: 500');
  });
});
