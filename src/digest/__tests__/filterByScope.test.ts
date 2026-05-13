import {
  extractScope,
  matchesIncludeScopes,
  matchesExcludeScopes,
  filterByScope,
} from "../filterByScope";
import { ScopeConfig } from "../../config/scopeConfig";

const makeConfig = (overrides: Partial<ScopeConfig> = {}): ScopeConfig => ({
  enabled: true,
  mode: "include",
  scopes: ["auth", "api"],
  caseSensitive: false,
  ...overrides,
});

const makePR = (title: string, number = 1) => ({ title, number });

describe("extractScope", () => {
  it("extracts scope from conventional commit title", () => {
    expect(extractScope("feat(auth): add login flow")).toBe("auth");
  });

  it("returns null for title without scope", () => {
    expect(extractScope("fix: correct typo")).toBeNull();
  });

  it("returns null for non-conventional title", () => {
    expect(extractScope("Update readme")).toBeNull();
  });

  it("handles multi-word scopes", () => {
    expect(extractScope("chore(ci-cd): update pipeline")).toBe("ci-cd");
  });
});

describe("matchesIncludeScopes", () => {
  it("returns true when scope is in include list", () => {
    const pr = makePR("feat(auth): add login");
    expect(matchesIncludeScopes(pr, makeConfig())).toBe(true);
  });

  it("returns false when scope is not in include list", () => {
    const pr = makePR("feat(ui): redesign button");
    expect(matchesIncludeScopes(pr, makeConfig())).toBe(false);
  });

  it("returns false when title has no scope", () => {
    const pr = makePR("fix: remove unused import");
    expect(matchesIncludeScopes(pr, makeConfig())).toBe(false);
  });

  it("is case-insensitive by default", () => {
    const pr = makePR("feat(AUTH): something");
    expect(matchesIncludeScopes(pr, makeConfig())).toBe(true);
  });

  it("respects case sensitivity when enabled", () => {
    const pr = makePR("feat(AUTH): something");
    expect(matchesIncludeScopes(pr, makeConfig({ caseSensitive: true }))).toBe(false);
  });
});

describe("matchesExcludeScopes", () => {
  it("returns false when scope is in exclude list", () => {
    const pr = makePR("feat(auth): add login");
    expect(matchesExcludeScopes(pr, makeConfig({ mode: "exclude" }))).toBe(false);
  });

  it("returns true when scope is not in exclude list", () => {
    const pr = makePR("feat(ui): redesign");
    expect(matchesExcludeScopes(pr, makeConfig({ mode: "exclude" }))).toBe(true);
  });

  it("returns true when title has no scope", () => {
    const pr = makePR("chore: bump deps");
    expect(matchesExcludeScopes(pr, makeConfig({ mode: "exclude" }))).toBe(true);
  });
});

describe("filterByScope", () => {
  const prs = [
    makePR("feat(auth): login", 1),
    makePR("feat(api): endpoint", 2),
    makePR("feat(ui): button", 3),
    makePR("chore: update deps", 4),
  ];

  it("filters to only included scopes", () => {
    const result = filterByScope(prs, makeConfig({ mode: "include" }));
    expect(result.map((p) => p.number)).toEqual([1, 2]);
  });

  it("excludes specified scopes", () => {
    const result = filterByScope(prs, makeConfig({ mode: "exclude" }));
    expect(result.map((p) => p.number)).toEqual([3, 4]);
  });

  it("returns all PRs when disabled", () => {
    const result = filterByScope(prs, makeConfig({ enabled: false }));
    expect(result).toHaveLength(4);
  });

  it("returns all PRs when mode is none", () => {
    const result = filterByScope(prs, makeConfig({ mode: "none" }));
    expect(result).toHaveLength(4);
  });

  it("returns all PRs when scopes list is empty", () => {
    const result = filterByScope(prs, makeConfig({ scopes: [] }));
    expect(result).toHaveLength(4);
  });
});
