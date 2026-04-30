import { fetchMergedPRs, getWeekRange, MergedPR } from "../fetchMergedPRs";
import { Octokit } from "@octokit/rest";

const mockSearchIssuesAndPullRequests = jest.fn();

const mockOctokit = {
  rest: {
    search: {
      issuesAndPullRequests: mockSearchIssuesAndPullRequests,
    },
  },
} as unknown as Octokit;

const makeMockItem = (overrides = {}) => ({
  number: 42,
  title: "feat: add new feature",
  user: { login: "dev-user" },
  pull_request: { merged_at: "2024-01-15T10:00:00Z" },
  html_url: "https://github.com/owner/repo/pull/42",
  labels: [{ name: "enhancement" }, { name: "bug" }],
  body: "This PR adds a new feature.",
  ...overrides,
});

describe("fetchMergedPRs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mapped PRs from search results", async () => {
    mockSearchIssuesAndPullRequests.mockResolvedValue({
      data: { items: [makeMockItem()] },
    });

    const result = await fetchMergedPRs(mockOctokit, {
      owner: "owner",
      repo: "repo",
      since: new Date("2024-01-08T00:00:00Z"),
      until: new Date("2024-01-15T00:00:00Z"),
    });

    expect(result).toHaveLength(1);
    const pr: MergedPR = result[0];
    expect(pr.number).toBe(42);
    expect(pr.title).toBe("feat: add new feature");
    expect(pr.author).toBe("dev-user");
    expect(pr.labels).toEqual(["enhancement", "bug"]);
    expect(pr.url).toBe("https://github.com/owner/repo/pull/42");
  });

  it("handles missing user gracefully", async () => {
    mockSearchIssuesAndPullRequests.mockResolvedValue({
      data: { items: [makeMockItem({ user: null })] },
    });

    const result = await fetchMergedPRs(mockOctokit, {
      owner: "owner",
      repo: "repo",
      since: new Date("2024-01-08T00:00:00Z"),
    });

    expect(result[0].author).toBe("unknown");
  });

  it("returns empty array when no PRs found", async () => {
    mockSearchIssuesAndPullRequests.mockResolvedValue({
      data: { items: [] },
    });

    const result = await fetchMergedPRs(mockOctokit, {
      owner: "owner",
      repo: "repo",
      since: new Date("2024-01-08T00:00:00Z"),
    });

    expect(result).toHaveLength(0);
  });
});

describe("getWeekRange", () => {
  it("returns a range of 7 days ending at the reference date", () => {
    const reference = new Date("2024-01-15T12:00:00Z");
    const { since, until } = getWeekRange(reference);

    expect(until.toISOString()).toBe(reference.toISOString());
    const diffMs = until.getTime() - since.getTime();
    expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("defaults to current date when no argument provided", () => {
    const before = Date.now();
    const { until } = getWeekRange();
    const after = Date.now();

    expect(until.getTime()).toBeGreaterThanOrEqual(before);
    expect(until.getTime()).toBeLessThanOrEqual(after);
  });
});
