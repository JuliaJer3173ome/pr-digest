import { truncateDigest, splitIntoSections, TruncateOptions } from "../truncateDigest";

const SAMPLE_CONTENT = [
  "# Weekly PR Digest",
  "",
  "## Feature",
  "- PR #1: Add login page",
  "- PR #2: Add logout button",
  "",
  "## Bug Fix",
  "- PR #3: Fix null pointer",
  "",
  "## Chore",
  "- PR #4: Update dependencies",
].join("\n");

describe("splitIntoSections", () => {
  it("splits content into sections by ## headings", () => {
    const sections = splitIntoSections(SAMPLE_CONTENT);
    expect(sections).toHaveLength(4);
    expect(sections[0]).toContain("# Weekly PR Digest");
    expect(sections[1]).toContain("## Feature");
    expect(sections[2]).toContain("## Bug Fix");
    expect(sections[3]).toContain("## Chore");
  });

  it("returns single section when no ## headings", () => {
    const content = "# Title\nSome text here.";
    const sections = splitIntoSections(content);
    expect(sections).toHaveLength(1);
    expect(sections[0]).toBe(content);
  });

  it("handles empty string", () => {
    const sections = splitIntoSections("");
    expect(sections).toHaveLength(1);
    expect(sections[0]).toBe("");
  });
});

describe("truncateDigest", () => {
  it("returns original content when within limit", () => {
    const result = truncateDigest(SAMPLE_CONTENT, { maxLength: 10000 });
    expect(result.truncated).toBe(false);
    expect(result.content).toBe(SAMPLE_CONTENT);
    expect(result.originalLength).toBe(SAMPLE_CONTENT.length);
  });

  it("truncates content exceeding maxLength with section preservation", () => {
    const result = truncateDigest(SAMPLE_CONTENT, { maxLength: 80, preserveSections: true });
    expect(result.truncated).toBe(true);
    expect(result.content.length).toBeLessThanOrEqual(80);
    expect(result.content).toContain("truncated");
  });

  it("truncates content without section preservation", () => {
    const options: TruncateOptions = { maxLength: 50, preserveSections: false, ellipsis: "..." };
    const result = truncateDigest(SAMPLE_CONTENT, options);
    expect(result.truncated).toBe(true);
    expect(result.content.length).toBeLessThanOrEqual(50);
    expect(result.content.endsWith("...")).toBe(true);
  });

  it("uses custom ellipsis", () => {
    const ellipsis = "\n[truncated]";
    const result = truncateDigest(SAMPLE_CONTENT, { maxLength: 60, ellipsis });
    expect(result.content).toContain("[truncated]");
  });

  it("preserves originalLength regardless of truncation", () => {
    const result = truncateDigest(SAMPLE_CONTENT, { maxLength: 50 });
    expect(result.originalLength).toBe(SAMPLE_CONTENT.length);
  });

  it("returns empty-ish content when maxLength is extremely small", () => {
    const result = truncateDigest(SAMPLE_CONTENT, { maxLength: 10, preserveSections: false, ellipsis: "..." });
    expect(result.truncated).toBe(true);
    expect(result.content.length).toBeLessThanOrEqual(10);
  });
});
