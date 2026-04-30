import { WebClient } from "@slack/web-api";

export interface SlackConfig {
  token: string;
  channel: string;
}

export interface SlackResult {
  ok: boolean;
  ts?: string;
  error?: string;
}

export async function sendSlack(
  config: SlackConfig,
  text: string
): Promise<SlackResult> {
  if (!config.token) {
    throw new Error("Slack token is required");
  }
  if (!config.channel) {
    throw new Error("Slack channel is required");
  }

  const client = new WebClient(config.token);

  try {
    const response = await client.chat.postMessage({
      channel: config.channel,
      text,
      mtype: "mrkdwn",
    });

    return {
      ok: response.ok ?? false,
      ts: response.ts,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
