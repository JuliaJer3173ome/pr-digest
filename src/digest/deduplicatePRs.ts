/**
 * Deduplication utilities for merged PRs.
 * Removes duplicate PR entries based on PR number, keeping the most recently
 * updated occurrence when duplicates are found.
 */

export interface PRLike {
  number: number;
  updatedAt: string;
  [key: string]: unknown;
}

/**
 * Returns true if the PR number has been seen before.
 */
export function isDuplicate(seen: Set<number>, pr: PRLike): boolean {
  return seen.has(pr.number);
}

/**
 * Given two PRs with the same number, returns the one with the later updatedAt.
 */
export function pickNewer<T extends PRLike>(a: T, b: T): T {
  return new Date(a.updatedAt) >= new Date(b.updatedAt) ? a : b;
}

/**
 * Deduplicates an array of PRs by their number.
 * When duplicates exist the entry with the latest `updatedAt` is retained.
 *
 * @param prs - Array of PR-like objects (may contain duplicates)
 * @returns A new array with duplicates removed
 */
export function deduplicatePRs<T extends PRLike>(prs: T[]): T[] {
  const map = new Map<number, T>();

  for (const pr of prs) {
    const existing = map.get(pr.number);
    if (existing === undefined) {
      map.set(pr.number, pr);
    } else {
      map.set(pr.number, pickNewer(existing, pr));
    }
  }

  return Array.from(map.values());
}
