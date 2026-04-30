import { Octokit } from "@octokit/rest";

export interface MergedPR {
  number: number;
  title: string;
  author: string;
  mergedAt: string;
  url: string;
  labels: string[];
  body: string | null;
}

export interface FetchOptions {
  owner: string;
  repo: string;
  since: Date;
  until?: Date;
}

export async function fetchMergedPRs(
  octokit: Octokit,
  options: FetchOptions
): Promise<MergedPR[]> {
  const { owner, repo, since, until = new Date() } = options;

  const sinceISO = since.toISOString();
  const untilISO = until.toISOString();

  const query = `repo:${owner}/${repo} is:pr is:merged merged:${sinceISO}..${untilISO}`;

  const response = await octokit.rest.search.issuesAndPullRequests({
    q: query,
    sort: "updated",
    order: "desc",
    per_page: 100,
  });

  return response.data.items.map((item) => ({
    number: item.number,
    title: item.title,
    author: item.user?.login ?? "unknown",
    mergedAt: item.pull_request?.merged_at ?? "",
    url: item.html_url,
    labels: item.labels.map((label) =>
      typeof label === "string" ? label : label.name ?? ""
    ),
    body: item.body ?? null,
  }));
}

export function getWeekRange(referenceDate: Date = new Date()): {
  since: Date;
  until: Date;
} {
  const until = new Date(referenceDate);
  const since = new Date(referenceDate);
  since.setDate(since.getDate() - 7);
  return { since, until };
}
