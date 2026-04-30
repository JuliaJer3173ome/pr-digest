import { sendEmail, EmailConfig } from "../sendEmail";

const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({ sendMail: mockSendMail }));

jest.mock("nodemailer", () => ({
  createTransport: (opts: unknown) => mockCreateTransport(opts),
}));

const baseConfig: EmailConfig = {
  smtpHost: "smtp.example.com",
  smtpPort: 587,
  smtpUser: "user@example.com",
  smtpPass: "secret",
  from: "bot@example.com",
  to: "team@example.com",
};

const markdownBody = "## Weekly PR Digest\n- fix: correct typo (#7)";

describe("sendEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends an email and returns ok with messageId", async () => {
    mockSendMail.mockResolvedValueOnce({ messageId: "<abc@smtp.example.com>" });

    const result = await sendEmail(baseConfig, markdownBody);

    expect(result.ok).toBe(true);
    expect(result.messageId).toBe("<abc@smtp.example.com>");
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "team@example.com",
        subject: "Weekly PR Digest",
        text: markdownBody,
      })
    );
  });

  it("uses a custom subject when provided", async () => {
    mockSendMail.mockResolvedValueOnce({ messageId: "<xyz@smtp>" });
    const config = { ...baseConfig, subject: "Sprint 42 Digest" };

    await sendEmail(config, markdownBody);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Sprint 42 Digest" })
    );
  });

  it("returns ok: false with error when transport throws", async () => {
    mockSendMail.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const result = await sendEmail(baseConfig, markdownBody);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("ECONNREFUSED");
  });

  it("throws when recipient is missing", async () => {
    await expect(
      sendEmail({ ...baseConfig, to: "" }, markdownBody)
    ).rejects.toThrow("Email recipient (to) is required");
  });
});
