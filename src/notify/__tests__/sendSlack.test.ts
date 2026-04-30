import { sendSlack, SlackConfig } from "../sendSlack";

const mockPostMessage = jest.fn();

jest.mock("@slack/web-api", () => ({
  WebClient: jest.fn().mockImplementation(() => ({
    chat: { postMessage: mockPostMessage },
  })),
}));

const baseConfig: SlackConfig = {
  token: "xoxb-test-token",
  channel: "#releases",
};

const sampleText = "## Weekly PR Digest\n- feat: add login (#42)";

describe("sendSlack", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("posts a message and returns ok with ts on success", async () => {
    mockPostMessage.mockResolvedValueOnce({ ok: true, ts: "1234567890.000100" });

    const result = await sendSlack(baseConfig, sampleText);

    expect(result.ok).toBe(true);
    expect(result.ts).toBe("1234567890.000100");
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "#releases",
        text: sampleText,
      })
    );
  });

  it("returns ok: false with error message when API throws", async () => {
    mockPostMessage.mockRejectedValueOnce(new Error("channel_not_found"));

    const result = await sendSlack(baseConfig, sampleText);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("channel_not_found");
  });

  it("throws when token is missing", async () => {
    await expect(
      sendSlack({ token: "", channel: "#releases" }, sampleText)
    ).rejects.toThrow("Slack token is required");
  });

  it("throws when channel is missing", async () => {
    await expect(
      sendSlack({ token: "xoxb-test", channel: "" }, sampleText)
    ).rejects.toThrow("Slack channel is required");
  });
});
