import { RelatedPRConfig, RelatedPRLinkStyle } from '../config/relatedPRConfig';

export interface LinkablePR {
  number: number;
  title: string;
  url: string;
  body?: string;
  repoFullName?: string;
}

const PR_REF_PATTERN = /(?:^|\s)(?:([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)#|(#))(\d+)/g;

export function extractReferencedPRNumbers(
  body: string,
  currentRepo: string
): Array<{ repo: string; number: number }> {
  const refs: Array<{ repo: string; number: number }> = [];
  let match: RegExpExecArray | null;

  PR_REF_PATTERN.lastIndex = 0;
  while ((match = PR_REF_PATTERN.exec(body)) !== null) {
    const crossRepo = match[1];
    const sameRepo = match[2];
    const num = parseInt(match[3], 10);
    if (crossRepo) {
      refs.push({ repo: crossRepo, number: num });
    } else if (sameRepo) {
      refs.push({ repo: currentRepo, number: num });
    }
  }
  return refs;
}

export function buildRelatedLink(
  ref: { repo: string; number: number },
  style: RelatedPRLinkStyle,
  baseUrl = 'https://github.com'
): string {
  const url = `${baseUrl}/${ref.repo}/pull/${ref.number}`;
  if (style === 'plain' as RelatedPRLinkStyle) return `${ref.repo}#${ref.number}`;
  return `[${ref.repo}#${ref.number}](${url})`;
}

export function renderRelatedPRsInline(
  refs: Array<{ repo: string; number: number }>,
  config: RelatedPRConfig
): string {
  if (refs.length === 0) return '';
  const limited = refs.slice(0, config.maxRelated);
  const links = limited.map(r => buildRelatedLink(r, config.linkStyle));
  return ` — related: ${links.join(', ')}`;
}

export function annotateWithRelatedPRs<T extends LinkablePR>(
  prs: T[],
  config: RelatedPRConfig,
  currentRepo: string
): Array<T & { relatedRefs: Array<{ repo: string; number: number }> }> {
  if (!config.enabled) {
    return prs.map(pr => ({ ...pr, relatedRefs: [] }));
  }

  return prs.map(pr => {
    const body = pr.body ?? '';
    const allRefs = extractReferencedPRNumbers(body, currentRepo);
    const relatedRefs = config.showCrossRepo
      ? allRefs.filter(r => r.number !== pr.number)
      : allRefs.filter(r => r.repo === currentRepo && r.number !== pr.number);
    return { ...pr, relatedRefs: relatedRefs.slice(0, config.maxRelated) };
  });
}
