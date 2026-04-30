import * as nodemailer from "nodemailer";

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  from: string;
  to: string;
  subject?: string;
}

export interface EmailResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(
  config: EmailConfig,
  markdownBody: string
): Promise<EmailResult> {
  if (!config.to) {
    throw new Error("Email recipient (to) is required");
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  const subject = config.subject ?? "Weekly PR Digest";

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: config.to,
      subject,
      text: markdownBody,
      html: `<pre style="font-family: monospace">${markdownBody}</pre>`,
    });

    return { ok: true, messageId: info.messageId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
