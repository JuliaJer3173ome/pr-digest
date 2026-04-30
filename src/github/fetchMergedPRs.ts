import * as github from '@actions/github';

export interface PRLabel {
  name: string;
}

export interface PRUser {
  login: string;
}

export interface PullRequest {
  number: number;
  title: string;
  html_url: string;
  merged_at: string;
  user: PRUser;
  labels: PRLabel[];
}

export function getWeekRange(referenceDate: Date = new Date()): { start: Date; end: Date } {
  const day = referenceDate.getDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function fetchMergedPRs(
  token: string,
  owner: string,
  repo: string,
  since: Date,
  until: Date
): Promise<PullRequest[]> {
  const octokit = github.getOctokit(token);
  const sinceISO = since.toISOString();
  const untilISO = until.toISOString();

  const prs: PullRequest[] = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'closed',
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    const merged = data.filter(
      (pr) =>
        pr.merged_at !== null &&
        pr.merged_at >= sinceISO &&
        pr.merged_at <= untilISO
    );

    prs.push(
      ...merged.map((pr) => ({
        number: pr.number,
        title: pr.title,
        html_url: pr.html_url,
        merged_at: pr.merged_at as string,
        user: { login: pr.user?.login ?? 'unknown' },
        labels: pr.labels.map((l) => ({ name: l.name ?? '' })),
      }))
    );

    const oldestUpdated = data[data.length - 1].updated_at;
    if (oldestUpdated < sinceISO) break;
    page++;
  }

  return prs;
}
